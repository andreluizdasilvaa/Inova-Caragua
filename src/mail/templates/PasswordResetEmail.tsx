import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Heading,
    Button,
    Link,
    Hr,
} from "@react-email/components";

export type PasswordResetEmailProps = {
    resetUrl: string;
    expirationMinutes: number;
};

export default function PasswordResetEmail({
    resetUrl,
    expirationMinutes,
}: PasswordResetEmailProps) {
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
                    {/* HEADER */}
                    <Heading
                        style={{
                            color: "#18181b",
                            fontSize: "20px",
                            fontWeight: "600",
                            margin: 0,
                            marginBottom: "12px",
                        }}
                    >
                        Redefinição de senha
                    </Heading>

                    <Text
                        style={{
                            color: "#52525b",
                            fontSize: "15px",
                            lineHeight: "1.6",
                            margin: 0,
                            marginBottom: "28px",
                        }}
                    >
                        Recebemos uma solicitação para redefinir sua senha. Clique no
                        botão abaixo para escolher uma nova senha. Este link expira em{" "}
                        {expirationMinutes} minuto.
                    </Text>

                    {/* BUTTON */}
                    <Button
                        href={resetUrl}
                        style={{
                            backgroundColor: "#18181b",
                            color: "#ffffff",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            textDecoration: "none",
                            display: "inline-block",
                        }}
                    >
                        Redefinir senha
                    </Button>

                    <Text
                        style={{
                            color: "#a1a1aa",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            margin: 0,
                            marginTop: "24px",
                        }}
                    >
                        Ou copie e cole este link no navegador:
                    </Text>

                    <Link
                        href={resetUrl}
                        style={{
                            color: "#3f3f46",
                            fontSize: "13px",
                            wordBreak: "break-all",
                        }}
                    >
                        {resetUrl}
                    </Link>

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
                        Se você não solicitou essa alteração, pode ignorar este e-mail —
                        sua senha continuará a mesma.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}