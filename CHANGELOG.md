# Changelog

## Em desenvolvimento — arquitetura de memória

- O perfil de hardware passa a registrar arquitetura da CPU e organização da memória.
- O estimador trata memória unificada como um único orçamento e evita somar RAM e VRAM compartilhadas.
- Dashboard e onboarding explicam os valores adequadamente para máquinas com memória unificada.
- Publicação inicial na Vercel documentada, com verificação local completa e smoke test para a URL pública.
- Logo oficial aplicada exclusivamente ao favicon do site e do preview.
- URL do favicon versionada para renovar caches antigos dos navegadores após o deploy.
- Runtime da hospedagem fixado em Node 22.x e scripts de instalação aprovados apenas para as versões atuais de Prisma e unrs-resolver.
- Readiness separado do health e logs JSON de falhas sem mensagens ou payloads sensíveis.
- CSP promovida de relatório para bloqueio real, com exceção de desenvolvimento isolada para o Turbopack.
- Logs operacionais usam serialização explícita e descartam campos extras, `toJSON` e tipos de erro manipulados.

## Em desenvolvimento
- CI separada para qualidade, motores, build, PostgreSQL e navegador; atualização agrupada de dependências e SBOM em tags.
- Node fixado, versões web/Tauri/Rust sincronizadas e verificações automáticas de higiene, versões e previews gerados.
- APIs com limite de corpo, MIME, rate limit, request ID, erros sanitizados, cache explícito e timeout de fornecedores.
- Endpoint Ollama restrito a loopback/porta conhecida, sem credenciais, caminhos extras ou redirects.
- Autenticação exige configuração completa, e-mail verificado, HTTPS em produção, senha reforçada e recuperação por webhook.
- Submissões comunitárias validam origem e agora possuem deduplicação garantida pelo banco.
- Catálogo persistente modela fontes, artefatos, capacidades, licenças, proveniência e snapshots, com migration inicial, bootstrap idempotente e fallback seed explícito.
- Benchmark comunitário v2 adiciona fixture pública, amostras reproduzíveis, estatísticas, assinatura Ed25519, limite diário, idempotência e quarentena para payload legado.
- Estimador 2.0.0 seleciona evidências por distância, usa dispersão observada, explica confiança/idade/diferenças e oferece métricas para avaliação offline.

## 2026-09-06 — consolidação neon-noir
- Tema compartilhado noir/carvão/neon, header global centralizado e navegação agrupada completa no mobile.
- Chuva de nomes independente com movimento reduzido; grids, gauges, formulários e tabelas revisados.
- Onboarding restaura/salva perfil e encaminha ao dashboard; todos os módulos usam perfil validado.
- Catálogo de 17 modelos seed e motor/validação compartilhados com o preview via geração automática.
- Compatibilidade passa a considerar contexto e memória/disco do mesmo estimador; seeds separados de medições.
- Referências inexistentes, import do dashboard, schema Prisma e scripts de testes corrigidos.
- Dependências e Playwright instalados; relatório atual em TEST_REPORT.md.

## 1.0.0 — estrutura completa
- navegação responsiva consolidada;
- dashboard real ligado ao perfil/modelo/quantização/contexto;
- gauges VRAM/RAM/disco/tokens por segundo;
- catálogo seed de modelos;
- motor de compatibilidade e ranking;
- estimadores de memória e performance com confiança;
- PostgreSQL/Prisma estruturados;
- Hugging Face e OpenRouter adapters;
- Ollama/LM Studio local adapters;
- comparador;
- ferramentas/runtimes/APIs;
- local × API;
- força do PC, gargalos e upgrades;
- sistemas recomendados;
- Central de Instalação;
- perfis locais e autenticação feature-gated;
- 838 Hardware Agent read-only;
- benchmark Ollama voluntário;
- submissões comunitárias com consentimento/outlier guard;
- health/recommend/catalog APIs;
- headers de segurança e páginas de erro;
- preview independente completo;
- documentação de arquitetura, segurança e privacidade.

## 0.3.0
Onboarding e hardware manual.

## 0.2.0
Identidade visual e homepage.

## 0.1.0
Fundação do projeto.
