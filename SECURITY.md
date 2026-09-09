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

Uma CSP inicial funciona em modo `Content-Security-Policy-Report-Only`. Ela deve permanecer em observação no staging antes da adoção de nonce e promoção para bloqueio.

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
