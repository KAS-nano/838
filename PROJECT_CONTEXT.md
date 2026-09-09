# CONTEXTO MESTRE — PROJETO 838

> Atualização 2026-09-06: consolidação neon-noir aplicada ao Next.js e previews existentes. Estado executado, arquivos alterados e limitações em `reports/AUDITORIA-NEON-NOIR.md`, `TEST_REPORT.md` e `KNOWN_ISSUES.md`. As etapas/versionamentos abaixo preservam o histórico e a direção do produto.


Você está trabalhando no projeto **838**, uma plataforma web para ajudar usuários a escolher, configurar, comparar e instalar IAs locais, APIs de IA, runtimes e ferramentas de acordo com o hardware, sistema operacional e objetivo de cada pessoa.

O projeto já passou por várias etapas de planejamento e prototipação. Não recomece do zero. Trabalhe sobre o código existente no workspace.

---

# 1. PRINCIPAL OBJETIVO DO 838

O 838 deve responder de forma clara:

> “Para o meu computador e para o que eu quero fazer, qual IA, ferramenta e configuração devo usar, e que desempenho posso esperar?”

O fluxo principal é:

Usuário
→ informa ou detecta hardware
→ escolhe objetivo
→ 838 analisa compatibilidade
→ recomenda modelos locais / APIs / ferramentas
→ estima VRAM, RAM, armazenamento e desempenho
→ compara alternativas
→ recomenda configuração
→ fornece instalação adequada ao sistema operacional.

O site NÃO deve ser apenas um catálogo de LLMs.

---

# 2. ESCOPO DO PRODUTO

O 838 deverá trabalhar com:

## IA local

* LLMs.
* VLMs.
* modelos multimodais.
* modelos de imagem.
* modelos de áudio.
* modelos de voz.
* transcrição.
* modelos de vídeo.
* ferramentas especializadas.

## APIs

* OpenRouter.
* APIs oficiais dos fornecedores.
* outras APIs relevantes futuramente.

## Runtimes / gerenciadores

* Ollama.
* LM Studio.
* llama.cpp.
* outros runtimes compatíveis.

## Programação

* IDEs.
* editores.
* ferramentas de IA para programação.
* integração com modelos locais/API.

## Conteúdo

* imagem.
* áudio.
* vídeo.
* cortes automáticos.
* transcrição.
* legendas.
* edição.

## Outros

* produtividade.
* documentos.
* brainstorming.
* escrita.
* assistentes gerais.

---

# 3. TIPOS DE OBJETIVOS DO USUÁRIO

Atualmente considerar pelo menos:

* Programação.
* Criação de ideias.
* Escrita.
* Documentos.
* Produtividade.
* Assistente geral.
* Imagem.
* Edição de imagem.
* Geração de imagem.
* Vídeo.
* Edição de vídeo.
* Cortes automáticos.
* Geração de vídeo.
* Áudio.
* Voz.
* Transcrição.
* Legendas.

Novas categorias podem ser adicionadas quando fizer sentido.

---

# 4. STACK PRINCIPAL

## Frontend / Web

* TypeScript.
* React.
* Next.js 16.
* Tailwind CSS.
* componentes próprios.
* shadcn/ui quando realmente ajudar.

## Banco

* PostgreSQL.

## ORM

* Prisma.

## Validação

* Zod.

## Estado / dados

* TanStack Query quando houver dados assíncronos de servidor.
* Evitar adicionar gerenciamento de estado global sem necessidade.

## Motor de análise futuro

Python poderá ser usado futuramente para:

* processamento de benchmarks.
* normalização de datasets.
* análise estatística.
* ingestão de grandes volumes de dados.

FastAPI poderá ser adicionado apenas quando um serviço separado realmente for necessário.

## Agente local futuro

* Rust.
* Tauri 2.

O agente será responsável por detectar hardware e, futuramente, executar benchmarks locais autorizados.

---

# 5. PRINCÍPIO DE ARQUITETURA

Evitar complexidade desnecessária.

No MVP:

Browser
→ Next.js
→ PostgreSQL / Prisma.

Não adicionar NestJS ou microserviços apenas por arquitetura.

