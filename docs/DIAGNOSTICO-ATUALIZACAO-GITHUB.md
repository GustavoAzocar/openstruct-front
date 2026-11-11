# Atraso da atividade pública — issue #2

Investigação de 11/11/2026, base `88ffb2e06b2e87d7270ff9e4bc40f48937b97e29`.
Todos os horários deste documento são **UTC**. As observações de produção abaixo
são anteriores à implantação desta correção. Não foi criada atividade artificial
para medir o coletor. O comentário de acompanhamento na issue #2 foi excluído dos
exemplos de latência.

## Diagnóstico e decisão

Há dois problemas demonstrados:

1. **Produção de dados:** o workflow está ativo, mas o histórico público não
   apresenta execuções horárias. Entre 07 e 11/11 foram encontradas 13 execuções
   `schedule`, todas bem-sucedidas, com 12 intervalos entre **3h48m52s e
   10h47m55s**, mediana **7h10m58,5s**. Na amostra mais recente, coleta e publicação
   terminam em cerca de um minuto. O atraso de horas antecede a entrega pelo CDN.
   A API não informa por que cada disparo esperado não apareceu ou foi adiado;
   não é possível atribuir a causa interna a filas, concorrência ou quota.
2. **Consumo:** a promessa de cinco minutos não dispara refetch. Os hooks antigos
   só consultavam na montagem/ação manual; `PublicGithubStatus` tinha estado próprio
   e não envelhecia seu resumo pelo relógio. Uma aba podia ficar indefinidamente na
   versão inicial, e atualizar oportunidades não atualizava resumo/contribuidores.

A mudança mantém a arquitetura e corrige o segundo problema: um store compartilhado,
consulta moderada enquanto visível, retorno de foco/visibilidade e estado de frescor
calculado pelo relógio. Não se aumenta o cron para tentar compensar sua irregularidade.
Para o primeiro problema, a ação imediata do mantenedor é conferir Actions e, se
necessário, executar manualmente o workflow original. Uma garantia de cadência exige
uma decisão operacional adicional, descrita ao final.

## Caminho e consumidores

Todas as fontes de atividade passam pela allowlist atual de **seis repositórios**:
`ricardocorsini/{openstruct-front,consolo-struct,mola-struct,armadura-struct,openstruct-catalog}`
e `itanervale/GEOSPT-STRUCT`. A confirmação pública é incondicional a cada ciclo.
O Launcher privado permanece fora da coleta.

| Bloco                           | Origem, seleção, limites e ordem                                                                                                                                             | Consumidores                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Resumo de estrelas e pendências | Metadados REST do repositório; pendências são issues + PRs abertos combinados                                                                                                | `PublicGithubStatus` em Comunidade                  |
| Oportunidades                   | `issueDetails.open`; labels exatas da política por repositório; só fontes recentes; ordenação por atualização; até 6 cards                                                   | `FirstContributions` em Comunidade                  |
| Issues                          | REST `/issues`, estados open/closed separados, atualização decrescente; até 2×30 por estado, excluindo PRs; resumo aberto derivado da mesma coleta                           | Cards e `IssuesList` em Desenvolvimento             |
| PRs                             | REST `/pulls`, todos os estados, atualização decrescente, até 60; cards contam apenas abertos, lista distingue draft/merge/fechamento                                        | Cards e `PullRequestsList` em Desenvolvimento       |
| Detalhes e comentários          | Até 2 itens recentes por repositório; descrição até 4.000 caracteres, amostras de conversa/revisão limitadas; falha retira texto antigo                                      | Detalhes das issues/PRs                             |
| Milestones/roadmap              | REST `/milestones?state=all&sort=due_on&direction=asc`, até 60; contadores são itens vinculados, incluindo PRs; planejamento editorial identificado à parte                  | `PublicRoadmap` em Desenvolvimento                  |
| Contribuidores                  | REST `/contributors?anon=false`, até 60; somente contas User identificadas, sem bots/anônimos; deduplicação e apresentação alfabética por login                              | `Contributors` em Comunidade e páginas dos produtos |
| Commits                         | HEAD da default branch + uma página de até 30 commits fixada naquele SHA; ordem do endpoint preservada; 5 visíveis por vez                                                   | `RecentCommits` em Desenvolvimento                  |
| Release estável                 | REST `/releases/latest`; 404 confirma ausência, falha não equivale a ausência                                                                                                | Cards em Desenvolvimento                            |
| Histórico de releases           | Até 2×30 por fonte distribuidora, sem drafts; filtro por produto/tag e ordenação por publicação; detalhes em `RELEASES-PUBLICAS.md`                                          | `/releases`, acessível pela central                 |
| Distribuição ↔ código           | Catálogo **assinado** seleciona produto/canal; release/tag pública, SHAs resolvidos e comparação GitHub confirmam relação; não usa lista de commits para contar ahead/behind | `CodeRelations` em Desenvolvimento                  |

