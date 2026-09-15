# Privacidade

O 838 foi estruturado para funcionar inicialmente com um perfil local no navegador.

## Perfil local
O onboarding pode ser persistido em localStorage. O usuário pode exportar/importar esse perfil em JSON.

## Favoritos e comparação salva
Favoritos e a comparação salva ficam no localStorage do navegador, separados por origem (endereço do site). Não são sincronizados com uma conta ou enviados ao servidor por essas funções.

A comparação salva contém apenas os modelos, as quantizações e o contexto. Não inclui o perfil de hardware nem resultados de benchmark. Ao recuperar, as estimativas são recalculadas com o hardware atual. Um novo salvamento substitui a cópia anterior; “Apagar cópia salva” remove somente essa cópia. Limpar os dados do site no navegador também remove os dados locais.

A exportação da comparação gera um JSON com modelos, quantizações e contexto. A importação lê esse arquivo no próprio navegador, sem upload ao servidor, e não substitui a cópia salva automaticamente. Compartilhar o arquivo revela as escolhas de modelos e contexto; não inclui seu hardware.

As comparações nomeadas guardam também o nome escolhido por você, com limite de 10 entradas por origem. Elas ficam separadas da cópia rápida e podem ser excluídas individualmente. A exportação da comparação aberta contém apenas a configuração, sem o nome da entrada.

## Benchmark local
Só começa após ação explícita. O benchmark Ollama mede dados técnicos de inferência.

## Comunidade
Envio comunitário é desativado por padrão e exige consentimento explícito. O payload sanitizado não contém hostname, nome de usuário, e-mail, arquivos ou prompt pessoal.

O protocolo v2 envia versões do agente, runtime, driver e sistema, configuração técnica, identificador derivado da chave pública da instalação, hash ou nome do modelo, amostras e picos de memória. Ele usa uma fixture pública; prompts pessoais não são coletados. A chave privada permanece no dispositivo. Submissões legadas sem assinatura ficam em quarentena e não devem alimentar estimativas. O snapshot padrão do agente não coleta hostname, usuário ou nomes de arquivos.

## Agente
Nada é enviado automaticamente. Qualquer sincronização futura deve mostrar quais campos serão enviados antes da confirmação.
