# Auditoria técnica do 838 — 2026-09-11

## Escopo e estado

A revisão cobriu código Next/React, APIs, Prisma, preview estático, testes, CI, documentação, deploy e Hardware Agent. O repositório estava limpo, sincronizado até `8f08f1a` e com o commit local `74fbe99` pendente de envio no início da auditoria.

O produto público em modo seed está funcional e possui uma base incomum para esta fase: CSP bloqueante, validação de entrada, limites de resposta externa, fallback explícito, logs fechados, readiness, testes responsivos e documentação operacional. As maiores lacunas agora estão nas funções que ainda não foram ativadas: banco/autenticação, comunidade, agente distribuível e dados medidos.

## Achados por prioridade

### P0 — antes de ativar persistência ou distribuir o agente

1. **Rate limit distribuído.** `src/server/http/rate-limit.ts` mantém buckets em um `Map`. Em serverless, cada instância possui estado próprio e reinícios apagam os contadores. Manter esse limitador como proteção local, mas exigir armazenamento atômico compartilhado antes de habilitar autenticação ou submissões.
2. **Ciclo de vida LGPD.** O schema permite cascata de usuário, porém ainda faltam rotas autenticadas de exportação, correção e exclusão, retenção de sessão/verificação e teste de isolamento entre titulares.
3. **Banco real.** Migrations, bootstrap idempotente, backup e restauração possuem código, mas ainda precisam de execução em PostgreSQL isolado e evidência de RPO/RTO.
4. **Agente sem cadeia de release.** Ainda não há `Cargo.lock`, compilação nativa comprovada, matriz por sistema, assinatura/notarização ou hashes publicados. O snapshot v2 precisa ser compilado e exercitado em cada plataforma.
5. **Evidência de vulnerabilidades reproduzível.** O relatório histórico registra quatro vulnerabilidades altas na árvore Prisma, enquanto `npm-audit-current.json` não traz metadados úteis. Gerar um relatório atual em CI e registrar exceções com pacote, impacto, compensação, responsável e data de revisão.

### P1 — confiança e qualidade do produto

1. **Acessibilidade automatizada.** Há bons controles manuais de foco, movimento reduzido e responsividade, mas nenhum motor axe no Playwright. Cobrir home, onboarding, dashboard, catálogo, comparador, instalação e apoio em estados inicial e interativo.
2. **Catálogo com atualização controlada.** O catálogo seed é honesto, mas pode envelhecer. Criar coleta agendada para candidato, validação de licença/URL/hash, diff revisável, publicação atômica e rollback por snapshot.
3. **Validação de links e receitas.** Executar HEAD/GET limitado, verificar redirects, domínio final, data e hash quando houver. Tratar 403/429 como “não confirmado”, sem remover automaticamente uma fonte válida.
4. **Benchmark real e moderado.** A matemática está testada com fixtures. Ainda faltam coleta assinada pelo agente, chave privada protegida pelo sistema, grupos comparáveis, painel de moderação e conjunto oculto de avaliação.
5. **Observabilidade configurada.** Os eventos já são agregáveis, mas consultas, painel e alertas precisam ser criados na hospedagem e validados com uma falha controlada.
6. **Orçamentos de desempenho.** O build passa, mas não há limites de LCP, CLS, tamanho de JavaScript ou regressão por rota.

### P2 — funções com maior valor para o usuário

1. Inventário consentido de Ollama/LM Studio pelo agente, com versão de protocolo e nenhuma varredura ampla de disco.
2. Perfis e cenários locais: “notebook”, “desktop”, “privacidade”, “baixo custo” e “contexto longo”, com exportação sem identificadores.
3. Comparação de custo local × API com moeda, data do câmbio, energia opcional e premissas editáveis.
4. Histórico comunitário por combinação comparável, exibindo amostra, dispersão, idade e método de moderação.
5. Instalação guiada baseada em manifesto, com pré-condições, comandos copiáveis, verificação e reversão; execução automática somente no agente e após confirmação.
6. PWA limitada a shell, catálogo publicado e perfil local. Nunca armazenar sessão, respostas autenticadas ou submissões em cache offline.

### P3 — redução de custo de manutenção

1. Reduzir o preview a um conjunto de páginas demonstrativas ou gerar sua apresentação a partir da mesma fonte dos componentes Next.
2. Remover dependências sem uso, começando por `zod`, após confirmar build e lockfile.
3. Adicionar limpeza local documentada para `.next`, `.test-*`, relatórios temporários e cache. Esses arquivos somam cerca de 410 MiB além dos 986 MiB de `node_modules`, mas estão corretamente ignorados e nenhum foi encontrado no Git.
4. Separar arquivos compactados de regras de negócio em módulos legíveis, começando pelas integrações e motor híbrido, sem alterar a saída.
5. Criar decisões arquiteturais curtas para autenticação, rate limit distribuído, catálogo e protocolo do agente.

## Repositórios externos avaliados

| Projeto oficial | Decisão | Uso proposto | Condição de entrada |
| --- | --- | --- | --- |
| [Deque axe para Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) | adotar em P1 | detectar violações sérias/críticas nos fluxos reais | fixar versão, revisar licença MPL-2.0 e manter testes manuais |
| [Tauri Action](https://github.com/tauri-apps/tauri-action) | adotar em P0 | compilar pacotes nativos e anexar artefatos à release | fixar action por SHA, começar sem publicação automática e adicionar assinatura depois |
| [OSV-Scanner](https://github.com/google/osv-scanner) | adotar em P0 | escanear `package-lock.json`, futuro `Cargo.lock` e SBOM | fixar release/action e criar exceções datadas, sem correção automática |
| [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) | adotar após criar `Cargo.lock` | licenças, advisories, fontes e duplicações Rust | política própria de licenças e exceções revisadas |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | adotar em P1 | orçamentos de performance, acessibilidade e tamanho | obter baseline em três execuções antes de bloquear CI |
| [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) | observar | traces exportáveis quando logs deixarem de bastar | só adicionar com coletor definido, amostragem, retenção e redaction |

Não foi identificado um catálogo externo de modelos com maturidade suficiente para virar fonte automática sem revisão. Novas bases comunitárias devem entrar primeiro como fonte candidata, nunca substituir proveniência oficial de Hugging Face, fornecedores e repositórios dos modelos.

## Ordem recomendada

1. Compilar o agente em CI e gerar `Cargo.lock`; corrigir qualquer falha do snapshot v2.
2. Adicionar axe aos fluxos principais e corrigir violações encontradas.
3. Criar scanner OSV e registro formal de exceções.
4. Implementar rate limit distribuído atrás de adapter e flag, mantendo o modo seed sem serviço adicional.
5. Executar PostgreSQL real, restauração e ciclo LGPD antes de habilitar autenticação/comunidade.
6. Automatizar catálogo candidato e links; somente depois iniciar benchmark público medido.
7. Adicionar orçamento Lighthouse e então avançar nas funções P2.

## Critério para usar código externo

Todo repositório deve ter licença compatível, manutenção recente, releases identificáveis, escopo mínimo e pin por versão ou SHA. Copiar trechos exige registrar origem e licença. Dependências só entram quando substituem código de risco ou reduzem manutenção de forma mensurável; popularidade isolada não é critério.
