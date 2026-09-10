# Publicação do 838

O primeiro lançamento pode funcionar sem banco de dados. Nesse modo, o catálogo seed, o onboarding, o dashboard, o comparador, as recomendações, os links de modelos e o apoio por Pix ficam disponíveis. Autenticação e submissões comunitárias permanecem desligadas.

## 1. Verificação local

Use Node 22 e execute:

```bash
npm ci
npm run deploy:check
```

O comando valida segredos e arquivos gerados, executa tipagem, lint, todas as etapas automatizadas e cria o build de produção.

## 2. Enviar a versão para o GitHub

Revise as alterações, crie um commit e faça push para `main`. A CI em `.github/workflows/ci.yml` precisa concluir os jobs `Quality`, `Pure engines and generated assets`, `Production build`, `PostgreSQL schema` e `Browser`.

## 3. Criar o projeto na Vercel

1. Entre em `https://vercel.com/new` usando sua conta GitHub.
2. Importe o repositório `KAS-nano/838`.
3. Mantenha **Framework Preset: Next.js** e **Root Directory: `.`**.
4. Use `npm run build` como Build Command e `npm ci` como Install Command, ou deixe a detecção automática equivalente.
5. Não configure banco nesta primeira publicação.
6. Cadastre estas variáveis em Production, Preview e Development:

```env
AUTH_ENABLED=false
CATALOG_SOURCE=seed
COMMUNITY_BENCHMARKS_ENABLED=false
TRUST_PROXY_HEADERS=true
```

7. Clique em **Deploy**. A Vercel fornecerá um endereço HTTPS terminado em `.vercel.app`.

Não cadastre o conteúdo real de `.env.local` no GitHub. Quando autenticação e comunidade forem ativadas, `DATABASE_URL`, segredos e URLs devem ser cadastrados somente no painel de variáveis da hospedagem.

## 4. Conferência do endereço público

Depois que o deploy terminar, execute localmente:

```bash
npm run deploy:smoke -- https://SEU-PROJETO.vercel.app
```

O teste confere HTTPS, página inicial, catálogo, endpoint de saúde, headers básicos e ausência do antigo e-mail usado como chave Pix. Depois, abra o site em um celular e confirme navegação, responsividade e o nome apresentado pelo banco ao ler o QR Pix. Não é necessário concluir um pagamento.

## 5. Domínio próprio opcional

O endereço `.vercel.app` já pode ser compartilhado. Para usar um domínio próprio, abra **Project → Settings → Domains**, adicione o domínio e copie exatamente os registros DNS indicados pela Vercel. O certificado HTTPS é provisionado depois que o DNS for validado.

## Variáveis para uma etapa futura

Ative banco, autenticação ou benchmarks comunitários somente depois de provisionar PostgreSQL, aplicar as migrations, configurar a entrega real de e-mails e revisar retenção/moderação. As variáveis exigidas estão documentadas em `.env.example`; não são necessárias para o lançamento inicial.
