# 838 — validação da consolidação neon-noir

Data: 2026-09-06. Este documento substitui o relatório de execução de 2026-09-03; relatórios em `reports/ETAPA-*` permanecem históricos.

## Ambiente

- Linux, Node 22.23.2 portátil, npm 10.9.8, Python 3.14.7.
- Next.js 16.3.3 / React 19 / Prisma 7.10.0.
- Playwright 1.63.0 com Brave/Chromium instalado em `/opt/brave-bin/brave`.
- Node/npm estavam ausentes do PATH; runtime obtido com checksum validado. Nesta sessão: `export PATH=/tmp/838-toolchain/node-v22.23.2-linux-x64/bin:$PATH`.

## Comandos e resultados

| Verificação | Resultado |
| --- | --- |
| `npm install` | PASS — dependências e Prisma Client instalados/gerados; lockfile criado |
| `npm run build` | PASS — compilação, TypeScript e geração das 23 páginas concluídas |
| `npm run lint` | PASS — sem erros ou avisos |
| `npx tsc --noEmit` | PASS |
| `npx prisma validate` | PASS — schema válido |
| `npm run test:stages` | PASS — 153 checks, incluindo regressões adicionais de motor/perfil |
| `npm run test:e2e` | PASS — 22 testes (12 Next + 10 preview), 32,5 s; nenhuma falha ou teste ignorado |
| `node scripts/export-preview-catalog.mjs --check` | PASS — preview sincronizado com 14 módulos TypeScript canônicos |
| `node --check` nos JS/MJS de preview e agente | PASS |
| Busca de cores/estilos legados nas fontes visuais | PASS — sem cyan/sky/blue ou hex legados verificados |
| `npm audit` / `npm audit --omit=dev` | ALERTA — 4 entradas high; veja `KNOWN_ISSUES.md` |

O encerramento de uma rodada de build ficou aguardando telemetria após imprimir a compilação concluída. A rodada final executou `npm run build` com `NEXT_TELEMETRY_DISABLED=1` no ambiente do processo e encerrou normalmente. Nenhuma dependência de telemetria foi incorporada ao projeto.

## Navegador

A última suíte conjunta passou os 22 cenários em 32,5 s. Após corrigir também os arcos dos gauges do preview, seus 10 cenários foram repetidos e passaram em 26,4 s. Os assets com versão `?v=20260906` tiveram HTTP 200 verificado novamente.

A suíte valida as duas implementações em **1920×1080, 2560×1440, 1366×768, 768×1024 e 390×844**. Em cada tamanho visita home, onboarding e as 12 áreas principais, verifica HTTP 200, um header global, logo centralizado (tolerância de 3 px), um título visível e ausência de overflow horizontal do documento. Tabelas mantêm scroll próprio.

Cenários funcionais:

- Home → onboarding → validação de campos → objetivos/prioridade → salvar → dashboard.
- Persistência após reload; editar hardware pré-carregado; mudança de RAM e retorno ao dashboard.
- Pelo menos 17 modelos; alteração de quantização/contexto atualiza a análise; origem seed e faixa t/s visíveis.
- Perfil corrompido, `null` ou malformado não provoca erro de runtime/NaN; preview migra a chave histórica.
- Nomes da chuva são elementos independentes, não interativos e sem animação com movimento reduzido.
- Menu móvel abre, navega ao comparador e fecha; seleção altera a coluna comparada.
- Link de catálogo seleciona modelo no Next; troca de modelo de 128K para modelo de 16K ajusta slider e análise.
- Health/catalog APIs retornam 200; recomendação rejeita JSON/hardware/contexto inválidos com 400; sem disco retorna incompatibilidade com razões e origem seed.

As capturas de home, dashboard e onboarding foram inspecionadas. O ajuste visual dos gauges separou números e ponteiros e fez o comprimento dos arcos do preview representar a porcentagem de consumo. HTML, CSS e módulos JS do preview responderam 200 durante a suíte.

## Falhas encontradas e corrigidas na validação

- Referências de assets inexistentes e script errado no onboarding preview.
- `demoBenchmarks` inexistente e schema Prisma com sintaxe compactada inválida.
- Regras ESLint reais detectaram leituras de perfil repetidas, tipos `any` e caminhos de testes fixos; foram corrigidos sem desabilitar regras de aplicação.
- Labels de select incluíam texto de options; rótulos acessíveis explícitos corrigidos.
- Testes antigos esperavam copy/CTA antigos. Assertivas atualizadas para o fluxo único de onboarding.
- Navegação por hash não faz nova requisição de documento: teste verifica 200 via request quando `page.goto` retorna null.
- O menu muda o nome acessível ao abrir; teste usa `aria-controls` para observar o mesmo botão.
- A contagem de options ocorria antes de a tela sair do fallback Suspense em uma rodada. O teste agora espera o seletor visível e usa uma assertiva com espera; não ignora a contagem.

