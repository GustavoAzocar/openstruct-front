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

## Fronteira pública e contrato v5 (compatível com v1/v2/v3/v4)

Allowlist fixa em `src/lib/github-snapshot.ts`:
openstruct-front, consolo-struct, mola-struct, armadura-struct e openstruct-catalog, todos de ricardocorsini.
Nenhuma URL arbitrária, nome recebido do visitante ou repositório privado é consultado.

Antes de cada repositório, a consulta de metadados é **incondicional**. A resposta precisa confirmar `private=false`, `visibility=public`, nome e URL exatos. O REST não fornece um campo chamado public=true.
Se essa confirmação falhar, até os dados anteriores daquele repositório são retirados da nova publicação e seu cache é eliminado. Uma falha temporária nos metadados sacrifica disponibilidade em favor dessa regra.
Após confirmação pública atual, falhas de uma lista preservam somente o último recorte validado daquela lista, como `stale`; as demais continuam.

Não se consulta launcher-struct. Distribuição e informações públicas do Launcher continuam no openstruct-catalog e no fluxo existente do catálogo assinado; atividade do hub não é atividade do código privado do Launcher.

O contrato rejeita campos inesperados, IDs duplicados, fontes externas, e-mails em textos, estados incoerentes e JSON maior que 1.000.000 bytes. Os resumos não exportam bodies ou comentários. A OSF-21 acrescenta somente amostras limitadas de descrição e comentários públicos, conforme o contrato de detalhes. Não exporta perfis completos, e-mails, nomes pessoais, mensagens de erro remotas ou tokens. Títulos e descrições públicos têm tamanho limitado, caracteres de controle removidos e padrões de e-mail substituídos. As URLs são verificadas contra as fontes autorizadas. O frontend trata textos como texto React, sem HTML remoto.

Cada repositório registra visibilidade confirmada, horário, última coleta totalmente bem-sucedida, resumo, problema e estado das quatro listas. O snapshot registra versão do contrato, geração e eventual `retryAt`. O horário da geração não torna uma lista antiga atual: `checkedAt` e `state` pertencem a cada lista.

## Listas e limites

| Lista          | Seleção e ordem                                    | Limite e interpretação                                                                                               |
| -------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Issues         | Abertas e fechadas, separadamente, por atualização | Até 2 páginas de 30 por estado; PRs são removidos. O resumo aberto é derivado da mesma coleta.                       |
| PRs            | Todos os estados, por atualização                  | Até 60 no conjunto; distingue aberto, rascunho, mesclado e fechado sem merge.                                        |
| Milestones     | Abertos e fechados, prazo crescente                | Até 60; v6 preserva estado e contadores de itens vinculados (issues + PRs), previsão e fechamento.                   |
| Contribuidores | Ordem do endpoint GitHub                           | Até 60 usuários identificados; `count` é contributions. Exclui anônimos/bots; não é censo de todas as contribuições. |

`truncated=true` significa que havia próxima página além do teto. `false` significa que o endpoint filtrado terminou, nunca que todo o histórico do projeto foi coletado. `items[].updatedAt` aplica-se a issues, PRs e milestones; é null em contribuidores. `id` é número ou login; `title` é título ou login. O resumo `openIssuesAndPullRequests` é a contagem combinada oficial do GitHub, não uma contagem separada de issues.

Paginação segue o Link retornado, restringindo origem, caminho, parâmetros e número de páginas. Links inválidos falham isoladamente. Limite: **60 GETs de resumos por execução** (5 × [1 metadado + 3 listas × 2 páginas + 2 estados de issues × 2 páginas + 1 release]); caso usual mínimo: 35. Pedidos são sequenciais, com timeout de 10 s e corpo de até 2 MB. Não há GraphQL, busca nem consulta por visitante à API REST.

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

## Evolução na OSF-21

O contrato v5 acrescenta descrição e amostras separadas de conversa e revisão
para até dois itens recentes por repositório. O runner habilita essa coleta sem
requisições por visitante. O teto passa a 90 GETs e os textos antigos não são
reutilizados quando sua atualização falha. Leitor e cache de páginas usam v5.
Veja [limites, remoção, privacidade e renderização](DETALHES-COMENTARIOS.md).

## Roadmap (OSF-23)

O contrato v6 amplia os milestones para `state=all`, com contadores e datas oficiais.
Contratos anteriores são migrados sem inferir estados ou progresso. A central
reutiliza o snapshot e mostra planejamento separado do catálogo de instalação.
Consulte [regras, fontes editoriais e manutenção](ROADMAP-PUBLICO.md).

## Créditos e histórico (OSF-24/25)

