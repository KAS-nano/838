type AuthEmailKind = "verification" | "password-reset";

export function getAuthConfiguration() {
  const baseURL = process.env.BETTER_AUTH_URL?.trim();
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const emailWebhookUrl = process.env.AUTH_EMAIL_WEBHOOK_URL?.trim();
  const emailWebhookSecret = process.env.AUTH_EMAIL_WEBHOOK_SECRET?.trim();
  if (!baseURL) throw new Error("BETTER_AUTH_URL é obrigatório para ativar autenticação.");
  if (!secret || secret.length < 32 || secret === "replace-with-a-long-random-secret") throw new Error("BETTER_AUTH_SECRET deve ter pelo menos 32 caracteres aleatórios.");
  if (!databaseUrl) throw new Error("DATABASE_URL é obrigatório para ativar autenticação.");
  if (!emailWebhookUrl || !emailWebhookSecret) throw new Error("O provedor de e-mail de autenticação não está configurado.");
  const parsedBase = new URL(baseURL);
  const parsedWebhook = new URL(emailWebhookUrl);
  if (process.env.NODE_ENV === "production" && (parsedBase.protocol !== "https:" || parsedWebhook.protocol !== "https:")) {
    throw new Error("Autenticação em produção exige HTTPS.");
  }
  const trustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS ?? baseURL)
    .split(",")
    .map((origin) => new URL(origin.trim()).origin);
  return { baseURL: parsedBase.origin, secret, trustedOrigins, emailWebhookUrl: parsedWebhook.toString(), emailWebhookSecret };
}

export async function sendAuthEmail(kind: AuthEmailKind, email: string, url: string) {
  const config = getAuthConfiguration();
  const response = await fetch(config.emailWebhookUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.emailWebhookSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ kind, email, url }),
    signal: AbortSignal.timeout(8_000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("O provedor de e-mail recusou a mensagem.");
}
