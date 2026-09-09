# Auditoria — modelos, comparador e apoio

Data: 2026-09-09.

## Correções aplicadas

- A página de modelos tinha um segundo `return` fora do componente e links genéricos que apresentavam variantes seed como downloads reais. O componente foi consolidado e agora separa estimativas do analisador, pesos originais e arquivos GGUF efetivamente publicados.
- Os 17 itens do catálogo agora têm model card oficial, publicador, formato, precisão/quantização e links externos estruturados. As páginas dos repositórios usados foram consultadas pela API pública do Hugging Face em 2026-09-09.
- O identificador interno legado `llama-3.3-8b` foi preservado para não quebrar dados salvos, mas o item concreto foi corrigido para Llama 3.1 8B Instruct. O item Nemotron foi concretizado como Apriel-Nemotron 15B Thinker, publicado pela ServiceNow AI, sem atribuí-lo como um modelo NVIDIA inexistente de 15B.
- O comparador agora usa um motor compartilhado por Next e preview: três seleções independentes, quantização por coluna, busca/família, filtro por encaixe, ordenação explícita, contexto, cartões responsivos, gráfico proporcional e tabela detalhada.
- A tabela distingue VRAM necessária para carga total de VRAM alocada no perfil, contexto solicitado de contexto efetivo, origem/confiança e razões de compatibilidade.
- A barra lateral ganhou uma seção `Apoie o projeto` recolhida por padrão. O QR Pix é gerado localmente, não fixa valor, mostra recebedor e permite copiar chave ou Pix Copia e Cola, com alternativa manual quando a área de transferência é negada.
- A armadilha de foco do menu móvel passou a incluir os controles da seção de apoio e ignora controles ocultos em `details` recolhidos.

## Verificação

- `npm run build`: aprovado, 23 páginas geradas.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm run test:stages`: aprovado.
- `npm run test:support`: aprovado, incluindo fixture do manual do Banco Central, CRC, ausência de valor e decodificação independente do PNG.
- `scripts/comparison-engine-check.sh`: aprovado.
- Playwright: Next e preview, catálogo, comparador, QR/cópia, fallback, teclado e cinco viewports.

## Limites

- Os links e metadados externos podem mudar no Hugging Face depois da data de conferência.
- Alguns repositórios exigem aceitar licença ou autenticar antes do download.
- Os requisitos, desempenho e compatibilidade do analisador continuam identificados como dados seed/heurísticos; os links verificados não transformam essas estimativas em benchmarks medidos.
- Nenhum pagamento foi iniciado ou realizado durante os testes.