Adicionar Python como serviço separado somente quando benchmarks/ingestão justificarem.

Adicionar Rust/Tauri somente para o agente local.

---

# 6. HARDWARE ANALISADO

O perfil do usuário deve possuir:

* desktop ou notebook.
* CPU.
* GPU.
* VRAM.
* RAM.
* armazenamento total.
* armazenamento livre.
* sistema operacional.
* distribuição Linux quando necessário.
* drivers.
* backend disponível.
* preferência Local / API / Ambos.
* objetivo.
* prioridade.

Prioridades possíveis:

* qualidade.
* velocidade.
* baixo consumo.
* privacidade.
* facilidade.
* menor custo.

---

# 7. DASHBOARD CENTRAL

O centro do 838 é uma análise:

MODELO × COMPUTADOR.

O usuário escolhe:

* modelo.
* quantização.
* contexto.

E o dashboard atualiza.

Os quatro principais medidores são:

## VRAM

Mostrar:

* VRAM estimada.
* VRAM total.
* porcentagem.
* estado.

## RAM

Mostrar:

* RAM estimada.
* RAM total.
* porcentagem.
* offload quando houver.

## Armazenamento

Mostrar:

* tamanho aproximado do modelo.
* cache/runtime.
* espaço total recomendado.

## Velocidade

Mostrar:

* tokens/s.

Nunca fingir precisão.

Preferir:

32–41 t/s

em vez de:

36,8472 t/s

quando não existir benchmark exato.

---

# 8. COMPATIBILIDADE

O dashboard também mostra:

Compatibilidade:

0–100.

Mas esse número NÃO pode ser decorativo.

Considerar:

* VRAM.
* RAM.
* armazenamento.
* backend.
* sistema operacional.
* desempenho.
* objetivo.
* facilidade de configuração.

Também usar estados claros:

* cabe totalmente na GPU.
* funciona com offload.
* próximo do limite.
* RAM insuficiente.
* VRAM insuficiente.
* armazenamento insuficiente.
* backend incompatível.
* incompatível.

---

# 9. CONFIANÇA DOS DADOS

Toda estimativa importante deve possuir:

* Alta.
* Média.
* Baixa.

O sistema deve distinguir claramente:

## Medido

Benchmark real.

## Estimado com boa evidência

Hardware/modelo muito semelhante.

## Heurística

Não há benchmark suficiente.

Benchmarks reais sempre têm prioridade.

Dados seed de desenvolvimento NUNCA devem parecer benchmark real.

---

# 10. ESTIMATIVA DE VRAM

Não utilizar:

“arquivo GGUF = VRAM”.

Considerar:

* pesos carregados na GPU.
* quantização.
* KV cache.
* contexto.
* buffers.
* arquitetura.
* backend.
* GPU layers.
* offload.
* overhead do runtime.

Conceitualmente:

VRAM =
pesos na GPU

* KV cache
* buffers
* overhead.

---

# 11. ESTIMATIVA DE RAM

Considerar:

* pesos não carregados na GPU.
* offload.
* runtime.
* cache.
* buffers.
* reserva de sistema.

Mais RAM não significa automaticamente mais tokens/s.

Muitas vezes ela apenas permite:

* modelo maior.
* contexto maior.
* mais offload.
* mais multitarefa.

---

# 12. TOKENS/S

Ordem de preferência:

1. benchmark exato.
2. benchmark de hardware muito semelhante.
3. benchmark da mesma arquitetura.
4. interpolação.
5. heurística.

Sempre informar:

* faixa.
* confiança.
* evidência.

Exemplo:

28–35 t/s
Confiança média
Baseado em benchmarks de GPU da mesma arquitetura.

---

# 13. BANCO DE BENCHMARKS

Cada benchmark deverá poder armazenar:

* CPU.
* GPU.
* VRAM.
* RAM.
* SO.
* driver.
* backend.
* modelo.
* variante.
* quantização.
* contexto.
* runtime.
* versão do runtime.
* prompt processing.
* generation t/s.
* VRAM usada.
* RAM usada.
* data.
* fonte.
* confiança.
* se foi medido ou estimado.

Futuramente usuários poderão enviar benchmarks voluntariamente.

---

# 14. BANCO DE MODELOS

