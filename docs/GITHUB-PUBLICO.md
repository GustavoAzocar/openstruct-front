# Sincronização pública do GitHub (OSF-17)

Base revisada: openstruct-front 0c1f1e18b14fb76d566e7aa15c6d6c4e27bdd175, em 07/11/2026.
Esta camada de atividade reutiliza as fontes públicas da OSF-01. Ela não substitui o catálogo assinado de instalações da OSF-05.

## Fluxo sem backend

1. `Public GitHub data` roda por `workflow_dispatch`, no minuto 23 de cada hora e em mudanças relevantes na master.
2. O job `collect`, com `contents: read`, testa e compila o site, restaura o snapshot anterior e o cache de ETags, e executa `npm run sync:github`.
3. Somente `out/snapshot.json`, validado, segue como artifact de um dia para o job `publish`.
4. O publicador, separado e com `contents: write`, revalida esse arquivo e cria um commit na branch `github-data`. A árvore contém **somente snapshot.json e vercel.json**: dados validados e uma configuração fixa que desabilita o deploy dessa branch. Não há fonte, credencial ou cache de respostas.
5. O frontend lê [o JSON estático](https://raw.githubusercontent.com/ricardocorsini/openstruct-front/github-data/snapshot.json). Não é necessário redeploy horário do Vite/Vercel: o endereço acompanha a branch pública, sujeito ao cache do CDN. A master continua originando o deploy de produção; branches de código podem ter previews. A branch de dados não deve criar deploys.
6. `/community` apresenta horário, indisponibilidade e resumos mínimos. As listas ficam prontas para futuros consumidores; a central `/development` da OSF-18 apresenta o mesmo snapshot por projeto e com prévias de atividade.

O agendamento do GitHub é aproximado, pode atrasar e pode ser desativado após inatividade em repositórios públicos. Confira a aba Actions e reative/execute manualmente quando necessário. O primeiro push da implementação na master inicia a coleta. Branch inexistente na primeira execução usa estado vazio explícito, nunca números inventados.

## Fronteira pública e contrato v4 (compatível com v1/v2/v3)

Allowlist fixa em `src/lib/github-snapshot.ts`:
openstruct-front, consolo-struct, mola-struct, armadura-struct e openstruct-catalog, todos de ricardocorsini.
Nenhuma URL arbitrária, nome recebido do visitante ou repositório privado é consultado.

Antes de cada repositório, a consulta de metadados é **incondicional**. A resposta precisa confirmar `private=false`, `visibility=public`, nome e URL exatos. O REST não fornece um campo chamado public=true.
Se essa confirmação falhar, até os dados anteriores daquele repositório são retirados da nova publicação e seu cache é eliminado. Uma falha temporária nos metadados sacrifica disponibilidade em favor dessa regra.
Após confirmação pública atual, falhas de uma lista preservam somente o último recorte validado daquela lista, como `stale`; as demais continuam.

Não se consulta launcher-struct. Distribuição e informações públicas do Launcher continuam no openstruct-catalog e no fluxo existente do catálogo assinado; atividade do hub não é atividade do código privado do Launcher.

O contrato rejeita campos inesperados, IDs duplicados, fontes externas, e-mails em textos, estados incoerentes e JSON maior que 1.000.000 bytes. Não exporta bodies, comentários, perfis completos, e-mails, nomes pessoais, mensagens de erro remotas ou tokens. Títulos e descrições públicos têm tamanho limitado, caracteres de controle removidos e padrões de e-mail substituídos. As URLs são verificadas contra as fontes autorizadas. O frontend trata textos como texto React, sem HTML remoto.

Cada repositório registra visibilidade confirmada, horário, última coleta totalmente bem-sucedida, resumo, problema e estado das quatro listas. O snapshot registra versão do contrato, geração e eventual `retryAt`. O horário da geração não torna uma lista antiga atual: `checkedAt` e `state` pertencem a cada lista.

## Listas e limites

| Lista          | Seleção e ordem                                    | Limite e interpretação                                                                                               |
| -------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Issues         | Abertas e fechadas, separadamente, por atualização | Até 2 páginas de 30 por estado; PRs são removidos. O resumo aberto é derivado da mesma coleta.                       |
| PRs            | Abertos, atualizados recentemente                  | Até 60; não inclui PRs fechados ou mesclados.                                                                        |
| Milestones     | Abertos, prazo crescente                           | Até 60; `count` é número de issues ainda abertas no milestone.                                                       |
| Contribuidores | Ordem do endpoint GitHub                           | Até 60 usuários identificados; `count` é contributions. Exclui anônimos/bots; não é censo de todas as contribuições. |

`truncated=true` significa que havia próxima página além do teto. `false` significa que o endpoint filtrado terminou, nunca que todo o histórico do projeto foi coletado. `items[].updatedAt` aplica-se a issues/PRs; é null nas outras listas. `id` é número ou login; `title` é título ou login. O resumo `openIssuesAndPullRequests` é a contagem combinada oficial do GitHub, não uma contagem separada de issues.

Paginação segue o Link retornado, restringindo origem, caminho, parâmetros e número de páginas. Links inválidos falham isoladamente. Limite: **60 GETs por execução** (5 × [1 metadado + 3 listas × 2 páginas + 2 estados de issues × 2 páginas + 1 release]); caso usual mínimo: 35. Pedidos são sequenciais, com timeout de 10 s e corpo de até 2 MB. Não há GraphQL, busca nem consulta por visitante à API REST.

ETags persistem via Actions cache em `.cache/github/pages.json`, com apenas páginas já normalizadas. Um 304 reaproveita os dados e a paginação sanitizados, após nova confirmação pública; sem corpo em cache não produz lista vazia fictícia.
403/429 suspendem novos pedidos, respeitando Retry-After (segundos/data), reset quando esgotado e mínimo de um minuto. Não há retentativa imediata nem runner dormindo: `retryAt` atravessa execuções e impede chamadas antes do prazo.
Sem token a API pública também funciona, sob limite de IP. O workflow usa o GITHUB_TOKEN efêmero do job de leitura, sem PAT e sem acesso adicional ao Launcher.

O navegador compartilha uma promessa por janela de cinco minutos, com timeout de 8 s, limite de corpo e validação. Usa último dado válido da sessão se a origem falhar, sempre marcado como desatualizado. Na primeira visita, o fallback local `public/data/github-snapshot.json` informa ausência de coleta. Sem ambas as fontes o conteúdo editorial e os links continuam funcionais. A partir de duas horas ou com falha parcial, o resumo é marcado como desatualizado.

## Manutenção e verificação

- Alterar a allowlist exige revisão do contrato, fontes públicas, testes e documentação; não basta acrescentar uma URL ao workflow.
- Execute `npm test` e `npm run build`. Para coleta local, Node 24 e `npm run sync:github`; GH_READ_TOKEN opcional somente no processo.
- Cache corrompido pode ser removido pela aba Actions/cache; a coleta seguinte reconstrói as páginas.
- Mantenha a branch github-data fora da origem do deploy do site. Não altere a branch de produção da Vercel para github-data. O publicador precisa manter o `vercel.json` próprio da branch em toda atualização; ajustar apenas a master não protege uma árvore de dados recriada do zero.
- Alterar schema exige novo versionamento, migração dos consumidores e invalidação do cache.
- Testes simulam privacidade, paginação/limite, 304, timeout, origem inválida, falha parcial, 403/429 e fallback do frontend.
- Nesta execução, testes e build foram verificados em Actions; o ambiente local e o navegador estão indisponíveis. Não houve inspeção visual desktop/mobile ou dos temas.

Referências: [boas práticas REST](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api), [limites REST](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) e [agendamentos Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Correção de previews indevidos na Vercel — 07/11/2026

A Vercel tentou compilar `github-data` no commit `9b4d4a8` e falhou com
`vite: command not found`. Essa branch não é um aplicativo e não contém
`package.json` ou dependências; instalar Vite nela não é necessário.

- Na master, `vercel.json` desabilita apenas `github-data` via
  `git.deploymentEnabled`, preservando a produção e os previews de código.
- Na branch de dados, o publicador grava uma configuração fixa
  `{"git":{"deploymentEnabled":false}}`, com referência ao schema oficial.
  A Vercel consulta a configuração da branch recebida.
- A publicação não é pulada só porque o snapshot não mudou: a configuração
  também precisa estar presente e corresponder à política fixa. Assim a próxima
  sincronização repara uma branch antiga sem a regra de exclusão.
- A árvore continua restrita a dois arquivos permitidos. A publicação lê ambos
  na mesma ref e atualiza a branch sem force-push.

Testes de publicação simulam criação da branch, reparo de configuração ausente,
atualizações sucessivas, idempotência, snapshot inválido, erro de consulta e conflito
de ref. A configuração usa o mecanismo
[oficial da Vercel para desabilitar deploys por branch](https://vercel.com/docs/project-configuration/git-configuration).

O publicador faz até três GETs e cinco escritas por atualização; se os dois arquivos
já estiverem iguais, faz apenas três GETs. Não são necessários token adicional,
backend ou dependência do Vite na branch de dados. Validação local desta correção:
`npm test` (99 testes) e `npm run build` aprovados. Não há alteração de interface.

## Evolução na OSF-18

O contrato v2 acrescenta a última release estável por repositório. O leitor migra v1 sem inventar releases; o cache Actions usa a chave v2. Ausência de release (404) é um resultado confirmado; falhas preservam a última release pública como desatualizada. A versão distribuída dos aplicativos continua no catálogo assinado, separada da release do repositório. Veja [a documentação da central](CENTRAL-DESENVOLVIMENTO.md).

## Evolução na OSF-19

O contrato v3 acrescenta `issueDetails` com coleções independentes de abertas/fechadas, labels exatas, login/URL pública do autor e contagem de comentários. O resumo aberto existente é derivado sem nova chamada e não é somado às coleções detalhadas. Limite do snapshot: 1 MB, saída compacta; cache e endereço de leitura usam v3. Veja [as definições de cobertura e filtros](ISSUES-CENTRAL.md).

## Evolução na OSF-20

O contrato v4 coleta PRs de todos os estados no mesmo limite de duas páginas,
preservando o orçamento de chamadas. Registra evidência de draft/merge e metadados
públicos, com migração conservadora da antiga prévia apenas aberta. O cache e o
endereço do leitor usam v4. Veja [estados, filtros e cobertura](PULL-REQUESTS-CENTRAL.md).
