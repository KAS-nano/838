# Limitações conhecidas

Atualizado em 2026-09-16 após revisão do motor e do catálogo. Consulte `TEST_REPORT.md` para resultados executados.

1. **Dependências:** em 2026-09-09, `npm audit --omit=dev` ainda reporta 4 entradas de severidade alta na árvore Prisma (`prisma`, `@prisma/config`, `deepmerge-ts` e `mysql2`). O fix automático propõe downgrade major de Prisma 7 para 6; não foi aplicado. Dependabot separa atualizações de Prisma e a CI exige geração, schema, build e testes antes de aceitar a correção upstream.
2. **Banco/autenticação:** o planejamento registra migrations, bootstrap e smoke do PostgreSQL local em 2026-09-15. Nesta revisão não há banco configurado; o carregamento persistente e o fallback foram testados com repositório controlado. Login, e-mail e recuperação em ambiente hospedado continuam pendentes.
3. **Agente nativo — NÃO EXECUTADO:** Rust/Cargo ausentes. Frontend e estrutura/CSP foram verificados; build Tauri e detecção nativa de hardware não foram executados. GPU Windows/macOS continua best-effort.
4. **Benchmark real — NÃO EXECUTADO:** sem runtime Ollama/LM Studio conectado nesta sessão. Testes do runner usam fixtures; dados incluídos no catálogo e nas faixas são seed/heurística, nunca medição desta máquina.
5. **Catálogo e preços:** o catálogo foi ampliado para 21 modelos em 2026-09-15; as datas de conferência constam nos registros de cada link; podem mudar ou exigir aceite de licença no Hugging Face. Tamanhos usados pelo analisador, desempenho e preços API continuam seed/heurísticos e não devem ser tratados como medições atuais.
6. **Instalação:** receitas preservadas, com fontes registradas e comandos copiáveis. Nenhuma instalação foi executada; comandos dependem do sistema, drivers e versão do upstream.
7. **Compatibilidade:** razões de memória/disco/contexto foram unificadas; backend ainda é inferido pelo texto da GPU e SO, sem validação real de drivers/runtime. O score permanece heurístico.
8. **Previews:** devem ser servidos via HTTP por usarem módulos JavaScript. O endereço `file://` não é suportado. `npm run preview:generate` regenera o motor após alterações TypeScript; `npm run build` já inclui essa geração.
9. **Navegadores:** testes automatizados executados em Brave/Chromium headless. Safari, Firefox e dispositivos físicos — NÃO EXECUTADO.
10. **CSP web:** a política está aplicada em `Content-Security-Policy`, com bloqueio. Scripts e estilos ainda permitem `unsafe-inline`; nonce/SRI continuam pendentes. O agente local mantém CSP própria.

11. **Catálogo nas telas:** modelos, dashboard, comparador, recomendações e API de recomendação consultam a fonte configurada. Falhas, catálogo vazio ou sem variantes usam fallback sinalizado. O preview continua estático.
12. **Ranking:** modalidade e contexto são requisitos de elegibilidade; custo e velocidade têm pesos próprios. Scores, velocidade local, concorrência e custo estimado continuam heurísticos. Ausência de modalidade API é tratada conservadoramente como texto.
13. **Rate limit:** buckets expirados são removidos e a memória é limitada a 10 mil entradas. O controle continua por processo; múltiplas instâncias exigem armazenamento compartilhado.

O frontend pode ser revisado localmente com os comandos do README. Estes resultados não certificam as integrações externas nem uma implantação de produção.