Estrutura conceitual:

AiModel

→ família
→ arquitetura
→ parâmetros
→ parâmetros ativos
→ modalidades
→ contexto
→ licença
→ objetivo recomendado
→ variantes
→ quantizações
→ arquivos
→ runtimes
→ benchmarks
→ requisitos.

Principais entidades:

* User.
* HardwareProfile.
* Cpu.
* Gpu.
* AiModel.
* ModelVariant.
* ModelFile.
* Runtime.
* RuntimeCompatibility.
* Benchmark.
* Tool.
* ApiModel.
* ApiPricing.
* Recommendation.
* InstallationRecipe.

---

# 15. LLMs ATUAIS DO CATÁLOGO SEED

O catálogo atual deve possuir pelo menos opções similares a:

## Qwen

* Qwen3 1.7B.
* Qwen3 4B.
* Qwen3 8B.
* Qwen3 14B.
* Qwen3 32B.
* Qwen3 Coder 30B A3B.

## Gemma

* Gemma 3 4B.
* Gemma 3 12B.
* Gemma 3 27B.

## Mistral

* Mistral Small 24B.
* Ministral 8B.

## Microsoft

* Phi-4 14B.

## DeepSeek

* DeepSeek R1 Distill 14B.

## Meta

* Llama 3.x 8B.

## IBM

* Granite 8B Code.

## Cohere

* Command R 35B.

## NVIDIA

* Nemotron 15B.

Novos modelos podem e devem ser adicionados quando fizer sentido.

IMPORTANTE:

Valores de memória/tamanho colocados manualmente como seed devem continuar identificados como estimativas até serem validados por fonte real.

---

# 16. INTEGRAÇÕES PLANEJADAS

## Hugging Face Hub

Para:

* modelos.
* arquivos.
* tamanho.
* licença.
* tags.
* arquitetura.
* atualização.
* metadados.

O 838 deve normalizar os dados antes de armazenar.

Hugging Face não é o banco do 838.

## Ollama

Para:

* detectar modelos instalados.
* listar modelos.
* executar modelo.
* benchmark local futuro.
* verificar runtime.

## LM Studio

Para:

* modelos locais.
* servidor local.
* API compatível com OpenAI.
* benchmark futuro.

## llama.cpp

Usar como:

* runtime.
* referência técnica.
* execução/benchmark.

## OpenRouter

Para:

* catálogo de modelos API.
* preços.
* contexto.
* modalidades.
* comparação Local × API.

## GitHub

Para:

* releases.
* versão atual.
* changelog.
* status de projetos.

---

# 17. FORÇA DO PC

O 838 possui uma área:

Força do PC / Notebook.

Não mostrar apenas uma nota universal.

Calcular capacidade por tarefa:

* IA local.
* programação.
* imagem.
* vídeo.
* áudio.
* multimodal.
* produtividade.

Exemplo:

IA Local      8.4
Programação   9.1
Imagem        8.0
Vídeo         6.8

Também mostrar:

Principal gargalo.

Pode ser:

* RAM.
* VRAM.
* GPU.
* CPU.
* armazenamento.
* backend.

---

# 18. UPGRADES

O site poderá simular:

Configuração atual:

16 GB RAM.

Simular:

32 GB RAM.

E recalcular capacidades.

Pode simular futuramente:

* RAM.
* GPU.
* VRAM.
* armazenamento.
* CPU.

Nunca recomendar upgrade apenas para vender uma melhoria.

Se não existir gargalo óbvio, mostrar:

“Não há upgrade claramente necessário para esta configuração.”

---

# 19. SISTEMAS RECOMENDADOS

O site deverá comparar sistemas conforme:

* hardware.
* objetivo.
* GPU.
* drivers.
* backend.
* softwares desejados.
* facilidade.

Exemplos:

* Windows 11.
* CachyOS.
* Arch Linux.
* Ubuntu.
* Fedora.
* macOS.

Não criar um ranking universal.

---

# 20. CENTRAL DE INSTALAÇÃO

O 838 deverá detectar/inferir:

SO + GPU + ferramenta.

Exemplo:

CachyOS
AMD Radeon

→ instalação de Ollama com backend adequado.

