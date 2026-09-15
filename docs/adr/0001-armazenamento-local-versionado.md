# ADR 0001 — Armazenamento local versionado

- Estado: aceito
- Data: 2026-09-15

## Contexto

O modo seed precisa funcionar sem conta e sem banco. Perfil, favoritos, comparações e cenários devem sobreviver ao recarregamento, mas falhas ou formatos antigos não podem apagar dados válidos. Links de cenário não devem expor o perfil da máquina.

## Decisão

Cada tipo de dado usa uma chave própria no `localStorage`, um campo `version` e um limite explícito de tamanho e quantidade. Toda leitura valida a estrutura antes de entregá-la à interface. Conteúdo corrompido gera uma mensagem e permanece armazenado para possível recuperação; uma falha de escrita preserva a cópia anterior.

Compartilhamento acontece somente após ação do usuário. O link de cenário contém apenas objetivo, contexto, resposta, concorrência, latência e prioridade. Nome, identificador local, hardware e perfil ficam fora da URL. Campos desconhecidos e versões incompatíveis são recusados.

Sincronização futura deve ser opcional, manter a cópia local e definir resolução de conflito antes de ser ativada.

## Consequências

- Os dados ficam separados por origem do site e não acompanham automaticamente o usuário entre dispositivos.
- Mudanças de schema exigem migração ou mensagem clara de incompatibilidade.
- URLs compartilhadas são legíveis por quem as recebe e não devem ganhar campos livres sem nova revisão de privacidade.
- Testes devem cobrir corrupção, indisponibilidade, limites, migração e ausência de dados pessoais.