A Comunidade deduplica os contribuidores já coletados por login, sem ranking ou
coleta de perfis: [regras de créditos](CONTRIBUIDORES.md). O snapshot v7 acrescenta
histórico público de releases, excluindo drafts antes do cache e preservando as
fontes por produto. São até seis GETs adicionais, sem mudar a lista de repositórios
públicos ou as permissões: [contrato, confiança e cobertura](RELEASES-PUBLICAS.md).

## Relação entre distribuição e código — OSF-52 (08/11/2026)

O esquema atual é **v8**; o leitor aceita v1–v7, migra para v8 e inicia
`codeRelations: []` sem inventar comparações. A migração de v7 preserva seu histórico
de releases e os dados públicos anteriores. URL do leitor usa `?schema=8` para
separar caches. A branch `github-data` continua publicando apenas JSON validado e
configuração inerte; a interface não consulta REST nem precisa de token.

`sync-github.mjs` consulta o catálogo assinado uma vez com o leitor da OSF-05. A seleção
é verificada por produto, separadamente nos canais stable e beta; uma pré-release mais
recente não substitui stable. Sem pacote válido, há estado sem distribuição ou
indisponível, nunca uma tag promovida a download. A interface atual mostra a relação
do canal stable para instalar; beta permanece separado no snapshot e histórico.

Para Consolo/Mola, a associação é a release pública do próprio repositório e a tag
`v<versão>`. Armadura distribui no hub com `armadurastruct-v<versão>`, mas só resolve
`v<versão>` em **armadura-struct** quando a release pública do hub declara o link
correspondente. Ausência do vínculo gera fonte não confirmada. Não se usa
`target_commitish`, `/releases/latest` do hub, package.json nem datas para escolher
SHAs ou determinar ancestralidade. A branch comparada é a default branch pública,
confirmada pelos metadados do repositório em cada coleta; não se presume master.

Cada relação registra produto/canal/versão, data do catálogo, hashes dos pacotes,
release usada como fonte, repositório de código, tag, SHA-base e SHA fixado, branch e
SHA-head, estado, relação, ahead/behind, checkedAt, evidência e URL com SHAs da
comparação. Somente os totais e status do endpoint são usados. `?per_page=1` limita
a resposta: a lista recebida não é contada nem exportada, e arquivos/diffs/mensagens,
autores e e-mails de commits nunca entram no snapshot/cache de comparação. Totais
acima de 250 continuam sendo totais; não são tratados como tamanho de uma página.

Tags leves são resolvidas por `git/ref/tags`; tags anotadas são seguidas por
`git/tags` até commit, no máximo três objetos, com detecção de ciclo. A branch é
resolvida por `git/ref/heads` com ref codificada. A comparação usa os SHAs resolvidos,
confere `base_commit`, merge-base, status e coerência dos contadores. Links publicados
fixam os SHAs, permitindo inspecionar o histórico efetivamente consultado.

O primeiro SHA observado é preservado em `pinnedBaseSha` nas próximas coletas da mesma
versão/canal. Quando o registro editorial tem proveniência fixa para aquela versão,
ela também deve coincidir. Tag movida, ausente, vínculo removido ou resposta incoerente
não conserva contadores como atuais. Sem proveniência fixa anterior, a primeira
observação não demonstra que a tag nunca mudou no passado. A declaração de fonte
**não é atestação de que o binário foi construído daquele SHA**.

Estados de coleta: fresh, stale, unavailable, unconfirmed e no-distribution.
Relações confirmadas: identical, ahead, behind e diverged. Ahead exige ancestralidade
a partir da base; behind representa a branch em um ancestral da tag; 6/1 é diverged,
nunca “6 commits atrasada”. Cherry-picks, backports e branches de manutenção podem
divergir legitimamente. Sem dado não há zero nem mensagem de atualizado.

A visibilidade pública dos repositórios fonte **e distribuidor** precisa ser
reconfirmada antes dessa etapa; falha elimina as relações exportadas, inclusive as
anteriores. Launcher privado não é consultado e não recebe comparação por proxy do
hub. Se o catálogo falhar mas a visibilidade continuar confirmada, só se conserva o
último dado conhecido marcado como antigo. Se versão/canal/URL ou hashes não coincidirem
com o catálogo mostrado no navegador, os contadores são ocultados até coleta compatível.

A coleta usa o request compartilhado: timeout, ETag/304, limite de corpo, 403/429,
Retry-After e reset já existentes. O cache armazena somente metadados normalizados.
Cada produto/canal acrescenta no máximo sete chamadas (release exata se fora do recorte,
tag, até três objetos anotados, branch, comparação); a reserva é **48 chamadas** para
seis seleções. Sem beta publicado, não há chamadas Git adicionais para esse canal.
O teto global passa de 66+30 para **66+30+48 = 144** requisições GitHub por execução,
mais uma leitura limitada do catálogo; na prática ETags e canais vazios reduzem isso.
As falhas ficam isoladas por produto/canal, com estado parcial no repositório.