A receita deve possuir:

1. requisitos.
2. compatibilidade.
3. instalação.
4. configuração.
5. verificação.
6. teste.

Quando existir comando:

* mostrar código.
* botão copiar.

Nunca executar instalação automaticamente pelo navegador.

Instalação automática só poderá existir futuramente via agente local e confirmação explícita.

---

# 21. AGENTE LOCAL 838

Futuramente:

Rust + Tauri.

Funções:

* detectar CPU.
* detectar GPU.
* VRAM.
* RAM.
* armazenamento.
* SO.
* drivers.
* runtimes.
* backends.

Depois poderá executar benchmarks autorizados.

Regras de segurança:

* nenhuma execução arbitrária.
* allowlist de ações.
* sem shell remoto genérico.
* usuário precisa autorizar.
* dados enviados somente com consentimento.

---

# 22. IDENTIDADE VISUAL ATUAL

Esta parte é MUITO IMPORTANTE.

O frontend atual está sendo redesenhado.

Tema oficial atual:

## Background

BLACK-NOIR.

Cor aproximada:

#030504

O fundo deve ser muito escuro/quase preto.

## Sidebar

Cinza carvão / cinza escuro.

Exemplo:

#151A16
#181C18

Ela precisa ser visualmente separada do fundo preto.

## Destaque principal

GREEN NEON.

Exemplo:

#59FF7B

Usar em:

* logo.
* elementos selecionados.
* progress bars.
* highlights.
* pequenos glows.
* indicadores.

Não exagerar no glow.

## Logo

Logo textual:

838

Ela precisa ficar:

CENTRALIZADA HORIZONTALMENTE NO TOPO.

Não colocar a logo dentro da sidebar.

A logo deve ser:

green neon.

Com tracking grande.

## Visual

Objetivo:

* black noir.
* técnico.
* moderno.
* cyber minimalista.
* premium.
* não exageradamente gamer.

Evitar:

* excesso de azul.
* excesso de ciano.
* gradientes coloridos demais.
* cards desalinhados.
* páginas com cabeçalhos diferentes.

---

# 23. CHUVA DE NOMES DE LLMs

O background possui uma animação inspirada em chuva digital.

IMPORTANTE:

Cada nome de LLM deve ser um elemento INDEPENDENTE.

NÃO criar:

Qwen
Gemma
Llama
Mistral

dentro de uma única string/coluna.

Cada nome deve possuir seu próprio `<span>` / elemento.

Exemplo:

<span>Qwen3</span>

<span>Gemma 3</span>

<span>Llama 3</span>

Cada elemento deve possuir individualmente:

* posição X.
* posição Y.
* animation-delay.
* animation-duration.
* opacity.
* font-size.

Eles devem cair verticalmente pelo background.

A chuva deve ficar ATRÁS de todo conteúdo.

Deve usar:

pointer-events: none.

Deve respeitar:

prefers-reduced-motion.

Lista atual de nomes que podem aparecer:

* Qwen3.
* Qwen3 1.7B.
* Qwen3 4B.
* Qwen3 8B.
* Qwen3 14B.
* Qwen3 32B.
* Qwen3 Coder.
* Gemma 3.
* Gemma 3 27B.
* Mistral.
* Ministral.
* Phi-4.
* DeepSeek R1.
* Llama 3.
* Granite.
* Command-R.
* Nemotron.
* Ollama.
* LM Studio.
* llama.cpp.
* OpenRouter.

Pode adicionar outras LLMs/famílias relevantes.

---

# 24. NAVEGAÇÃO LATERAL

Atualmente a sidebar conceitual possui:

VISÃO GERAL

* Visão geral.

IA

* Modelos.
* Recomendações.
* Comparar.

ECOSSISTEMA

* Ferramentas.

HARDWARE

* Força do PC.
* Upgrades.
* Sistemas.

CONFIGURAÇÃO

* Instalação.
* Benchmark.
* Comunidade.
* Perfil.

Evitar deixar todos os itens simplesmente jogados na mesma lista.

É permitido melhorar a hierarquia visual.

---

# 25. ONBOARDING

O onboarding foi uma das partes que precisou ser redesenhada.

