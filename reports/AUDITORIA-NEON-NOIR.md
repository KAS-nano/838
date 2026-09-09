# Auditoria e consolidação do frontend 838

Data: 2026-09-06. Escopo: projeto existente `/home/nawak/Projetos/838-final`.

## Workspace antes das correções

O workspace contém dois projetos independentes: `838-final` e `sabor_burguer_mvp`. A estrutura inteira foi inventariada; o segundo projeto não participa do 838 e não foi alterado. Nenhum `AGENTS.md` aplicável foi encontrado. Foram lidos o pedido anexado e `PROJECT_CONTEXT.md` antes de editar.

O 838 tinha 148 arquivos de projeto, sem repositório Git e sem dependências instaladas. Uma cópia anterior às alterações foi preservada em `/tmp/838-before-neon-noir.tar.gz`, com inventário de hashes em `/tmp/838-audit-before.json`.

| Área | Localização | Diagnóstico inicial |
| --- | --- | --- |
| Frontend Next.js | `src/app` | Home, onboarding, dashboard e demais áreas existentes; identidade ainda azul/ciano; cabeçalhos e logos repetidos |
| Navegação/componentes | `src/components` | Sidebar sem grupos; mobile omitia benchmark/comunidade/perfil; gauges com ângulo e sobreposição inadequados |
| Previews | `preview` | Index apontava `styles-v13.css` e `app-v13.js` inexistentes; onboarding carregava script de dashboard |
| Catálogo | `src/data`, `src/features/catalog` | 12 modelos; faltavam 5 dos 17 solicitados |
| Compatibilidade/memória | `src/features/recommendation`, `src/features/estimation` | Fórmulas divergentes; compatibilidade ignorava contexto e overhead de disco |
| Desempenho/benchmarks | `src/features/benchmarks` | Import inexistente no dashboard; seed podia receber classificação de correspondência exata |
| Perfil/onboarding | `src/features/profile`, `src/features/onboarding` | Edição não restaurava perfil; salvar não abria dashboard; importação aceitava perfil incompleto |
| Ferramentas/hardware/instalação | `src/features`, páginas correspondentes | Funcionalidades existentes preserváveis; perfis demo divergiam entre páginas |
| APIs/banco | `src/app/api`, `src/server`, `prisma` | JSON inválido/null na recomendação podia falhar; schema Prisma compactado não era aceito pelo gerador real |
| Agente local | `apps/hardware-agent` | Frontend legado; script inline conflitando com CSP. Agente permanece de leitura local |
| Testes/configuração | `scripts`, configs raiz | Scripts dependiam de caminho absoluto `/opt/nvm/...`; Node/npm ausentes no PATH |
| Documentação | Markdown raiz e `reports` | Relatórios antigos não certificavam install/build/lint; atualização necessária |

## Correções aplicadas

- Tokens em `preview/theme.css`, importados pelo Next e pelos três previews: noir `#030504`, carvão `#151A16`, neon `#59FF7B`, espaçamentos e controles consistentes. Avisos/erros mantêm amarelo/vermelho.
- Assets de entrada do preview usam versão `?v=20260906` para evitar referências em cache às versões antigas.
- Um header global no Next, logo central e sidebar agrupada. Menu móvel contém todas as rotas, estado expandido, fechamento por Escape e controle de foco.
- Chuva com nomes em spans independentes, parâmetros individuais, atrás do conteúdo e sem interceptar interação. Movimento desativado por `prefers-reduced-motion`.
- Home → onboarding → salvar → dashboard; edição restaura o perfil. Um único formulário de hardware por implementação. Perfil validado e compartilhado entre as áreas; demonstração identificada quando ausente/inválido.
- Dashboard mantém modelo, quantização, contexto, hardware, quatro métricas, razões de compatibilidade e confiança. Gauges representam a porcentagem e mantêm números separados dos ponteiros. Links do catálogo selecionam o modelo solicitado; troca de modelo limita o contexto corretamente.
- Catálogo com os 17 modelos pedidos e cinco quantizações seed por modelo. Novos valores continuam demonstrativos/estimados.
- Compatibilidade utiliza a mesma estimativa de memória e contexto, incluindo offload, reserva e disco/runtime/cache. CPU sem VRAM não recebe consumo fictício de GPU.
- Seeds não entram na classificação de medição; evidências medidas têm prioridade. Faixas exibem origem e confiança.
- `preview/engine.mjs` é gerado dos módulos TypeScript existentes: catálogo, cálculos, perfil, validação, recomendações, hardware e receitas. Não existe um segundo motor mantido manualmente. `npm run preview:generate` atualiza o snapshot; o build faz isso automaticamente.
- Correções de importação, clipboard, rótulos acessíveis, estados vazios, navegação móvel, tabela com scroll e perfil malformado. Agente usa CSS/JS externos compatíveis com CSP.
- Dependências instaladas, lockfile criado, schema Prisma normalizado sem trocar entidades e testes tornados portáveis.

## Verificação e limites

O resultado atual está em [TEST_REPORT.md](../TEST_REPORT.md). As capturas revisadas estão em `reports/screenshots/`. As limitações de integrações e o resultado do audit de dependências constam em [KNOWN_ISSUES.md](../KNOWN_ISSUES.md).

Relatórios `ETAPA-*` e `FINAL-TEST-LOG.txt` anteriores são históricos; não representam a validação desta revisão.

## Arquivos alterados

