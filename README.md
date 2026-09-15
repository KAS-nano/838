<div align="center">

# 838

**A IA certa para a sua máquina.**

Descubra quais modelos combinam com seu hardware, compare configurações e entenda os requisitos antes de instalar.

[Acessar o site](https://838.vercel.app) · [Rodar localmente](#rodar-localmente) · [Progresso](planning/PROGRESSO.txt) · [Permissões do desenvolvedor](permissoes_do_dev.txt) · [Contribuir](#contribuir)

</div>

---

## Do hardware à escolha do modelo

Escolher uma IA local envolve mais do que o tamanho do download. O 838 cruza seu computador, sistema operacional e objetivo com os requisitos de modelos e ferramentas para ajudar nessa decisão.

1. **Informe sua máquina:** CPU, GPU, VRAM, RAM, armazenamento e sistema.
2. **Escolha seu objetivo:** programação, escrita, documentos e outras tarefas.
3. **Compare alternativas:** memória estimada, contexto, compatibilidade e desempenho.
4. **Prepare a instalação:** consulte runtimes, quantizações, fontes oficiais e instruções.

O perfil pode ficar salvo no navegador. A análise inicial funciona sem conta e não instala programas automaticamente.

## O que você encontra

| Área | Para que serve |
| --- | --- |
| Dashboard | Analisar modelo × computador, ajustando quantização e contexto. |
| Modelos | Buscar modelos, consultar arquivos por precisão e guardar favoritos locais. |
| Comparador | Comparar alternativas com filtros, ordenação e métricas; guardar até 10 comparações nomeadas no navegador e exportar/importar configurações em JSON. |
| Recomendações e ferramentas | Comparar opções locais e APIs por cenário, guardar até 10 configurações no navegador e compartilhar somente os parâmetros técnicos. |
| Hardware e upgrades | Entender limitações da máquina e simular alterações de capacidade. |
| Instalação | Consultar receitas por sistema, GPU e runtime, com comandos visíveis. |
| Perfil | Editar, importar e exportar sua configuração local. |

### Estado do projeto

O 838 está em desenvolvimento. O modo inicial utiliza um catálogo **seed**: dados empacotados com a aplicação. Valores de desempenho e memória devem ser interpretados conforme os indicadores de estimativa e confiança da interface.

- **Sem infraestrutura adicional:** catálogo, perfil local, análise, comparação e guias.
- **Dependem de configuração:** PostgreSQL, autenticação, provedores externos e submissões comunitárias.
- **Dependem da máquina do usuário:** benchmark Ollama e agente local Tauri/Rust. O agente tem código separado e suas releases nativas ainda precisam das validações registradas no planejamento.

O preview HTML demonstra a interface e as estimativas; não executa benchmarks reais ou instalações. Consulte as [limitações conhecidas](KNOWN_ISSUES.md) e o [registro de validação](TEST_REPORT.md) para distinguir implementação de teste concluído.

## Rodar localmente

Use a versão do Node indicada em [.node-version](.node-version) e npm. Na raiz do projeto:

```bash
npm ci
npm run dev
```

Abra **http://localhost:3000**. O modo seed não precisa de PostgreSQL nem de chaves de API.

Para personalizar variáveis, copie `.env.example` para `.env.local`, sem sobrescrever configurações locais existentes. O exemplo mantém autenticação e comunidade desativadas. Não publique `.env.local`.

### Build de produção

```bash
npm run build
npm run start
```

### Preview com Live Server ou Python

No VS Code, abra `preview/home.html` e use **Open with Live Server**. Alternativamente:

```bash
python3 -m http.server 8080 -d preview
```

Abra **http://localhost:8080/home.html**. Para ver a aplicação Next completa, use `npm run dev`; o Live Server serve somente o preview estático.

Depois de alterar os módulos canônicos do catálogo ou motor, execute `npm run preview:generate`. A geração também ocorre antes do build.

## Estrutura

```text
src/
  app/                 Páginas Next e endpoints
  components/          Componentes e navegação
  data/                Catálogos e fontes curadas
  features/            Motores, estimadores e regras de produto
  server/              Integrações, persistência e controles do servidor
preview/               Demonstração HTML e módulos compartilhados
apps/hardware-agent/   Agente local Rust/Tauri
prisma/                Schema e migrações
scripts/               Validação, geração e operação
tests/browser/        Testes de navegador e acessibilidade
planning/              Objetivos, critérios de aceite e progresso
```

**Stack:** Next.js · React · TypeScript · Tailwind CSS. Integrações opcionais: PostgreSQL/Prisma, Better Auth e Tauri/Rust. As versões exatas estão nos manifests e lockfiles.

## Validar alterações

```bash
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

`check` reúne higiene do repositório, versões, paridade dos arquivos gerados, TypeScript, lint e testes das etapas. Os testes de navegador iniciam os servidores Next e preview; exigem Python 3 e um navegador compatível. Também aceitam `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Para validar somente acessibilidade, após o build, use `npm run test:a11y`. Para conferir caches removíveis, use `npm run clean:local:dry` antes de `npm run clean:local`.

## Documentação

| Quero… | Documento |
| --- | --- |
| Publicar na Vercel | [Guia de publicação](DEPLOYMENT.md) |
| Configurar banco, autenticação e integrações | [Configuração avançada](docs/CONFIGURACAO.md) |
| Entender a proposta e o percurso do usuário | [Direção do produto](docs/PRODUTO.md) |
| Entender a arquitetura | [Arquitetura](ARCHITECTURE.md) |
| Consultar decisões arquiteturais | [ADRs](docs/adr/README.md) |
| Consultar objetivos e tarefas concluídas | [Planejamento](planning/00-INDICE-E-PRIORIDADES.txt) e [progresso](planning/PROGRESSO.txt) |
| Conferir testes e pendências | [Validação](TEST_REPORT.md) e [problemas conhecidos](KNOWN_ISSUES.md) |
| Entender o uso de dados | [Privacidade](PRIVACY.md) |
| Reportar uma vulnerabilidade | [Política de segurança](SECURITY.md) |
| Operar e recuperar o banco | [Operação](OPERATIONS.md) e [backup e recuperação](BACKUP_RECOVERY.md) |

## Contribuir

Consulte o planejamento antes de começar para evitar trabalho duplicado. Ao propor uma alteração, explique o problema, o resultado esperado e como validar. Mudanças na experiência devem considerar o Next e o preview, incluindo teclado e telas pequenas.

Registre as tarefas concluídas e suas evidências em `planning/PROGRESSO.txt`. Estimativas devem continuar identificadas como estimativas; resultados demonstrativos não podem ser apresentados como medições reais.

Se o projeto foi útil, você pode apoiar sua manutenção pela seção **Apoie o projeto** no site. É opcional.