Ele deve seguir EXATAMENTE a identidade visual atual.

Estrutura:

## Passo 1 — Máquina

Perguntar:

Desktop / Notebook.

CPU.

GPU.

VRAM.

RAM.

Armazenamento total.

Armazenamento livre.

Sistema operacional.

Distribuição Linux quando necessário.

## Passo 2 — Objetivo

Cards selecionáveis:

* Programação.
* Ideias.
* Escrita.
* Documentos.
* Imagem.
* Vídeo.
* Áudio.
* Transcrição.
* Produtividade.
* Assistente.

Também:

Preferência:

* IA local.
* API.
* Ambos.

Prioridade:

* qualidade.
* velocidade.
* baixo consumo.
* privacidade.
* facilidade.
* menor custo.

## Passo 3 — Revisão

Mostrar resumo:

Máquina.

Hardware.

Sistema.

Objetivos.

Preferências.

Depois:

Salvar perfil.

O perfil deve alimentar o dashboard.

---

# 26. FLUXO DO PREVIEW HTML

Existem previews independentes para permitir inspeção sem rodar Next.js.

A versão mais recente reformulada foi aproximadamente:

v1.4.

Arquivos importantes do preview:

* home.html
* index.html
* onboarding.html
* CSS.
* JS principal.
* JS do onboarding.

Fluxo esperado:

home.html
→ onboarding.html
→ salvar perfil
→ index.html#dashboard.

No dashboard:

Editar hardware
→ onboarding.html.

Evitar manter dois formulários de hardware diferentes.

O onboarding deve ser a principal entrada/edição de hardware.

---

# 27. PROBLEMA QUE JÁ OCORREU

O usuário reclamou que algumas mudanças visuais pareciam “a mesma coisa”.

Portanto:

NÃO fazer mudanças superficiais.

Quando redesenhar:

* alterar composição.
* alinhamento.
* hierarquia.
* spacing.
* cores.
* header.
* sidebar.
* cards.
* comportamento responsivo.

O usuário também identificou elementos “fora do esquadro”.

Sempre revisar:

* alinhamento.
* width.
* padding.
* grid.
* overflow.
* viewport pequeno.
* sidebar.
* header.
* cards.
* tabelas.

---

# 28. REGRA DE DESENVOLVIMENTO

O usuário deu autonomia para melhorar o projeto.

NÃO precisa pedir autorização para cada pequena melhoria.

Se identificar algo importante:

* corrija.
* explique depois.

Mas não altere completamente o objetivo principal do 838.

---

# 29. POLÍTICA DE TESTES

Antes de considerar uma alteração concluída:

Executar o máximo possível de:

* build.
* TypeScript.
* lint.
* syntax checks.
* testes unitários.
* testes de funções puras.
* testes do preview.
* HTTP 200.
* responsividade básica.
* navegação.
* inputs.
* localStorage.
* estados inválidos.

Se alguma coisa NÃO puder ser testada:

não fingir que passou.

Informar claramente:

“não executado”.

---

# 30. BUGS QUE DEVEM SER EVITADOS

Já ocorreram problemas como:

* import aliases dificultando testes independentes.
* fórmula inválida em cálculo.
* cabeçalhos duplicados.
* CSS antigo misturado ao novo.
* preview diferente da aplicação Next.js.
* cache fazendo o usuário abrir versão antiga.
* fluxo de hardware duplicado.
* elementos desalinhados.

Sempre que criar uma nova versão de preview:

usar nomes/versionamento claro para evitar cache.

---

# 31. OPEN SOURCE

Bibliotecas/projetos úteis:

* shadcn/ui.
* Recharts.
* Apache ECharts.
* huggingface.js.
* Ollama.
* llama.cpp.
* Tauri.

Sempre verificar licença.

Evitar copiar grandes interfaces inteiras.

Open WebUI deve ser usado principalmente como referência de produto/UI, devido às questões de licença/branding das versões atuais.

---

# 32. FILOSOFIA DO FRONTEND

Prioridade visual:

1. clareza.
2. alinhamento.
3. legibilidade.
4. responsividade.
5. identidade 838.
6. densidade de informação controlada.

Cards importantes devem ficar agrupados por contexto.