90 arquivos de código, configuração, testes e documentação alterados/adicionados. Artefatos de dependências, build e testes compilados não são fontes; screenshots e logs estão listados separadamente.

| Arquivo | Estado |
| --- | --- |
| `.gitignore` | alterado |
| `ARCHITECTURE.md` | alterado |
| `CHANGELOG.md` | alterado |
| `KNOWN_ISSUES.md` | alterado |
| `PROJECT_CONTEXT.md` | alterado |
| `README.md` | alterado |
| `TEST_REPORT.md` | alterado |
| `apps/hardware-agent/src/app.js` | novo |
| `apps/hardware-agent/src/index.html` | alterado |
| `apps/hardware-agent/src/styles.css` | novo |
| `eslint.config.mjs` | alterado |
| `next-env.d.ts` | alterado |
| `package-lock.json` | novo |
| `package.json` | alterado |
| `playwright.config.ts` | novo |
| `postcss.config.mjs` | alterado |
| `preview/app.js` | alterado |
| `preview/app.mjs` | alterado |
| `preview/engine.mjs` | novo |
| `preview/home.html` | alterado |
| `preview/index.html` | alterado |
| `preview/onboarding.html` | alterado |
| `preview/shared.mjs` | novo |
| `preview/styles.css` | alterado |
| `preview/theme.css` | novo |
| `preview/validation.mjs` | alterado |
| `prisma/schema.prisma` | alterado |
| `reports/AUDITORIA-NEON-NOIR.md` | novo |
| `scripts/export-preview-catalog.mjs` | novo |
| `scripts/frontend-engine-check.sh` | novo |
| `scripts/frontend-engine-test.ts` | novo |
| `scripts/run-stage-tests.sh` | alterado |
| `scripts/stage10-check.sh` | alterado |
| `scripts/stage10-test.ts` | alterado |
| `scripts/stage11-check.mjs` | alterado |
| `scripts/stage12-check.sh` | alterado |
| `scripts/stage13-check.sh` | alterado |
| `scripts/stage14-check.sh` | alterado |
| `scripts/stage15-check.sh` | alterado |
| `scripts/stage16-check.sh` | alterado |
| `scripts/stage17-check.sh` | alterado |
| `scripts/stage2-check.mjs` | alterado |
| `scripts/stage20-check.sh` | alterado |
| `scripts/stage20-test.ts` | alterado |
| `scripts/stage21-check.sh` | alterado |
| `scripts/stage22-check.mjs` | alterado |
| `scripts/stage3-check.mjs` | alterado |
| `scripts/stage4-check.mjs` | alterado |
| `scripts/stage5-check.mjs` | alterado |
| `scripts/stage6-check.sh` | alterado |
| `scripts/stage8-check.sh` | alterado |
| `scripts/stage9-check.sh` | alterado |
| `src/app/api/recommend/route.ts` | alterado |
| `src/app/benchmark/page.tsx` | alterado |
| `src/app/benchmarks/comunidade/page.tsx` | alterado |
| `src/app/comparar/page.tsx` | alterado |
| `src/app/dashboard/page.tsx` | alterado |
| `src/app/error.tsx` | alterado |
| `src/app/explorar/page.tsx` | alterado |
| `src/app/ferramentas/page.tsx` | alterado |
| `src/app/globals.css` | alterado |
| `src/app/hardware/forca/page.tsx` | alterado |
| `src/app/hardware/upgrades/page.tsx` | alterado |
| `src/app/instalar/page.tsx` | alterado |
| `src/app/loading.tsx` | alterado |
| `src/app/modelos/page.tsx` | alterado |
| `src/app/not-found.tsx` | alterado |
| `src/app/onboarding/page.tsx` | alterado |
| `src/app/page.tsx` | alterado |
| `src/app/perfil/page.tsx` | alterado |
| `src/app/recomendacoes/page.tsx` | alterado |
| `src/app/sistemas/page.tsx` | alterado |
| `src/components/gauges/speed-gauge.tsx` | alterado |
| `src/components/navigation/site-frame.tsx` | alterado |
| `src/components/ui/button.tsx` | alterado |
| `src/data/seed-models.ts` | alterado |
| `src/features/benchmarks/data.ts` | alterado |
| `src/features/benchmarks/estimator.ts` | alterado |
| `src/features/estimation/memory.ts` | alterado |
| `src/features/integrations/local-providers.ts` | alterado |
| `src/features/integrations/openrouter.ts` | alterado |
| `src/features/onboarding/types.ts` | alterado |
| `src/features/onboarding/validation.ts` | alterado |
| `src/features/profile/local-store.ts` | alterado |
| `src/features/profile/use-hardware-profile.ts` | novo |
| `src/features/recommendation/engine.ts` | alterado |
| `src/features/recommendation/hybrid.ts` | alterado |
| `tests/browser/frontend.spec.ts` | novo |
| `tests/browser/regressions.next.spec.ts` | novo |
| `tsconfig.json` | alterado |

Nenhum arquivo fonte anterior foi excluído. CSS/JS legados foram substituídos nos arquivos existentes após conferir seus usos.

## Evidências

- `reports/validation/`: build, lint, Prisma, suíte de etapas, suíte de navegador e audit npm.
- `reports/screenshots/`: home, dashboard e onboarding de Next e preview em desktop 1366×768 e mobile 390×844.
- `test-results/` e `playwright-report/`: artefatos locais da última execução; ignorados pelo controle de versão.
