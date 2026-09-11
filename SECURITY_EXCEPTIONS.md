# Exceções temporárias de segurança

Exceções não tornam uma vulnerabilidade corrigida. Cada item possui escopo, compensação e vencimento; a CI volta a falhar após a data indicada.

| IDs | Dependência | Exposição no 838 | Compensação | Responsável | Vence em |
| --- | --- | --- | --- | --- | --- |
| GHSA-ggr8-5vv4-36mx | `deepmerge-ts` via Prisma CLI | Configuração local do Prisma; sem objetos recursivos controlados por usuários | validação fechada de configuração e Prisma fixado | mantenedor do 838 | 2026-12-11 |
| GHSA-3f6p-5ww8-9rcr, GHSA-rgwj-5xj2-c3m3 | `mysql2` via Prisma CLI | sem uso: aplicação e migrations usam PostgreSQL | nenhum endpoint MySQL e `DATABASE_URL` PostgreSQL | mantenedor do 838 | 2026-12-11 |

Reavaliar ao atualizar Prisma ou antes do vencimento. Remover a exceção assim que a cadeia deixar de conter o pacote vulnerável.
