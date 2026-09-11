# Operação do 838

## Telemetria disponível

As APIs emitem uma linha JSON por resultado. O coletor da hospedagem pode agregar essas linhas sem ler corpo de requisição, perfil de hardware, endereço de e-mail, chave Pix ou token.

Campos estáveis: `timestamp`, `level`, `event`, `requestId`, `route`, `status` e `durationMs`. `provider`, `cacheStatus`, `estimatorVersion` e `errorType` aparecem somente quando aplicáveis.

As métricas devem ser calculadas a partir desses campos:

- volume, percentil 50/95/99 de `durationMs` e proporção de status por `route`;
- disponibilidade externa por `provider` e status;
- uso do catálogo empacotado por `cacheStatus=fallback`;
- distribuição de chamadas por `estimatorVersion`;
- readiness por status da rota `/api/ready`.

Logs não são um banco de auditoria e não devem receber payloads completos. O `requestId` serve apenas para correlacionar uma resposta com sua linha operacional.

## Objetivos e alertas iniciais

O objetivo mensal inicial das APIs próprias é 99,5% de respostas sem erro 5xx. Respostas 4xx não entram no cálculo porque representam entrada recusada pelo contrato. Os limites devem ser revistos depois de 30 dias de tráfego real.

Configure alertas agregados no provedor de observabilidade:

- crítico: `/api/ready` retorna 503 em duas verificações consecutivas;
- crítico: erros 5xx superam 5% por 5 minutos e também 1% por 1 hora, com pelo menos 20 chamadas;
- atenção: p95 supera 2 segundos por 15 minutos, com pelo menos 20 chamadas;
- atenção: `cacheStatus=fallback` supera 5% do catálogo por 15 minutos;
- atenção: um fornecedor externo retorna 5xx em mais de 10% das chamadas por 15 minutos.

Alertas devem apontar rota, janela, contagem, taxa, p95 e fornecedor. Não inclua conteúdo enviado pelo usuário. Uma falha isolada permanece disponível para diagnóstico pelo `requestId`, mas não deve gerar notificação.

## Verificação depois do deploy

1. Execute `npm run deploy:smoke -- https://838.vercel.app`.
2. Consulte `/api/ready` e confirme status 200 no modo seed.
3. Faça uma recomendação válida e confirme uma linha com `route=/api/recommend` e `estimatorVersion=2.0.0`.
4. Consulte o catálogo e confirme `cacheStatus=miss`; em uma instalação com banco indisponível, confirme `cacheStatus=fallback`.
5. Verifique que nenhuma linha contém corpo, e-mail, chave Pix, `DATABASE_URL`, senha ou token.

O painel e as regras de alerta dependem da conta da hospedagem. Registre uma captura ou exportação datada quando forem configurados.
