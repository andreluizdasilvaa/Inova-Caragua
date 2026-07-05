import { resend } from '@/mail/resend';
import OcorrenciaNotificationEmail from '@/mail/templates/OcorrenciaNotificationEmail';
import prisma from '@/lib/prisma';
import { render } from '@react-email/render';
import React from 'react';

type OcorrenciaMailerArgs = {
  ocorrenciaId: string;
  acao: 'CRIADA' | 'RECUSADA' | 'AGUARDANDO_CORRECAO';
  motivo?: string | null;
};

export async function dispararNotificacaoOcorrencia({
  ocorrenciaId,
  acao,
  motivo = null,
}: OcorrenciaMailerArgs) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada. E-mail não enviado.');
      return;
    }

    // 1. Buscar dados da ocorrência, usuário e instituição
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: ocorrenciaId },
      include: {
        criadoPor: { select: { email: true } },
        instituicao: { select: { email: true } },
      },
    });

    if (!ocorrencia) return;

    // 2. Buscar e-mails da equipe MESTRE e TRIAGEM
    const adminUsers = await prisma.usuario.findMany({
      where: {
        papel: { in: ['MESTRE', 'TRIAGEM'] },
        ativo: true,
      },
      select: { email: true },
    });

    // 3. Montar listas de destinatários
    const to: string[] = [];
    if (ocorrencia.instituicao?.email) to.push(ocorrencia.instituicao.email);
    if (ocorrencia.criadoPor?.email) to.push(ocorrencia.criadoPor.email);

    const cc: string[] = adminUsers.map((u) => u.email).filter(Boolean);

    // Evita duplicatas caso um admin seja o criador (raro mas possível)
    const uniqueTo = Array.from(new Set(to));
    const uniqueCc = Array.from(new Set(cc)).filter((email) => !uniqueTo.includes(email));

    if (uniqueTo.length === 0 && uniqueCc.length === 0) {
      console.warn('Nenhum destinatário válido encontrado para notificação.');
      return;
    }

    // Se a instituição/usuário não tiver e-mail, enviamos direto pra equipe
    const finalTo = uniqueTo.length > 0 ? uniqueTo : uniqueCc.slice(0, 1);
    const finalCc = uniqueTo.length > 0 ? uniqueCc : uniqueCc.slice(1);

    // 4. Determinar o Assunto do e-mail
    let subject = `Atualização no Chamado #${ocorrencia.numero}`;
    if (acao === 'CRIADA') subject = `Novo Chamado #${ocorrencia.numero} Criado`;
    if (acao === 'RECUSADA') subject = `Chamado #${ocorrencia.numero} Recusado`;
    if (acao === 'AGUARDANDO_CORRECAO') subject = `Chamado #${ocorrencia.numero} - Revisão Solicitada`;

    // 5. Renderizar o HTML do e-mail usando React Email
    const htmlString = await render(
      React.createElement(OcorrenciaNotificationEmail, {
        numero: ocorrencia.numero,
        titulo: ocorrencia.titulo,
        status: ocorrencia.status,
        motivo: motivo,
        acao: acao,
      })
    );

    // 6. Enviar pelo Resend
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Inova Caraguá <notificacoes@inovacaragua.com.br>',
      to: finalTo,
      cc: finalCc.length > 0 ? finalCc : undefined,
      subject: subject,
      html: htmlString,
    });

    console.log('E-mail enviado:', result);
  } catch (error) {
    console.error('Erro ao disparar e-mail de ocorrência:', error);
  }
}
