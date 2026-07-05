import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/itens/batch
 * 
 * Creates multiple items at once from a spreadsheet import.
 * 
 * Request body:
 * {
 *   items: Array<{
 *     nome: string;
 *     categoria?: string;
 *     numeroPatrimonio?: string;
 *     numeroSerie?: string;
 *     marca?: string;
 *     modelo?: string;
 *     estadoConservacao?: string;
 *     status?: string;
 *     dataAquisicao?: string;
 *     valorAquisicao?: number;
 *     observacoes?: string;
 *   }>;
 *   instituicaoId: string;
 *   cadastradoPorId?: string;
 * }
 * 
 * Response:
 * { created: number; errors: { index: number; message: string }[] }
 */

const VALID_CATEGORIAS = ['INFORMATICA', 'MOBILIARIO', 'ELETRODOMESTICO', 'CONECTIVIDADE', 'PREDIAL', 'OUTRO'];
const VALID_ESTADOS = ['NOVO', 'BOM', 'REGULAR', 'RUIM', 'INSERVIVEL'];
const VALID_STATUS = ['ATIVO', 'EM_MANUTENCAO', 'BAIXADO'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, instituicaoId, cadastradoPorId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!instituicaoId) {
      return NextResponse.json(
        { error: 'instituicaoId is required' },
        { status: 400 }
      );
    }

    if (items.length > 500) {
      return NextResponse.json(
        { error: 'Maximum of 500 items per batch' },
        { status: 400 }
      );
    }

    // Collect all patrimônio numbers from the batch to check for duplicates
    const batchPatrimonios = items
      .map((item: any, idx: number) => ({ value: item.numeroPatrimonio?.trim(), idx }))
      .filter((p: any) => p.value);

    // Check for duplicates within the batch itself
    const seenPatrimonios = new Set<string>();
    const batchDuplicates = new Set<string>();
    for (const p of batchPatrimonios) {
      if (seenPatrimonios.has(p.value)) {
        batchDuplicates.add(p.value);
      }
      seenPatrimonios.add(p.value);
    }

    // Check for duplicates against the database
    const existingItems = batchPatrimonios.length > 0
      ? await prisma.item.findMany({
          where: {
            numeroPatrimonio: {
              in: batchPatrimonios.map((p: any) => p.value),
            },
          },
          select: { numeroPatrimonio: true },
        })
      : [];
    const existingPatrimonios = new Set(existingItems.map((i) => i.numeroPatrimonio));

    // Find or create a default sector for this institution
    let defaultSetorId: string | null = null;
    const existingSetor = await prisma.setor.findFirst({
      where: { instituicaoId, nome: 'Geral' },
    });
    if (existingSetor) {
      defaultSetorId = existingSetor.id;
    } else {
      const newSetor = await prisma.setor.create({
        data: { nome: 'Geral', instituicaoId },
      });
      defaultSetorId = newSetor.id;
    }

    // Validate and create items
    const errors: { index: number; message: string }[] = [];
    let created = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validate required fields
      if (!item.nome || !item.nome.trim()) {
        errors.push({ index: i, message: 'Campo "Nome" é obrigatório' });
        continue;
      }

      // Validate enum values
      const categoria = (item.categoria || 'OUTRO').toUpperCase();
      if (!VALID_CATEGORIAS.includes(categoria)) {
        errors.push({ index: i, message: `Categoria inválida: "${item.categoria}". Valores válidos: ${VALID_CATEGORIAS.join(', ')}` });
        continue;
      }

      const estadoConservacao = (item.estadoConservacao || 'BOM').toUpperCase();
      if (!VALID_ESTADOS.includes(estadoConservacao)) {
        errors.push({ index: i, message: `Estado de conservação inválido: "${item.estadoConservacao}". Valores válidos: ${VALID_ESTADOS.join(', ')}` });
        continue;
      }

      const status = (item.status || 'ATIVO').toUpperCase().replace(/ /g, '_');
      if (!VALID_STATUS.includes(status)) {
        errors.push({ index: i, message: `Status inválido: "${item.status}". Valores válidos: ${VALID_STATUS.join(', ')}` });
        continue;
      }

      // Check patrimônio duplicates
      const pat = item.numeroPatrimonio?.trim();
      if (pat) {
        if (existingPatrimonios.has(pat)) {
          errors.push({ index: i, message: `Nº patrimônio "${pat}" já existe no sistema` });
          continue;
        }
        if (batchDuplicates.has(pat)) {
          errors.push({ index: i, message: `Nº patrimônio "${pat}" está duplicado dentro do lote` });
          continue;
        }
      }

      // Parse date
      let dataAquisicao: Date | null = null;
      if (item.dataAquisicao) {
        const parsed = parseDate(item.dataAquisicao);
        if (!parsed) {
          errors.push({ index: i, message: `Data de aquisição inválida: "${item.dataAquisicao}". Use o formato DD/MM/AAAA` });
          continue;
        }
        dataAquisicao = parsed;
      }

      // Parse value
      let valorAquisicao: number | null = null;
      if (item.valorAquisicao !== undefined && item.valorAquisicao !== null && item.valorAquisicao !== '') {
        const val = typeof item.valorAquisicao === 'string'
          ? parseFloat(item.valorAquisicao.replace(',', '.').replace(/[^\d.]/g, ''))
          : Number(item.valorAquisicao);
        if (isNaN(val)) {
          errors.push({ index: i, message: `Valor de aquisição inválido: "${item.valorAquisicao}"` });
          continue;
        }
        valorAquisicao = val;
      }

      try {
        await prisma.item.create({
          data: {
            nome: item.nome.trim(),
            categoria: categoria as any,
            numeroPatrimonio: pat || null,
            numeroSerie: item.numeroSerie?.trim() || null,
            marca: item.marca?.trim() || null,
            modelo: item.modelo?.trim() || null,
            estadoConservacao: estadoConservacao as any,
            status: status as any,
            dataAquisicao,
            valorAquisicao,
            observacoes: item.observacoes?.trim() || null,
            setorId: defaultSetorId,
            instituicaoId,
            cadastradoPorId: cadastradoPorId || null,
          },
        });
        created++;
        // Add to existing set so subsequent items in the same batch
        // don't conflict with this one
        if (pat) existingPatrimonios.add(pat);
      } catch (err: any) {
        const msg = err?.message?.includes('Unique constraint')
          ? `Nº patrimônio "${pat}" já existe no sistema`
          : `Erro ao criar item: ${err?.message || 'erro desconhecido'}`;
        errors.push({ index: i, message: msg });
      }
    }

    return NextResponse.json({ created, errors }, { status: 201 });
  } catch (error) {
    console.error('Error in batch create:', error);
    return NextResponse.json(
      { error: 'Failed to process batch import' },
      { status: 500 }
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(value: any): Date | null {
  if (!value) return null;

  // If it's already a Date object (from Excel)
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  const str = String(value).trim();

  // Try DD/MM/YYYY format
  const brMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try YYYY-MM-DD (ISO) format
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date;
  }

  // Try Excel serial date number
  const num = Number(str);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    // Excel serial date: days since 1899-12-30
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + num * 86400000);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}