## Últimos commits — OSF-53 (revisão em 08/11/2026)

O esquema atual é **v9** e o leitor usa `?schema=9`. A migração de v1–v8 preserva
as coleções existentes (inclusive as relações OSF-52 em v8) e acrescenta
`recentCommits` como **unavailable/não coletado**, sem inventar vazio confirmado.
O fallback estático também usa v9 e mantém generatedAt nulo e fontes desconhecidas.
O publicador continua validando o contrato e o teto de 1 MB antes de gravar github-data.

Cada fonte da allowlist possui `recentCommits` com state, checkedAt, branch,
headSha, truncated, problem e items. Cada item contém SHA completo, URL exata do
commit, assunto (máximo 240 caracteres e indicador de corte), autor/committer
como contas públicas associadas (login, User/Bot e URL), authoredAt e committedAt.
Nomes e e-mails brutos do Git, corpo da mensagem, imagens, patches e arquivos não
são exportados. Contas não confirmadas e datas ausentes permanecem nulas, com
fallback explícito na interface. Bots são identificados pelo type da API, sem
inferir autoria pelo assunto. O assunto é texto não confiável: controles/bidi e
endereços de e-mail e padrões comuns de credenciais/tokens são removidos antes
do corte de tamanho; React escapa HTML sem Markdown, anexos ou
links automáticos. URLs de commits precisam coincidir com repositório e SHA;
perfis aceitam apenas o login GitHub correspondente ou seu caminho de app/bot.

Após confirmar private=false e visibility=public, a coleta usa a default branch
real, resolve seu HEAD e consulta **uma página de até 30 commits fixada no SHA**.
Preserva a ordem retornada pelo endpoint List commits, sem ordenar por data ou
SHA e sem prometer que datas informadas no Git são monotônicas. Duplicados são
removidos por repositório/SHA, conservando a primeira ocorrência. Não há página
seguinte na coleta; o Link rel=next marca truncamento. O frontend mostra cinco
itens por vez e “Mostrar mais” apenas revela o restante já coletado, sem REST por
visitante. O número exibido é o tamanho do recorte, nunca o total do repositório.
“Ver histórico completo” aponta à branch correta, codificada inclusive com barra.

O cache ETag contém somente metadados normalizados e é revalidado em respostas
304. Históricos de HEADs anteriores são retirados do cache após uma coleta válida;
branches renomeadas e force-push não misturam revisões. Falha mantém o último
recorte conhecido com state=stale e checkedAt original, somente se a visibilidade
continuar confirmada. Ausência de cache gera unavailable, não “nenhum commit”.
Repositório vazio só é confirmado por resposta explícita de repositório vazio ou
consulta vazia do histórico padrão após ausência da ref; 404, autenticação ou
conflito genérico não bastam. Quota compartilhada conserva o horário anterior e
marca o recorte como antigo. Perda/falha de confirmação pública retira a coleção
e seu cache conforme a política existente. O Launcher privado nunca é consultado;
os commits do hub pertencem ao catálogo e à distribuição, não ao seu código.

São no máximo **duas chamadas por fonte / dez adicionais** por execução (HEAD e
histórico; a confirmação excepcional de vazio substitui a consulta de histórico).
O teto total é **66+30+48+10 = 154 GETs**, mais a leitura do catálogo assinado já
existente. O request compartilhado mantém timeout, corpo limitado, 403/429,
Retry-After e reset de quota. Cache de Actions muda para v9. Se necessário para
respeitar 1 MB, após retirar amostras de conversa e notas, o coletor reduz o recorte
de commits conservando o HEAD e a ordem relativa, e marca truncated=true.

Em `/development`, o seletor existente controla todas as fontes. A seção `#commits`
e os links dos cards conservam os demais parâmetros da URL. Voltar/Avançar e reload
preservam a seleção. A quantidade visível reinicia ao trocar seleção, branch ou HEAD.
SHA completo é consultável em details; a cópia usa a área de transferência do
navegador com status acessível, ou orienta a seleção manual se não houver permissão.
Autor e committer e suas respectivas datas possuem rótulos separados. A data
principal é a data de registro no Git, não o horário de coleta nem a data de release.

Esta coleção é independente de compare.commits e não contém apenas trabalho após
uma release. A OSF-52 continua usando os totais do endpoint de comparação. Assuntos
não são changelog, garantia de qualidade, validação de engenharia ou recomendação
para instalar uma branch. Nenhuma política de releases ou motor de engenharia é alterado.
