# Backup e recuperação

## Política inicial

- **RPO: 24 horas.** No máximo um dia de dados persistidos pode ser perdido.
- **RTO: 4 horas.** O serviço persistente deve voltar em até quatro horas após a decisão de restauração.
- Crie um backup diário e outro imediatamente antes de migration com alteração ou remoção de dados.
- Retenha backups diários por 14 dias e mensais por 12 meses.
- Armazene os arquivos fora do repositório e fora da conta principal do banco.
- A chave privada `age` fica com o responsável pelo projeto e nunca acompanha o backup.
- O responsável atual é o proprietário do repositório 838. Registre um substituto antes de habilitar funções que dependam do banco.

O lançamento público em modo `CATALOG_SOURCE=seed`, `AUTH_ENABLED=false` e `COMMUNITY_BENCHMARKS_ENABLED=false` não depende do PostgreSQL. Esta política passa a ser requisito de produção quando qualquer uma dessas funções persistentes for habilitada.

## Criar uma cópia criptografada

Instale PostgreSQL Client e `age`. Escolha uma pasta que não esteja dentro do projeto e execute:

```bash
export DATABASE_URL='postgresql://...'
export BACKUP_DIR='/caminho/privado/backup-838'
export BACKUP_AGE_RECIPIENT='age1...'
npm run db:backup
```

O script gera um arquivo `.dump.age` e seu `.sha256`. Ele não grava a URL do banco no relatório nem aceita uma pasta dentro do repositório.

## Ensaio de restauração

Crie um banco PostgreSQL temporário e isolado. O script limpa esse banco antes de restaurar; nunca use a URL de produção como destino.

```bash
export BACKUP_FILE='/caminho/privado/backup-838/838-postgresql-AAAAMMDDTHHMMSSZ.dump.age'
export AGE_IDENTITY_FILE='/caminho/privado/keys/838-age-key.txt'
export RESTORE_DATABASE_URL='postgresql://.../838_restore_drill'
export ALLOW_RESTORE_DRILL=true
npm run db:restore:drill
```

O ensaio valida checksum, descriptografia, estrutura do dump, restauração, migrations pendentes e presença das tabelas essenciais. Registre data, duração, versão restaurada e resultado em um chamado privado; não registre URLs, chaves ou dados dos usuários.

Execute o ensaio ao menos a cada três meses e antes de habilitar autenticação ou benchmarks comunitários. Após uma falha, corrija o processo e repita o ensaio; a existência do arquivo sem restauração comprovada não atende esta política.
