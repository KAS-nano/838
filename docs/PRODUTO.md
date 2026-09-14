# Direção do produto

O 838 ajuda a escolher uma configuração de IA considerando **hardware + objetivo + modelo + runtime**. A entrega ao usuário é uma decisão explicada: o que testar, com qual configuração, quais recursos serão necessários e quais limites permanecem.

## Percurso principal

1. Informar hardware e objetivo no onboarding.
2. Consultar a análise de compatibilidade no dashboard.
3. Comparar alternativas e consultar suas versões no catálogo.
4. Seguir as instruções de instalação e, quando possível, confirmar a estimativa com um benchmark local voluntário.

A home também oferece entradas diretas para quem já conhece um modelo ou quer comparar alternativas. Elas não exigem que o usuário preencha o hardware antes de explorar; análises com perfil demonstrativo continuam sinalizadas.

## Hierarquia da experiência

- **Escolha inicial:** home com proposta, percurso, exemplo identificado e dúvidas básicas.
- **Decisão:** dashboard, modelos, recomendações e comparador.
- **Preparação:** hardware, upgrades, sistemas e instalação.
- **Validação e preferências:** benchmark, comunidade e perfil, respeitando as integrações disponíveis.

## Critérios para novas funções

Cada função deve melhorar uma decisão desse percurso. Priorizar evidência, clareza e recuperação de erros. Não adicionar rankings universais de hardware nem promessas de desempenho sem medição.

Informações importantes devem indicar origem, unidade e confiança. Estimativa, demonstração e medição têm significados diferentes e precisam permanecer reconhecíveis na interface.

## Organização técnica desta reformulação

- `src/app/page.tsx`: apresentação da home como componente de servidor, sem estado adicional no cliente.
- `preview/home.html`: equivalente estático com destinos próprios.
- `preview/home.css`: estilos compartilhados da home, isolados por classes de produto.
- `README.md`: entrada do repositório para usuários e colaboradores.
- `docs/CONFIGURACAO.md`: banco, autenticação e integrações avançadas.
- `tests/browser/home-product.spec.ts`: navegação das entradas, teclado e responsividade.

As demais páginas mantêm seus fluxos existentes. Novas etapas devem preservar a paridade Next/preview e ter aceites próprios no planejamento.

Voltar ao [README](../README.md).
