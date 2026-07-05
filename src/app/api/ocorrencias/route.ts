import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dispararNotificacaoOcorrencia } from '@/lib/ocorrencia-mailer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const pageRaw = searchParams.get('page');
    const limitRaw = searchParams.get('limit');

    // Single occurrence fetch
    if (id) {
      const occ = await prisma.ocorrencia.findUnique({
        where: { id },
        include: {
          instituicao: { select: { id: true, nome: true } },
          setor: { select: { id: true, nome: true } },
          item: { select: { id: true, nome: true, numeroPatrimonio: true, categoria: true } },
          criadoPor: { select: { id: true, nome: true, email: true } },
          triagemPor: { select: { id: true, nome: true } },
          aprovadoPor: { select: { id: true, nome: true } },
          anexos: true,
          historico: { orderBy: { createdAt: 'desc' } },
        },
      });
      if (!occ) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(formatOccurrence(occ));
    }

    // List with filters
    const where: any = {};
    if (instituicaoId) where.instituicaoId = instituicaoId;
    if (status) where.status = status;

    const page = pageRaw ? Math.max(1, parseInt(pageRaw)) : 1;
    const limit = limitRaw ? Math.max(1, Math.min(100, parseInt(limitRaw))) : 50;
    const skip = (page - 1) * limit;

    const [ocorrencias, total] = await Promise.all([
      prisma.ocorrencia.findMany({
        where,
        include: {
          instituicao: { select: { id: true, nome: true } },
          setor: { select: { id: true, nome: true } },
          item: { select: { id: true, nome: true, numeroPatrimonio: true, categoria: true } },
          criadoPor: { select: { id: true, nome: true } },
          anexos: { select: { id: true, url: true, tipo: true, nomeArquivo: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ocorrencia.count({ where }),
    ]);

    return NextResponse.json({
      data: ocorrencias.map(formatOccurrence),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching ocorrencias:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occurrences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titulo, descricao, tipoSolicitacao, localizacaoDescricao,
      numeroPatrimonioTexto, itemId, instituicaoId, criadoPorId,
      prioridade, setorId, anexos,
    } = body;

    if (!titulo || !descricao || !tipoSolicitacao || !instituicaoId || !criadoPorId) {
      return NextResponse.json(
        { error: 'Missing required fields: titulo, descricao, tipoSolicitacao, instituicaoId, criadoPorId' },
        { status: 400 }
      );
    }

    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        titulo,
        descricao,
        tipoSolicitacao,
        localizacaoDescricao: localizacaoDescricao || null,
        numeroPatrimonioTexto: numeroPatrimonioTexto || null,
        itemId: itemId || null,
        setorId: setorId || null,
        instituicaoId,
        criadoPorId,
        prioridade: prioridade || null,
        status: 'ABERTA',
      },
      include: {
        instituicao: { select: { id: true, nome: true } },
        criadoPor: { select: { id: true, nome: true } },
      },
    });

    if (anexos && anexos.length > 0) {
      await prisma.anexo.createMany({
        data: anexos.map((a: any) => ({
          tipo: a.tipo,
          url: a.url,
          nomeArquivo: a.nomeArquivo,
          mimeType: a.mimeType,
          tamanhoBytes: a.tamanhoBytes,
          ocorrenciaId: ocorrencia.id,
          enviadoPorId: criadoPorId,
        })),
      });
    }

    // Create history entry
    await prisma.historicoOcorrencia.create({
      data: {
        statusNovo: 'ABERTA',
        comentario: 'Ocorrência criada',
        ocorrenciaId: ocorrencia.id,
        autorId: criadoPorId,
      },
    });

    // Disparar notificação de e-mail (não bloqueante)
    if (enviarEmail !== false) {
      dispararNotificacaoOcorrencia({
        ocorrenciaId: ocorrencia.id,
        acao: 'CRIADA',
      });
    }

    return NextResponse.json(formatOccurrence(ocorrencia), { status: 201 });
  } catch (error) {
    console.error('Error creating ocorrencia:', error);
    return NextResponse.json(
      { error: 'Failed to create occurrence' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, anexos, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Fields that can be updated
    const allowedFields = [
      'titulo', 'descricao', 'tipoSolicitacao', 'status', 'prioridade',
      'localizacaoDescricao', 'numeroPatrimonioTexto',
      'observacoesTriagem', 'observacoesMestre', 'motivoRecusa',
      'prestadorServico', 'valorOrcamento',
      'dataVisitaAgendada', 'dataConclusao', 'dataTriagem', 'dataAprovacao',
      'setorId', 'itemId', 'triagemPorId', 'aprovadoPorId',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    // Track status change for history
    const existing = await prisma.ocorrencia.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const statusChanged = data.status && data.status !== existing.status;

    const updated = await prisma.ocorrencia.update({
      where: { id },
      data,
      include: {
        instituicao: { select: { id: true, nome: true } },
        setor: { select: { id: true, nome: true } },
        item: { select: { id: true, nome: true, numeroPatrimonio: true } },
        criadoPor: { select: { id: true, nome: true } },
      },
    });

    if (anexos && anexos.length > 0) {
      // For updates, we usually add new attachments or replace. For simplicity, just create new ones.
      // Filter out existing ones (if they have an id starting with anexo_)
      const newAnexos = anexos.filter((a: any) => a.id.startsWith('anexo_') && a.url.startsWith('data:'));
      if (newAnexos.length > 0) {
        await prisma.anexo.createMany({
          data: newAnexos.map((a: any) => ({
            tipo: a.tipo,
            url: a.url,
            nomeArquivo: a.nomeArquivo,
            mimeType: a.mimeType,
            tamanhoBytes: a.tamanhoBytes,
            ocorrenciaId: id,
            enviadoPorId: updateData.triagemPorId || updateData.aprovadoPorId || existing.criadoPorId,
          })),
        });
      }
    }

    // Create history entry for status change
    if (statusChanged) {
      await prisma.historicoOcorrencia.create({
        data: {
          statusAnterior: existing.status,
          statusNovo: data.status,
          comentario: updateData.observacoesMestre || updateData.observacoesTriagem || null,
          ocorrenciaId: id,
          autorId: updateData.triagemPorId || updateData.aprovadoPorId || existing.criadoPorId,
        },
      });

      // Disparar notificação se for recusa ou correção
      if (updateData.enviarEmail !== false) {
        if (data.status === 'RECUSADA') {
          dispararNotificacaoOcorrencia({
            ocorrenciaId: id,
            acao: 'RECUSADA',
            motivo: data.motivoRecusa || updateData.motivoRecusa,
          });
        } else if (data.status === 'AGUARDANDO_CORRECAO') {
          dispararNotificacaoOcorrencia({
            ocorrenciaId: id,
            acao: 'AGUARDANDO_CORRECAO',
            motivo: data.observacoesTriagem || updateData.observacoesTriagem,
          });
        }
      }
    }

    return NextResponse.json(formatOccurrence(updated));
  } catch (error) {
    console.error('Error updating ocorrencia:', error);
    return NextResponse.json(
      { error: 'Failed to update occurrence' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Delete related records first
    await prisma.anexo.deleteMany({ where: { ocorrenciaId: id } });
    await prisma.historicoOcorrencia.deleteMany({ where: { ocorrenciaId: id } });
    await prisma.notificacao.deleteMany({ where: { ocorrenciaId: id } });
    await prisma.ocorrencia.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ocorrencia:', error);
    return NextResponse.json(
      { error: 'Failed to delete occurrence' },
      { status: 500 }
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOccurrence(occ: any) {
  return {
    id: occ.id,
    numero: occ.numero,
    titulo: occ.titulo,
    descricao: occ.descricao,
    tipoSolicitacao: occ.tipoSolicitacao,
    status: occ.status,
    prioridade: occ.prioridade,
    localizacaoDescricao: occ.localizacaoDescricao,
    numeroPatrimonioTexto: occ.numeroPatrimonioTexto,
    observacoesTriagem: occ.observacoesTriagem,
    observacoesMestre: occ.observacoesMestre,
    motivoRecusa: occ.motivoRecusa,
    prestadorServico: occ.prestadorServico,
    valorOrcamento: occ.valorOrcamento ? Number(occ.valorOrcamento) : null,
    dataVisitaAgendada: occ.dataVisitaAgendada,
    dataConclusao: occ.dataConclusao,
    dataTriagem: occ.dataTriagem,
    dataAprovacao: occ.dataAprovacao,
    createdAt: occ.createdAt,
    updatedAt: occ.updatedAt,
    instituicaoId: occ.instituicaoId,
    setorId: occ.setorId,
    itemId: occ.itemId,
    criadoPorId: occ.criadoPorId,
    triagemPorId: occ.triagemPorId,
    aprovadoPorId: occ.aprovadoPorId,
    anexos: occ.anexos || [],
    historico: occ.historico || [],
    // Extended
    nomeInstituicao: occ.instituicao?.nome,
    nomeSetor: occ.setor?.nome,
    nomeItem: occ.item?.nome,
    numeroPatrimonioItem: occ.item?.numeroPatrimonio,
    categoriaItem: occ.item?.categoria,
    nomeCriador: occ.criadoPor?.nome,
  };
}