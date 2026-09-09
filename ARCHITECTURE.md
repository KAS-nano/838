# Arquitetura do 838

## Web

Browser → Next.js → motor 838 → catálogo/repositórios → PostgreSQL quando configurado.

O motor de cálculo permanece em módulos TypeScript puros para poder ser testado sem React, Next.js ou banco.

## Dados

Fontes externas são adaptadores, não a fonte de verdade única:
- Hugging Face: metadados/modelos;
- OpenRouter: modelos hospedados e preços/capacidades;
- GitHub Releases: versões de ferramentas (integração futura do adaptador);
- Ollama/LM Studio: runtimes locais.

Todos os dados externos devem carregar origem e data de atualização quando persistidos.

## Estimativas

### Memória
Pesos + KV cache + overhead + contexto + offload.

### Performance
1. benchmark medido exato;
2. benchmark vizinho;
3. interpolação;
4. heurística.

O resultado é uma faixa com confiança e método. O 838 não deve converter heurística em falsa precisão.

## Banco

Prisma/PostgreSQL estão modelados para usuários, hardware, modelos, variantes, runtimes, compatibilidades, benchmarks, ferramentas, APIs, recomendações, receitas de instalação e submissões comunitárias.

O catálogo persistente acrescenta fontes, artefatos, capacidades, licença, proveniência e snapshots auditáveis. `CATALOG_SOURCE=database` seleciona `PrismaCatalogRepository`; o padrão e o fallback controlado usam `SeedCatalogRepository`. A resposta da API informa `source`, `dataState`, `observedAt` e `schemaVersion` para que o consumidor não confunda fallback com dados persistidos.

## Localhost

O servidor do 838 não deve acessar `127.0.0.1` ou `localhost` em nome do usuário. Integração com runtimes locais acontece no browser quando CORS permitir ou no agente local autorizado.

## Agente

Tauri/Rust, superfície mínima de permissões, leitura de hardware e nenhum envio automático. Instalação automática não está habilitada nesta versão estrutural.

## Tema e preview (2026-09-06)

`preview/theme.css` é a fonte dos tokens visuais do Next.js e dos previews HTTP. `SiteFrame` renderiza o header global, sidebar e chuva no Next.

`src/data` e `src/features` permanecem canônicos. `scripts/export-preview-catalog.mjs` gera `preview/engine.mjs` a partir dos módulos puros existentes; o build sempre regenera esse arquivo. Validação, defaults, perfil demo, catálogo, estimadores e recomendações são compartilhados. A chave de perfil é `838.hardwareProfile`; o preview migra a chave histórica `838.preview.profile`.

O frontend trata armazenamento indisponível ou perfil malformado e identifica o fallback demo. Onboarding é a única entrada/edição de hardware; dashboard e perfil apontam para esse fluxo.
