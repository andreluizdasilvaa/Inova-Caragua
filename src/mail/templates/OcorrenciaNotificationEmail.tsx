import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import React from 'react';

export type OcorrenciaNotificationEmailProps = {
  numero: number;
  titulo: string;
  status: string;
  motivo: string | null;
  acao: 'CRIADA' | 'RECUSADA' | 'AGUARDANDO_CORRECAO';
};

export default function OcorrenciaNotificationEmail({
  numero,
  titulo,
  status,
  motivo,
  acao,
}: OcorrenciaNotificationEmailProps) {
  const getHeaderTitle = () => {
    switch (acao) {
      case 'CRIADA':
        return `Novo Chamado #${numero} Criado`;
      case 'RECUSADA':
        return `Chamado #${numero} Recusado`;
      case 'AGUARDANDO_CORRECAO':
        return `Chamado #${numero} - Revisão Solicitada`;
      default:
        return `Atualização no Chamado #${numero}`;
    }
  };

  const getBodyText = () => {
    switch (acao) {
      case 'CRIADA':
        return `O chamado "${titulo}" foi criado e está aguardando triagem.`;
      case 'RECUSADA':
        return `O chamado "${titulo}" foi recusado pela equipe Mestre/Triagem.`;
      case 'AGUARDANDO_CORRECAO':
        return `A equipe Mestre/Triagem solicitou uma correção para o chamado "${titulo}".`;
      default:
        return `O chamado "${titulo}" foi atualizado para o status: ${status}.`;
    }
  };

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#f6f6f7",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "40px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e7",
            borderRadius: "12px",
            padding: "40px",
          }}
        >
          <Heading
            style={{
              color: "#18181b",
              fontSize: "20px",
              fontWeight: "600",
              margin: 0,
              marginBottom: "12px",
            }}
          >
            {getHeaderTitle()}
          </Heading>

          <Text
            style={{
              color: "#52525b",
              fontSize: "15px",
              lineHeight: "1.6",
              margin: 0,
              marginBottom: "12px",
            }}
          >
            {getBodyText()}
          </Text>

          {motivo && (
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
              <Text
                style={{
                  color: "#991b1b",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                <strong>Observações: </strong>
                {motivo}
              </Text>
            </div>
          )}

          <Hr
            style={{
              borderColor: "#e5e5e7",
              margin: "28px 0",
            }}
          />

          <Text
            style={{
              color: "#a1a1aa",
              fontSize: "13px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Este é um e-mail automático do sistema Inova-Caraguá.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