Não encher a tela inteira de pequenos cards sem hierarquia.

---

# 33. FILOSOFIA DAS RECOMENDAÇÕES

Não dizer apenas:

“use modelo X”.

Explicar:

* por que.
* consumo.
* desempenho esperado.
* limitações.
* confiança.
* runtime indicado.
* quantização.
* contexto.

Oferecer:

* recomendação principal.
* opção mais rápida.
* opção com maior qualidade.
* opção API quando fizer sentido.

---

# 34. LOCAL VS API

O 838 deverá conseguir comparar:

LOCAL

* gratuito após instalação.
* privacidade.
* hardware necessário.
* limite de velocidade.
* contexto.

API

* custo por tokens.
* modelo mais forte.
* contexto maior.
* depende da internet.

Pode recomendar combinação:

local para tarefas comuns

* API para tarefas complexas.

---

# 35. ESTADO ATUAL DO PROJETO

O projeto já possui estrutura para:

* homepage.
* onboarding.
* dashboard.
* catálogo de modelos.
* recomendação.
* comparação.
* ferramentas.
* força do PC.
* upgrades.
* sistemas.
* instalação.
* benchmark.
* perfil.
* APIs internas.
* banco via Prisma.
* autenticação preparada.
* agente Tauri estruturado.
* benchmarks comunitários estruturados.
* documentação.
* segurança.
* privacidade.
* testes.

Algumas integrações ainda usam:

* seed.
* mocks.
* heurísticas.

Não tratá-las como produção.

---

# 36. VERSÃO VISUAL MAIS RECENTE

A última reformulação visual estava aproximadamente na:

838 v1.4.

Mudanças recentes:

* black-noir.
* sidebar carvão.
* green neon.
* logo 838 centralizada.
* chuva independente de LLMs.
* catálogo expandido.
* index reformulado.
* onboarding reformulado.
* fluxo index ↔ onboarding corrigido.

---

# 37. PRÓXIMOS OBJETIVOS RECOMENDADOS

Ao trabalhar no VS Code, priorize nesta ordem:

## 1. Consolidar frontend real

Garantir que:

Next.js e preview tenham mesma experiência.

Remover código visual legado.

## 2. Revisar responsividade

Especialmente:

* 1920×1080.
* 1440p.
* 1366×768.
* tablets.
* celulares.

## 3. Revisar sidebar

Agrupar itens em categorias.

## 4. Melhorar catálogo

Adicionar:

* mais modelos.
* filtros.
* família.
* parâmetros.
* contexto.
* objetivo.
* quantização.

## 5. Melhorar dashboard

Exibir claramente:

* modelo.
* quantização.
* contexto.
* hardware.
* VRAM.
* RAM.
* disco.
* t/s.
* compatibilidade.
* confiança.

## 6. Substituir seeds

Gradualmente usar dados reais.

## 7. Benchmark real

Usar Ollama/LM Studio/llama.cpp quando disponível.

## 8. PostgreSQL

Persistir catálogo e benchmarks.

---

# 38. REGRA AO MODIFICAR CÓDIGO

Antes de editar:

* examine arquivos existentes.
* entenda a arquitetura atual.
* não recrie componentes que já existem.
* reutilize motor de recomendação existente.
* mantenha tipos TypeScript.
* preserve funcionalidades anteriores.

Depois:

* execute testes.
* corrija erros.
* verifique regressões.

---

# 39. FORMATO DE TRABALHO COM O USUÁRIO

O usuário prefere que você trabalhe diretamente.

Não fique perguntando:

“Quer que eu faça X?”

Se X for claramente uma melhoria necessária dentro do objetivo do projeto:

faça.

Depois explique:

* o que alterou.
* por quê.
* quais arquivos.
* testes.
* problemas restantes.

---

# 40. REGRA MAIS IMPORTANTE

Não transformar o 838 em apenas uma lista bonita de modelos.

O núcleo sempre deve continuar sendo:

HARDWARE
+
OBJETIVO
+
MODELO/FERRAMENTA
+
COMPATIBILIDADE
+
DESEMPENHO
+
RECOMENDAÇÃO
+
INSTALAÇÃO.

Sempre preserve essa lógica.