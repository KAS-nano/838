# ADR 0002 — Paridade entre Next e preview

- Estado: aceito
- Data: 2026-09-15

## Contexto

O projeto oferece a aplicação Next completa e um preview que funciona por servidor estático/Live Server. Manter duas interfaces cria duplicação, mas permite demonstrar o produto sem backend. Reimplementar regras de cálculo nas duas versões causaria resultados divergentes.

## Decisão

Tipos, catálogo e motores puros permanecem canônicos em `src/data` e `src/features`. `scripts/export-preview-catalog.mjs` gera `preview/engine.mjs` durante a preparação e o build. Módulos de navegador que precisam ser consumidos pelas duas interfaces ficam em `preview/*.mjs`, acompanhados por declarações `*.d.mts` quando importados pelo TypeScript.

O HTML e os componentes React podem ter implementações próprias, mas devem compartilhar contratos, estilos quando viável e testes Playwright equivalentes. `preview:check` bloqueia motor gerado obsoleto.

Uma unificação completa da renderização só será adotada se preservar o preview estático sem introduzir um segundo pipeline de build ou dependência de servidor.

## Consequências

- Mudanças de produto interativo exigem validação em Next e preview.
- Código de regra não deve ser copiado manualmente para `preview/engine.mjs`.
- A duplicação de marcação continua visível e deve ser reduzida por módulos pequenos, sem esconder diferenças de capacidade.
- Testes de paridade fazem parte do critério de aceite.