## NÃO EXECUTADO

- Build nativo Rust/Tauri e leitura real de hardware pelo agente.
- Migrations, autenticação e persistência PostgreSQL real.
- Benchmark real em Ollama/LM Studio, instalação de modelos/runtimes e execução de receitas.
- Sincronização real de catálogo/preços externos.
- Safari, Firefox e dispositivos físicos.

Nenhum desses itens está marcado como aprovado. Os resultados certificam o frontend e os cenários locais descritos, sem certificar produção ou integrações externas.

## Rodada de 2026-09-09

A página de modelos, o comparador e a seção opcional de apoio foram validados no Next e no preview independente.

| Verificação | Resultado |
| --- | --- |
| `npm run build` | PASS — 23 páginas geradas |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:stages` | PASS, incluindo motores do comparador e Pix |
| `npm run test:support` | PASS — fixture BR Code, CRC, valor livre e leitura independente do QR |
| `npm run test:e2e` | PASS — 38 testes em Next e preview |

Os testes de navegador cobriram links e quantizações dos 17 modelos, filtros e ordenação do comparador, proporção dos gráficos, limites de contexto, responsividade, QR Pix, cópia da chave/código, fallback quando o clipboard é negado e foco do menu móvel. Nenhum pagamento foi realizado.

## Rodada de segurança e CI — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `npm run check:hygiene` | PASS — nenhum `.env`, certificado ou chave privada encontrado nas fontes |
| `npm run check:versions` | PASS — package, Tauri e Cargo em 1.0.0 |
| `npm run preview:check` | PASS — catálogo/motor e QR sincronizados |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:stages` | PASS — inclui limites HTTP, localhost e configuração de autenticação |
| `npx prisma validate` | PASS — fingerprint comunitário único e índice de moderação válidos |
| `npm run build` | PASS — 23 rotas/páginas |
| `npm run test:e2e` | PASS — 38 testes em Next e preview |

A primeira execução E2E encontrou um servidor Next antigo ainda ocupando a porta 3000 depois de um novo build; seus assets antigos já não existiam. O processo obsoleto foi encerrado e a suíte, executada com o build atual, passou integralmente. Isso não foi tratado como falha do código.

## Rodada do catálogo persistente — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `node scripts/stage25-check.mjs` | PASS — schema, migration, repositórios, bootstrap e contrato versionado |
| `bash scripts/stage26-check.sh` | PASS — candidato válido, hash estável, referências, HTTPS, redirects e falha externa |
| `npx prisma validate` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — catálogo permaneceu como rota dinâmica |
| `playwright regressions.next.spec.ts` | PASS — 2 testes, incluindo contrato dos 17 modelos |

PostgreSQL real não estava disponível no ambiente. A execução de `migrate deploy`, bootstrap repetido e promoção transacional permanece marcada como dependência externa no controle de progresso.

## Rodada do protocolo de benchmark v2 — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage27-check.sh` | PASS — assinatura Ed25519 válida, payload alterado, expiração, coerência, quartis e fingerprint |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npx prisma validate` | PASS |

Os testes usam um par Ed25519 efêmero e não simulam atestado de hardware. A integração da chave privada com o armazenamento protegido do agente e o benchmark real continuam pendentes.

## Rodada do estimador 2.0.0 — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage28-check.sh` | PASS — confiança alta, mediana/IQR, idade, campos divergentes, distância e versão |
| avaliação offline sintética | PASS — MAE, MAPE, cobertura e categorias |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:stages` | PASS — inclui os estágios 27 e 28 e verifica o preview gerado |
| `npm run build` | PASS — 22 rotas/páginas compiladas |
| `playwright frontend.spec.ts` | PASS — 10 testes em desktop, QHD, laptop, tablet e celular |

A avaliação sintética valida a matemática e o contrato. Ela não substitui um conjunto real oculto, que permanece requisito antes de usar o estimador para elevar recomendações em produção.

## Rodada de arquitetura de memória — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage28-check.sh` | PASS — 12 casos, incluindo memória unificada e perfil legado |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:stages` | PASS — todas as etapas históricas |
| `npm run build` | PASS — 22 rotas/páginas |
| Playwright do perfil | PASS — salvamento, dashboard, edição e recuperação de dados inválidos |

O cálculo usa a RAM total como orçamento compartilhado quando o perfil declara memória unificada. A compatibilidade anterior foi mantida: perfis sem esse metadado continuam usando VRAM dedicada e RAM separadas.

## Rodada de prontidão para publicação — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| `npm run deploy:check` | PASS |
| higiene de segredos e chave Pix | PASS |
| preview, tipagem e lint | PASS |
| todas as etapas automatizadas | PASS |
| build Next de produção | PASS — 22 rotas/páginas |

O lançamento inicial foi preparado para catálogo seed, autenticação desligada e submissões comunitárias desligadas. O smoke test externo foi criado, mas depende da URL HTTPS fornecida pela hospedagem e ainda não está marcado como executado.

## Rodada do favicon — 2026-09-09

| Verificação | Resultado |
| --- | --- |
| favicon Next e preview | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run preview:check` | PASS |
| `npm run build` | PASS |
| cabeçalhos | PASS — marca textual 838, sem imagem |

