# Segurança

## Princípios
- mínimo de permissões;
- nenhuma execução automática de comandos recebidos da web;
- instalação automática fora do escopo atual;
- receitas de instalação versionadas e com fonte;
- autenticação e benchmark comunitário desligados por padrão;
- localhost nunca é buscado pelo backend hospedado;
- agente sem plugin de shell/http nesta versão;
- consentimento explícito antes de benchmark/envio comunitário.

## Headers web
O projeto configura `nosniff`, `DENY` para framing, política de referrer, Permissions-Policy e isolamento de origem básico.

A CSP usa `Content-Security-Policy` bloqueante e foi validada nos fluxos completos do Next. Scripts e estilos inline ainda são permitidos para preservar renderização estática; a evolução para nonce ou SRI deve ser validada contra custo, cache e suporte do Next antes de remover essas diretivas.

## Limites das APIs
- recomendações: 30 requisições/minuto e corpo JSON de até 16 KiB;
- Hugging Face: 20 requisições/minuto e busca entre 2 e 80 caracteres;
- OpenRouter: 10 requisições/minuto;
- benchmark comunitário: 5 requisições/minuto, corpo de até 16 KiB, validação de origem e deduplicação.

O limitador atual usa memória do processo. Implantações com mais de uma instância devem fornecer armazenamento distribuído antes de ativar autenticação ou submissões comunitárias. `TRUST_PROXY_HEADERS` só pode ser ativado quando o acesso direto à origem estiver bloqueado pelo proxy confiável.

## Segredos
Nunca commitar `.env`, chaves do OpenRouter, `DATABASE_URL` ou `BETTER_AUTH_SECRET`.

## Agente
O agente não possui crate de rede nem permissões de shell/http. O frontend usa apenas a API global local do Tauri.

O snapshot v2 remove hostname, limita strings, quantidade de GPUs e leituras locais. Consultas nativas fixas no Windows/macOS possuem timeout e limite de saída; JSON bruto não é devolvido ao frontend.

## Integridade de benchmarks
O protocolo comunitário v2 valida a fixture pública, intervalos, coerência entre tokens, duração e taxa, idade da medição e assinatura Ed25519. O identificador da instalação é o SHA-256 da chave pública. Isso detecta alteração do payload e permite limitar uma instalação, mas não prova que o hardware declarado é verdadeiro. Por isso, toda medição assinada começa como `pending`; protocolos legados entram como `quarantined` e nenhuma amostra isolada recebe confiança alta.
