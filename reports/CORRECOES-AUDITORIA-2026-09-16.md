# Correções da auditoria — 2026-09-16

O motor agora exige modalidade e contexto compatíveis antes de pontuar alternativas. O teste de transcrição com catálogo somente de texto retorna lista vazia; APIs de 128K não entram em pedidos de 256K. Uma fixture com API barata/lenta e API cara/rápida confirma a troca de vencedor entre custo e velocidade. Preços seed estão identificados como demonstrativos.

As quatro telas principais carregam o catálogo configurado em páginas de servidor e recebem modelos serializáveis nos componentes de cliente. O carregador compartilhado também atende à API de recomendação. Testes com repositório controlado cobrem IDs ausentes no seed, indisponibilidade, catálogo vazio e variantes ausentes. BF16/FP16 foram alinhados entre o contrato, repositório e snapshots.

O rate limit remove buckets expirados e limita a memória a 10 mil entradas, recusando novas chaves quando cheio. Continua sendo um controle por processo.

O servidor Python padrão deste Windows enviava módulos como `text/plain`. `scripts/serve-preview.py` define os tipos de JavaScript e CSS explicitamente; Playwright escolhe `python` no Windows e `python3` nos demais sistemas. A fila do servidor aceita 128 conexões pendentes para atender carregamentos concorrentes de módulos.

Validação local:

- TypeScript, ESLint e build Next/Turbopack aprovados.
- Playwright: 82/82 testes aprovados na rodada final (Next e preview), incluindo navegação, acessibilidade, persistência e compartilhamento.
- Suíte completa `scripts/run-stage-tests.sh`, incluindo regressões e carregador de catálogo, aprovada.
- Paridade do preview gerado, higiene do repositório, versões e `git diff --check` aprovados.
- Artefatos `.next`, `test-results`, `playwright-report` e `.test-stage43` já estão ignorados; nenhuma regra nova necessária.

Ambiente: Windows, Node 24.21.0 e Python 3.14. O projeto fixa Node 22; esta rodada não certifica execução nesse runtime. A suíte shell foi executada com Git Bash e uma função de sessão que encaminha `python3` ao Python instalado. A execução inicial parou no atalho de Python da Microsoft Store; a primeira rodada de navegador detectou o MIME incorreto do preview. Uma rodada posterior passou 81/82 testes de navegador; o trace do restante registrou `ERR_CONNECTION_REFUSED` ao carregar um módulo. A fila do servidor foi ampliada e a suíte repetida.

Não houve validação de PostgreSQL real nesta rodada. Os registros de banco local de 2026-09-15 permanecem históricos. Benchmarks e preços externos verificados, autenticação hospedada, e-mail e rate limit distribuído continuam pendentes. Scores e estimativas não são medições reais.
