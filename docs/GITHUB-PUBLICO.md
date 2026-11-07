# Sincronização pública do GitHub (OSF-17)

Base revisada: openstruct-front 0c1f1e18b14fb76d566e7aa15c6d6c4e27bdd175, em 07/11/2026.
Esta camada de atividade reutiliza as fontes públicas da OSF-01. Ela não substitui o catálogo assinado de instalações da OSF-05.

## Fluxo sem backend

1. `Public GitHub data` roda por `workflow_dispatch`, no minuto 23 de cada hora e em mudanças relevantes na master.
2. O job `collect`, com `contents: read`, testa e compila o site, restaura o snapshot anterior e o cache de ETags, e executa `npm run sync:github`.
3. Somente `out/snapshot.json`, validado, segue como artifact de um dia para o job `publish`.
4. O publicador, separado e com `contents: write`, revalida esse arquivo e cria um commit na branch `github-data`. A árvore contém **somente snapshot.json**, sem fonte, credencial ou cache de respostas.
5. O frontend lê [o JSON estático](https://raw.githubusercontent.com/ricardocorsini/openstruct-front/github-data/snapshot.json). Não é necessário redeploy horário do Vite/Vercel: o endereço acompanha a branch pública, sujeito ao cache do CDN. O deploy do código só ocorre quando a master muda.
6. `/community` apresenta horário, indisponibilidade e resumos mínimos. As listas ficam prontas para futuros consumidores; esta tarefa não implementa uma central completa de issues.

O agendamento do GitHub é aproximado, pode atrasar e pode ser desativado após inatividade em repositórios públicos. Confira a aba Actions e reative/execute manualmente quando necessário. O primeiro push da implementação na master inicia a coleta. Branch inexistente na primeira execução usa estado vazio explícito, nunca números inventados.

## Fronteira pública e contrato v1

Allowlist fixa em `src/lib/github-snapshot.ts`:
openstruct-front, consolo-struct, mola-struct, armadura-struct e openstruct-catalog, todos de ricardocorsini.
Nenhuma URL arbitrária, nome recebido do visitante ou repositório privado é consultado.

Antes de cada repositório, a consulta de metadados é **incondicional**. A resposta precisa confirmar `private=false`, `visibility=public`, nome e URL exatos. O REST não fornece um campo chamado public=true.
Se essa confirmação falhar, até os dados anteriores daquele repositório são retirados da nova publicação e seu cache é eliminado. Uma falha temporária nos metadados sacrifica disponibilidade em favor dessa regra.
Após confirmação pública atual, falhas de uma lista preservam somente o último recorte validado daquela lista, como `stale`; as demais continuam.

Não se consulta launcher-struct. Distribuição e informações públicas do Launcher continuam no openstruct-catalog e no fluxo existente do catálogo assinado; atividade do hub não é atividade do código privado do Launcher.

O contrato rejeita campos inesperados, IDs duplicados, fontes externas, e-mails em textos, estados incoerentes e JSON maior que 400.000 bytes. Não exporta bodies, comentários, perfis completos, e-mails, nomes pessoais, mensagens de erro remotas ou tokens. Títulos e descrições públicos têm tamanho limitado, caracteres de controle removidos e padrões de e-mail substituídos. As URLs são verificadas contra as fontes autorizadas. O frontend trata textos como texto React, sem HTML remoto.

Cada repositório registra visibilidade confirmada, horário, última coleta totalmente bem-sucedida, resumo, problema e estado das quatro listas. O snapshot registra versão do contrato, geração e eventual `retryAt`. O horário da geração não torna uma lista antiga atual: `checkedAt` e `state` pertencem a cada lista.

## Listas e limites

| Lista | Seleção e ordem | Limite e interpretação |
| --- | --- | --- |
| Issues | Abertas, atualizadas recentemente | Até 2 páginas de 30 entradas REST; o endpoint inclui PRs, que são removidos. Podem restar menos de 60 issues. |
| PRs | Abertos, atualizados recentemente | Até 60; não inclui PRs fechados ou mesclados. |
| Milestones | Abertos, prazo crescente | Até 60; `count` é número de issues ainda abertas no milestone. |
| Contribuidores | Ordem do endpoint GitHub | Até 60 usuários identificados; `count` é contributions. Exclui anônimos/bots; não é censo de todas as contribuições. |

`truncated=true` significa que havia próxima página além do teto. `false` significa que o endpoint filtrado terminou, nunca que todo o histórico do projeto foi coletado. `items[].updatedAt` aplica-se a issues/PRs; é null nas outras listas. `id` é número ou login; `title` é título ou login. O resumo `openIssuesAndPullRequests` é a contagem combinada oficial do GitHub, não uma contagem separada de issues.

Paginação segue o Link retornado, restringindo origem, caminho, parâmetros e número de páginas. Links inválidos falham isoladamente. Limite: **45 GETs por execução** (5 × [1 metadado + 4 listas × 2 páginas]); caso usual mínimo: 25. Pedidos são sequenciais, com timeout de 10 s e corpo de até 2 MB. Não há GraphQL, busca nem consulta por visitante à API REST.

ETags persistem via Actions cache em `.cache/github/pages.json`, com apenas páginas já normalizadas. Um 304 reaproveita os dados e a paginação sanitizados, após nova confirmação pública; sem corpo em cache não produz lista vazia fictícia.
403/429 suspendem novos pedidos, respeitando Retry-After (segundos/data), reset quando esgotado e mínimo de um minuto. Não há retentativa imediata nem runner dormindo: `retryAt` atravessa execuções e impede chamadas antes do prazo.
Sem token a API pública também funciona, sob limite de IP. O workflow usa o GITHUB_TOKEN efêmero do job de leitura, sem PAT e sem acesso adicional ao Launcher.

O navegador compartilha uma promessa por janela de cinco minutos, com timeout de 8 s, limite de corpo e validação. Usa último dado válido da sessão se a origem falhar, sempre marcado como desatualizado. Na primeira visita, o fallback local `public/data/github-snapshot.json` informa ausência de coleta. Sem ambas as fontes o conteúdo editorial e os links continuam funcionais. A partir de duas horas ou com falha parcial, o resumo é marcado como desatualizado.

## Manutenção e verificação

- Alterar a allowlist exige revisão do contrato, fontes públicas, testes e documentação; não basta acrescentar uma URL ao workflow.
- Execute `npm test` e `npm run build`. Para coleta local, Node 24 e `npm run sync:github`; GH_READ_TOKEN opcional somente no processo.
- Cache corrompido pode ser removido pela aba Actions/cache; a coleta seguinte reconstrói as páginas.
- Mantenha a branch github-data fora da origem do deploy do site. Ela contém só dados. Não altere a branch de produção da Vercel para github-data.
- Alterar schema exige novo versionamento, migração dos consumidores e invalidação do cache.
- Testes simulam privacidade, paginação/limite, 304, timeout, origem inválida, falha parcial, 403/429 e fallback do frontend.
- Nesta execução, testes e build serão verificados em Actions; o ambiente local e o navegador estão indisponíveis. Não houve inspeção visual desktop/mobile ou dos temas.

Referências: [boas práticas REST](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api), [limites REST](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) e [agendamentos Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