A arte fornecida pelo proprietário é usada somente como miniatura da aba do navegador. O cabeçalho do Next e o cabeçalho do preview continuam exibindo apenas “838”.

## Rodada de produção e observabilidade — 2026-09-10

| Verificação | Resultado |
| --- | --- |
| `npm run deploy:smoke -- https://838.vercel.app` | PASS — HTTPS, home, modelos, health e headers |
| `bash scripts/stage29-check.sh` | PASS — log JSON e readiness por flags |
| teste de mensagem sensível | PASS — URL do banco, senha e token ausentes do log |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

O smoke público foi executado antes da inclusão de `/api/ready`. O script atualizado passará a exigir esse endpoint no próximo deploy. Banco, métricas agregadas, alertas e restauração continuam pendentes e não foram simulados.

## Rodada de CSP bloqueante — 2026-09-10

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — 22 rotas/páginas |
| `npm run test:e2e` | PASS — 38 testes em Next e preview |

A produção agora envia `Content-Security-Policy` em modo bloqueante. O build mantém páginas estáticas e cacheáveis. `unsafe-eval` é acrescentado somente durante desenvolvimento para o Turbopack; não aparece no header de produção.

## Rodada de fechamento dos logs — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage29-check.sh` | PASS — campos permitidos, tipos de erro e readiness |
| injeção de campos extras e `toJSON` | PASS — dados descartados antes da serialização |
| nome de erro manipulado | PASS — convertido para `Error` sem registrar mensagem |
| request ID no limite de 128 caracteres | PASS — correlação preservada |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

O logger monta um objeto novo somente com os campos operacionais permitidos. Valores recebidos fora do contrato em tempo de execução não são copiados para a linha JSON.

## Rodada de métricas operacionais — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage29-check.sh` | PASS — dimensões de cache e estimador preservadas |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — 22 rotas/páginas |

Recomendação, catálogo, integrações e submissão comunitária agora registram resultados agregáveis. A criação do painel e dos alertas na conta da hospedagem permanece uma etapa externa documentada em `OPERATIONS.md`.

## Rodada de backup e recuperação — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| `bash scripts/stage30-check.sh` | PASS — scripts, criptografia, checksum e barreiras de restauração |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

A política registra RPO de 24 horas, RTO de 4 horas, retenção e responsabilidade. A restauração real não foi simulada: continua pendente até existir um PostgreSQL isolado, PostgreSQL Client e uma identidade `age` destinada ao projeto.

## Rodada de privacidade do Hardware Agent — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| `python3 scripts/stage31-check.py` | PASS — schema v2, hostname ausente, limites e avisos |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

O agente limita oito GPUs, 160 caracteres por rótulo, 4 KiB por arquivo sysfs e 64 KiB/5 segundos por consulta nativa. Na primeira verificação, `cargo` e `rustc` não estavam disponíveis; a rodada nativa posterior instalou o toolchain de modo isolado e substituiu essa limitação para Linux.

## Rodada nativa do Hardware Agent — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| Rust 1.95.0 isolado | PASS — toolchain oficial em diretório temporário |
| `cargo fmt -- --check` | PASS |
| `cargo test --locked` | PASS — 2 testes |
| `cargo clippy --locked --all-targets -- -D warnings` | PASS |
| geração do contexto Tauri | PASS — ícone RGBA e configuração carregados |

O `Cargo.lock` com 440 pacotes foi gerado e a CI Linux recebeu os mesmos comandos. Windows, macOS, empacotamento, assinatura e notarização continuam pendentes.

## Rodada de auditoria e expansão do roadmap — 2026-09-11

| Verificação | Resultado |
| --- | --- |
| `node scripts/stage32-check.mjs` | PASS — 12 objetivos com aplicação, testes, aceite e status |
| repositórios externos | PASS — seis projetos oficiais avaliados com condição de adoção |

A criação do roadmap não altera o percentual das funcionalidades: todos os novos objetivos começam em 0% e só avançarão após implementação e evidência de teste.
