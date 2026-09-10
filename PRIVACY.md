# Privacidade

O 838 foi estruturado para funcionar inicialmente com um perfil local no navegador.

## Perfil local
O onboarding pode ser persistido em localStorage. O usuário pode exportar/importar esse perfil em JSON.

## Benchmark local
Só começa após ação explícita. O benchmark Ollama mede dados técnicos de inferência.

## Comunidade
Envio comunitário é desativado por padrão e exige consentimento explícito. O payload sanitizado não contém hostname, nome de usuário, e-mail, arquivos ou prompt pessoal.

O protocolo v2 envia versões do agente, runtime, driver e sistema, configuração técnica, identificador derivado da chave pública da instalação, hash ou nome do modelo, amostras e picos de memória. Ele usa uma fixture pública; prompts pessoais não são coletados. A chave privada permanece no dispositivo. Submissões legadas sem assinatura ficam em quarentena e não devem alimentar estimativas.

## Agente
Nada é enviado automaticamente. Qualquer sincronização futura deve mostrar quais campos serão enviados antes da confirmação.