Na apresentação, o roadmap põe milestones abertos antes dos fechados e depois
ordena por atualização e número. Issues e PRs oferecem filtros e paginação local de
dez itens; o histórico de releases usa oito itens por página. Essas ações não
consultam novamente a API.

`truncated` e filtros delimitam um recorte, não todo o histórico. A contagem do
endpoint de contribuidores é calculada/cacheada pelo próprio GitHub e não é um feed
de commits em tempo real. Nenhum item fora do recorte comprova atraso.

Conteúdo editorial (`apps.ts`, políticas de contribuição, roadmap e créditos com
atribuição, incluindo o registro do PR #1) depende de revisão/commit do frontend.
Downloads e versão instalável dependem do catálogo assinado e de suas verificações.
Nenhum desses dois fluxos deve ser invalidado ou promovido por um refetch da atividade.

## Evidências reproduzíveis

Consulta REST e raw em **11/11, 12:27 UTC**, seguida de Chromium de produção em
**12:28:41–12:28:44 UTC**, nas rotas `/community` e `/development` de
[openstruct-front.vercel.app](https://openstruct-front.vercel.app).

[Workflow](https://github.com/ricardocorsini/openstruct-front/actions/workflows/github-public-data.yml):
`state=active`, cron `23 * * * *`, concorrência única sem cancelamento da execução
em curso. O filtro de paths não é um gatilho para toda atividade nos repositórios.
Os PRs #6/#7 alteraram documentação de IA, fora desse filtro; seu merge não deveria
ser interpretado como disparo de coleta.

| Run agendado                                                                               | Início         | Geração do snapshot | Commit na branch de dados                                                                                               | GETs da coleta / fontes ready |
| ------------------------------------------------------------------------------------------ | -------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| [42870429695](https://github.com/ricardocorsini/openstruct-front/actions/runs/42870429695) | 10/11 17:58:48 | 17:59:04.600        | [fdbd42c](https://github.com/ricardocorsini/openstruct-front/commit/fdbd42c2fa73ad7caf22f3527758329fe9402feb), 17:59:48 | 82 / 6                        |
| [42924505606](https://github.com/ricardocorsini/openstruct-front/actions/runs/42924505606) | 10/11 23:34:36 | 23:34:52.507        | [dd9b566](https://github.com/ricardocorsini/openstruct-front/commit/dd9b56683aaad25f181446fd522bd50fa1e2c3b5), 23:35:32 | 86 / 5                        |
| [42975119779](https://github.com/ricardocorsini/openstruct-front/actions/runs/42975119779) | 11/11 06:49:28 | 06:49:48.426        | [bf47381](https://github.com/ricardocorsini/openstruct-front/commit/bf4738116465260d36f59d00b0d81e3b1e3aff24), 06:50:27 | 86 / 5                        |

Últimos intervalos: **5h35m48s** e **7h14m52s**. `created_at=run_started_at`
nesses três runs; no último, o job collect começou em 06:49:31, terminou em
06:50:15, e publish durou 06:50:18–06:50:31. Logs confirmam restauração do snapshot
anterior, cache ETag v9, 86 pedidos, artifact enviado e publicação com sucesso.
A geração é carimbada no **início** do ciclo; não é o instante exato de cada GET.
A publicação ficou 38,574 segundos após esse carimbo no último ciclo.

No histórico completo retornado (26 runs), houve uma falha antiga:
[42408464988](https://github.com/ricardocorsini/openstruct-front/actions/runs/42408464988),
07/11 19:54:36, no passo de coleta; publish foi pulado. Ela não explica os intervalos
posteriores entre execuções agendadas bem-sucedidas. Não houve execução manual nem
modificação de configuração no original durante esta investigação.

### Exemplos de atividade e idade por coleção

- [Issue #3](https://github.com/ricardocorsini/openstruct-front/issues/3): atualização
  na origem **10/11 22:26:27**. Ausente no snapshot 17:59:04 (anterior ao evento),
  presente no snapshot 23:34:52 com a mesma data do evento. Até coleta:
  **1h08m25,507s**; até publicação: **1h09m05s**. O mesmo ciclo incorporou
  [#4](https://github.com/ricardocorsini/openstruct-front/issues/4) (22:27:28) e
  [#5](https://github.com/ricardocorsini/openstruct-front/issues/5) (22:28:19).
- [PR #6](https://github.com/ricardocorsini/openstruct-front/pull/6) atualizado em
  **11/11 10:39:50**, e [#7](https://github.com/ricardocorsini/openstruct-front/pull/7)
  em **10:50:38**, ainda ausentes no snapshot observado. A default branch já apontava
  a [88ffb2e](https://github.com/ricardocorsini/openstruct-front/commit/88ffb2e06b2e87d7270ff9e4bc40f48937b97e29),
  commit de 10:50:37, enquanto `recentCommits.headSha` era
  `c6feec62d2cdd0b896d1979e67412e6ee7311388`, commit de **10/11 17:15:08**.
  A idade do evento de commit difere da idade da consulta do histórico.

No snapshot bf47381: `generatedAt=2026-11-11T06:49:48.426Z`, `retryAt=null`.

| Fonte              | `verifiedPublicAt`, listas básicas, release, commits e issues abertas | Issues fechadas               | Último ciclo inteiramente válido |
| ------------------ | --------------------------------------------------------------------- | ----------------------------- | -------------------------------- |
| openstruct-front   | 11/11 06:49:48.426, fresh                                             | Mesmo horário, fresh          | Mesmo horário                    |
| consolo-struct     | Mesmo horário, fresh                                                  | Mesmo horário, fresh          | Mesmo horário                    |
| mola-struct        | Mesmo horário, fresh                                                  | Mesmo horário, fresh          | Mesmo horário                    |
| armadura-struct    | Mesmo horário, fresh                                                  | **10/11 17:59:04.600, stale** | **10/11 17:59:04.600**           |
| GEOSPT-STRUCT      | 11/11 06:49:48.426, fresh                                             | Mesmo horário, fresh          | Mesmo horário                    |
| openstruct-catalog | Mesmo horário, fresh                                                  | Mesmo horário, fresh          | Mesmo horário                    |

Às 12:28:41, as coleções com carimbo 06:49 tinham aproximadamente **5h39m**;
a coleção antiga de fechadas do Armadura tinha **18h30m**. O repositório Armadura
estava `partial/problem=request`; não há evidência de qual resposta originou essa
falha. Relações de código tinham checkedAt 06:49 e estados fresh/no-distribution.
Histórico de releases tinha esse horário nas três fontes distribuidoras; nas demais,
unavailable é esperado, pois não são coletadas como fonte distribuidora. Detalhes
recentes de conversa/revisão presentes no snapshot também tinham carimbo 06:49.
`ready/fresh` no arquivo descreve o ciclo original, não garante frescor às 12:28.

### CDN e apresentação real

O conteúdo raw da branch coincidiu com o JSON fixado em bf47381. No Chromium,
ambas as rotas exibiram `generatedAt=06:49:48.426Z`, sem erros JavaScript. Resposta
200, `Cache-Control: max-age=300`, ETag fraco, `x-cache: MISS`, `source-age: 0` na
primeira visita; a consulta seguinte reutilizou uma resposta com `Age: 3`.
A verificação adicional do domínio canônico [www.openstruct.com.br](https://www.openstruct.com.br)
em 12:38:40–12:38:43 confirmou o mesmo generatedAt nas duas rotas, com resposta 200,
`x-cache: HIT` na primeira consulta e `Age: 2` na seguinte, sem erros JavaScript.
A Comunidade dizia “Último resumo em cache” mesmo com resposta pública válida antiga;
a central dizia “Resumo desatualizado”. A correção distingue origem pública antiga
de fallback em cache.

Esses cabeçalhos são uma amostra de um ponto de presença, não uma garantia global
nem medição do tempo de propagação de um novo commit. `cache: no-cache` pede
revalidação; não elimina o cache do CDN. Não foi demonstrado atraso adicional do
CDN nesta observação, e não se acrescentou cache-busting por visitante.

## Reprodução e operação

Com GitHub CLI autenticado para leitura pública (não copiar tokens para o navegador):

```sh
gh api repos/ricardocorsini/openstruct-front/actions/workflows/github-public-data.yml
gh api --paginate 'repos/ricardocorsini/openstruct-front/actions/workflows/github-public-data.yml/runs?per_page=100' --jq '.workflow_runs[] | [.id,.event,.created_at,.run_started_at,.updated_at,.conclusion]'
gh run view 42975119779 --repo ricardocorsini/openstruct-front --log
curl -fsS -D raw-headers.txt 'https://raw.githubusercontent.com/ricardocorsini/openstruct-front/github-data/snapshot.json?schema=9' -o snapshot.json
gh api 'repos/ricardocorsini/openstruct-front/commits?sha=github-data&per_page=10'
```

Compare o arquivo raw com `snapshot.json` fixado no SHA retornado. Extraia geração,
retryAt e **cada** checkedAt/state, além de lastSuccessAt/problem; não use apenas a
data do commit da branch. No DevTools, registre URL, horário UTC, status, ETag,
Age/Cache-Control e generatedAt. Teste primeira visita, navegação por links internos,
aba aberta por mais de cinco minutos, retorno à aba e ação manual. Uma primeira visita
independente deve usar novo contexto, pois um reload não é navegação interna.

Se a coleta parecer parada:

1. Verifique `state=active` e a presença dos eventos schedule no original. Ausência
   de runs e run com erro são situações diferentes. O agendamento pode atrasar e
   repositórios públicos inativos podem ter workflows desativados.
2. Para um run existente, compare `created_at`, início dos jobs e conclusões: falha
   em npm/test/build impede coleta; falha na coleta impede artifact/publicação;
   falha em publish deixa a ref antiga. Não confunda sucesso de collect com avanço
   da ref. Veja artifact, commit pai e configuração inerte da branch.
3. Inspecione `retryAt`. Um 403 com `Retry-After`/quota zerada sustenta limite;
   um 403 de permissão não deve ser explicado como quota sem esses indícios. O
   coletor atual recua conservadoramente em ambos, classificando-os como rate-limit;
   essa limitação diagnóstica permanece e não explica os intervalos sem runs.
4. Um mantenedor pode usar **Run workflow** no original. Não é necessário redeploy.
   Não execute o publicador deste fork como mecanismo de teste: seu destino é fixo
   no original e as permissões de leitura/escrita continuam separadas.

## Comportamento e orçamento após a correção

- Um store por documento compartilha resultado, requisição pendente, relógio e
  cooldown entre todos os consumidores. Navegação interna preserva esse estado.
- Em aba visível, o relógio verifica expiração a cada 30 s; novo GET estático após
  cinco minutos do término da consulta anterior. Sem polling oculto. Foco/retorno
  consulta imediatamente se expirado, sem ignorar cooldown.
- Ação manual invalida apenas uma resposta já concluída com sucesso, com intervalo
  mínimo de **um minuto**. Todos os blocos recebem a mesma resposta. Isso evita que
  a consulta automática torne o botão permanentemente indisponível. Falhas não
  podem ter seu backoff ignorado pelo botão.
- Falhas usam último snapshot validado ou fallback local explícito; tentativas
  seguintes em **5, 10, 20, 30 minutos**, respeitando Retry-After/reset quando
  expostos por CORS. Sem corpo 304 válido não há sucesso inventado; normalmente o
  cache HTTP combina 304 + corpo e entrega 200 ao fetch. Timeout segue em 8 s,
  teto em 1 MB, sem credenciais e sem REST por visitante. Ao desmontar o último
  consumidor, o timer/listeners param e a consulta pendente é cancelada.
- Frescor é reavaliado pelo relógio, inclusive verifiedPublicAt/checkedAt antigos
  sob uma geração nova. Limite de duas horas e proteção contra rollback permanecem.
  Cada seção conserva a diferença entre coleta válida, dado antigo e indisponível;
  datas de atividade continuam separadas de geração/tentativa nesta aba.

A coleta medida fez **82, 86 e 86 GETs** nos três ciclos reais. O código atual limita
pedidos a `6 × (2 + 5 × 2) + 6 + 30 + 48 + 10 = 166` por execução com todas as
opções ligadas, mais uma leitura do catálogo assinado. Esse é o teto efetivo do
request compartilhado, não uma promessa de que toda coleção atingirá o recorte
máximo antes do teto. A documentação antiga de 154 era anterior à sexta fonte.
Com uma execução/hora, até **166 GETs/hora**, versus cerca de 86 observados;
a cada 15 minutos seriam até **664/hora**, sem resolver atrasos do agendador.
304 reduz transferência e pode reduzir quota primária sob autenticação, mas ainda
é requisição e pode contar para limites secundários. Não se reduziu timeout,
limites, backoff nem validação; a cadência de coleta permanece inalterada.

O navegador faz normalmente **12 GETs estáticos/hora por aba ativa**, compartilhados
entre os blocos, e zero GETs GitHub REST. A ação manual fica limitada a um por minuto,
e não aumenta a quota do coletor. Não há coordenação entre abas independentes.

## Meta, validação e limites

Meta verificável do cliente: **após o JSON novo estar disponível na origem HTTP
consultada**, uma aba visível e saudável deve adotar a versão em até **5min30s +
duração da requisição** (timeout de 8 s); foco/retorno expirado e ação manual elegível
consultam imediatamente. Todos os consumidores adotam o mesmo objeto. Essa meta
não inclui cron, tempo de coleta/publicação, propagação do CDN, falha de rede,
backoff nem throttling de timers pelo navegador/sistema.

No Chromium local, o build anterior reproduziu a falta de refetch após cinco minutos
e a divergência: atualizar oportunidades deixou resumo e contribuidores no snapshot
anterior. A validação com duas respostas controladas usa dados somente dentro do teste,
sem escrever no GitHub. No build corrigido, testa-se adoção automática, atualização
manual compartilhada e navegação entre rotas; testes unitários cobrem TTL, deduplicação,
foco/visibilidade, limpeza/cancelamento, cooldown, 304, timeout, 403/429, fallback,
rollback e geração nova com coleção antiga. Também passaram no navegador: aba oculta
sem polling e retorno/foco deduplicado, envelhecimento acima de duas horas, fallback
da sessão, fallback local, ambas as origens indisponíveis e as duas rotas a 390 px
sem rolagem horizontal, mantendo links e conteúdo editorial. Não houve erros JavaScript.
`npm test` (**186 testes**), `npm run typecheck` e `npm run build` passaram. O build
conserva o aviso já existente de chunk acima de 500 kB. A auditoria estática
`npm run audit:content` passou com zero erros locais; as duas revisões editoriais
relatadas são diferenças preexistentes entre documentação e catálogo assinado, fora
do fluxo de atividade. Um teste de renderização estática protege o hook compartilhado. A suíte existente de coletor/publicador
continua cobrindo ETags, falhas parciais e falha/conflito de publicação.

**Pendente após merge/deploy:** comparar pelo menos três novas publicações reais
com a linha de base acima, durante 24–48 h (ou prolongar se houver menos ciclos).
Registrar evento natural → checkedAt → generatedAt → commit github-data → resposta
HTTP → ambas as rotas, incluindo aba aberta e retorno. Não há comparação em produção
“depois” nesta contribuição, pois o PR e o deploy ainda não ocorreram. Não se promete
tempo real nem se considera atendida uma garantia de cadência do coletor.

Se a meta operacional for coleta em até duas horas, o histórico atual **não atende**.
O mantenedor deve decidir entre aceitar o agendamento aproximado com verificação
operacional, ou fornecer agendador externo que dispare o mesmo workflow com
credencial restrita e monitore a ausência de avanço da branch. Gatilhos por eventos
nos demais repositórios exigem mudanças/permissões lá e ainda dependem de Actions.
Agendador externo/alertas têm custo, credenciais e manutenção: são propostas,
sem infraestrutura, tokens novos ou alterações silenciosas nesta contribuição.
