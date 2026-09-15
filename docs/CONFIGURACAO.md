# Configuração avançada

O modo inicial usa catálogo seed e não exige banco ou autenticação. Configure os serviços abaixo apenas para ativar suas integrações.

## Banco e autenticação

Copie `.env.example` para `.env.local` e configure `DATABASE_URL`. Para validar diffs de migration, configure também `SHADOW_DATABASE_URL` apontando para um banco separado. Depois:

```bash
npm run db:generate
npm run db:migrate
```

O banco shadow nunca deve ser o banco de produção; ele é usado apenas pelo Prisma para comparar e testar migrations.

O catálogo usa o fallback empacotado por padrão. Depois de aplicar a migration e popular os 17 modelos com `upsertSeedCatalog`, selecione a persistência com:

```env
CATALOG_SOURCE="database"
```

Se o PostgreSQL ficar indisponível, a API identifica a resposta como `seed-fallback` em vez de impedir a abertura do catálogo.

Autenticação fica desligada por padrão. Ative somente após configurar banco e segredo:

```env
AUTH_ENABLED="true"
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
AUTH_TRUSTED_ORIGINS="http://localhost:3000"
AUTH_EMAIL_WEBHOOK_URL="https://seu-provedor.exemplo/auth-email"
AUTH_EMAIL_WEBHOOK_SECRET="..."
```

Ao ativar, o 838 exige segredo forte, banco, origens explícitas e um webhook HTTPS para verificação de e-mail e recuperação de senha. O webhook recebe `{ kind, email, url }` com autenticação Bearer e deve entregar a mensagem sem registrar o link sensível.

## Integrações

- Hugging Face: consulta de metadados públicos.
- OpenRouter: rota preparada; chave opcional em `OPENROUTER_API_KEY`.
- Ollama: benchmark local via browser/localhost após ação explícita.
- LM Studio: adaptador local preparado.

Chamadas para `localhost` devem ocorrer no navegador ou pelo 838 Hardware Agent. O servidor hospedado do 838 nunca deve interpretar `localhost` como a máquina do usuário.


Voltar ao [README](../README.md).
