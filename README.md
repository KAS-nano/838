# 838

Plataforma para recomendar IA local, APIs, runtimes e ferramentas com base no hardware, sistema operacional e objetivo do usuário.

## Estado

Versão estrutural: **1.0.0**. Frontend neon-noir consolidado em **2026-09-06**.

Auditoria e arquivos alterados: [consolidação visual](reports/AUDITORIA-NEON-NOIR.md) e [modelos, comparador e apoio](reports/AUDITORIA-MODELOS-COMPARADOR-APOIO.md). Resultados atuais: [TEST_REPORT.md](TEST_REPORT.md).

O [progresso das melhorias](planning/PROGRESSO.txt) registra percentuais, itens concluídos e evidências. O [roteiro completo](planning/00-INDICE-E-PRIORIDADES.txt) descreve implementação, testes, aceite e reversão por área.

O projeto contém todas as áreas principais planejadas. Integrações que dependem de banco, credenciais, runtime local ou compilador nativo são feature-gated e não fingem estar ativas quando a infraestrutura não existe.

## Núcleo funcional

- onboarding manual de hardware e objetivos;
- dashboard com gauges de VRAM, RAM, armazenamento e t/s;
- catálogo seed de modelos e variantes;
- motor de compatibilidade/ranking;
- estimativa de memória com contexto e offload;
- estimativa de desempenho com estados medido/estimado/seed/heurística e confiança;
- comparador de modelos;
- links oficiais e arquivos por quantização/precisão no Hugging Face;
- apoio opcional por Pix, recolhido na barra lateral;
- catálogo de runtimes, IDEs e ferramentas;
- recomendação local × API;
- força do PC/Notebook e gargalos;
- simulador de upgrades;
- sistemas recomendados;
- Central de Instalação versionada por SO/GPU;
- perfil local exportável/importável;
- Better Auth + PostgreSQL/Prisma preparados e desativados por padrão;
- benchmark local Ollama voluntário;
- submissão comunitária com consentimento e validação;
- agente Tauri/Rust read-only em estrutura separada;
- API de health, catálogo e recomendação;
- preview HTML independente.

## Stack

- Next.js 16.3.3 / React 19 / TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma 7.10
- Better Auth 1.7.2
- Rust + Tauri 2.11.5 para o agente local

## Rodar o site

Requer a versão do Node.js registrada em `.node-version` (Node 22 LTS). Gerenciadores como nvm, fnm e asdf podem selecionar essa versão automaticamente.

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`.

Para build:

```bash
npm run typecheck
npm run lint
npm run build
```

## Colocar no ar

O site está preparado para uma primeira publicação na Vercel sem banco de dados, usando o catálogo empacotado e mantendo autenticação e comunidade desligadas. Execute `npm run deploy:check` e siga o passo a passo em [DEPLOYMENT.md](DEPLOYMENT.md). Depois do deploy, valide o endereço com `npm run deploy:smoke -- https://seu-site.vercel.app`.

## Banco e autenticação

Copie `.env.example` para `.env.local` e configure `DATABASE_URL`. Depois:

```bash
npm run db:generate
npm run db:migrate
```

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

## Preview sem npm

Sirva a pasta por HTTP (módulos JavaScript não funcionam por `file://`):

```bash
python3 -m http.server 8080 -d preview
```

Então abra `http://localhost:8080/home.html` e siga onboarding → salvar → dashboard. O dashboard também abre diretamente em `http://localhost:8080/index.html#dashboard`.

Os previews utilizam os tokens de `preview/theme.css` e o motor/catálogo/validação TypeScript gerados em `preview/engine.mjs`. Depois de alterar os módulos canônicos:

```bash
npm run preview:generate
```

Esse comando também roda automaticamente antes do build.

O preview é uma demonstração navegável e usa dados seed; ele não executa benchmarks reais nem instalações.

## Agente 838

Local: `apps/hardware-agent`.

O agente atual é read-only: detecta dados técnicos locais e não envia nada automaticamente. Requer Rust 1.95+ para `sysinfo 0.39.6`.

## Testes

Os testes puros das Etapas 4–21 podem ser executados com:

```bash
npm run test:stages
```

Testes de regressão e navegador:

```bash
npm run test:engine
npm run build
npx playwright install chromium
npm run test:e2e
```

A configuração de Playwright também aceita `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` e detecta o Brave instalado em `/opt/brave-bin/brave`. Os servidores Next e preview são iniciados pelos testes. Consulte `TEST_REPORT.md` para o que foi executado e `KNOWN_ISSUES.md` para as pendências.

## Princípio do produto

O 838 deve responder de forma transparente:

> Para o meu computador e minha tarefa, o que devo usar, como devo configurar e o que posso esperar de desempenho?

Estimativas devem sempre ser identificadas como estimativas. Resultados medidos têm prioridade.
