# Detalhes e comentários públicos — OSF-21

Revisão em 07/11/2026, base `7ad9df9a25061b498fef31e74dd0f017add03ce8`.
OSF-19 e OSF-20 estão implementadas. Faltavam descrição e conteúdo dos comentários;
os contadores existentes não forneciam uma conversa nem contexto de revisão.

## Coleta limitada

O snapshot v5 acrescenta `discussions` por repositório público autorizado. São
selecionados **até dois itens mais recentemente atualizados**, entre issues e PRs
das listas confirmadas. Apenas esses itens recebem consultas de detalhes:

- `/issues/{n}`: descrição da issue ou do PR, com identidade e URL conferidas.
- `/issues/{n}/comments?per_page=5&page=1`: até cinco comentários de conversa.
- `/pulls/{n}/comments?per_page=5&page=1`: até cinco comentários de revisão, só nos PRs.

Cada amostra informa data e se existe página seguinte. Os cinco primeiros
comentários da consulta não representam todo o histórico nem necessariamente os
mais recentes. Não são coletados pareceres de aprovação, checks, anexos, avatares,
diffs, perfis completos ou repositórios de forks. O permalink da revisão e, quando
presentes, arquivo/linha públicos preservam o acesso ao contexto original.

O runner `sync-github.mjs` habilita explicitamente `includeDiscussions: true`.
O coletor pode continuar sendo usado apenas para resumos com essa opção desligada.
O teto com detalhes é **90 GETs por execução**, até 30 adicionais ao teto de 60
dos resumos. Sem itens selecionados, nenhuma chamada adicional é feita. Não há
chamada à API por visitante, OAuth, banco ou serviço pago.

Descrição: até 4.000 caracteres. Comentário: até 2.000. Arquivo: até 300. A
abreviação é identificada na interface. IDs, datas, links GitHub exatos, categorias
e campos permitidos são validados; e-mails em texto são removidos. O teto global
de 1 MB continua vigente; detalhes são retirados antes de ultrapassá-lo.

## Atualização, remoção e falha

Detalhes e comentários são consultados sem cache condicional de textos a cada
coleta. Nenhum texto de detalhes antigo é copiado para a nova publicação. Se
um item deixar a seleção, seu detalhe é retirado. Um 404, erro de rede, limite ou
falha de validação retira o conteúdo da categoria afetada. Uma categoria com falha
não é exibida como zero comentários nem apaga a outra categoria que foi atualizada.
Uma consulta bem-sucedida vazia confirma zero **naquela data e categoria**.

A visibilidade do repositório é reconfirmada antes de qualquer detalhe; mudança
para privado ou falha nessa confirmação remove todos os seus dados públicos do
novo snapshot. Continua a existir a latência de uma coleta aproximadamente horária
e do CDN. Se o próprio feed estático falhar, o loader pode mostrar o último snapshot
da sessão identificado como desatualizado, com suas datas; não se alega informação
em tempo real nem remoção instantânea na janela do visitante.

## Interface e segurança

`DiscussionDetails` é usado pelas listas de issues e PRs, dentro de `<details>`
nativo, sem dependência nova. A descrição e os comentários são nós de texto React
por `PublicDiscussionText`; HTML, Markdown, scripts, links `javascript:` e sintaxe
de imagens permanecem texto. Não há interpretação de HTML nem carregamento de
imagens/anexos. Só os links oficiais explicitamente validados são clicáveis.

Conversa geral e revisão têm seções distintas. Os itens fora da seleção mostram
uma explicação e acesso ao GitHub; não recebem comentários fictícios. O botão
**Continuar a conversa no GitHub** é apenas navegação externa, sem login ou envio
pelo site.

O leitor aceita v1–v4 e migra para v5 sem fabricar detalhes. A migração v4 mantém
a evidência real dos PRs. As migrações antigas preservam as restrições da OSF-20.
Revalidação do resultado migrado e restauração pelo coletor são testadas. O leitor
usa `?schema=5`; o cache de páginas de resumos Actions usa v5.

## Validação

Testes cobrem conversa/revisão, links de contexto, injeção renderizada com React,
conteúdo removido, falhas isoladas, privacidade, seleção, limites e migração do
snapshot real anterior. As situações ausentes dos repositórios reais são simuladas
apenas em testes. A inspeção visual usa desktop e largura móvel simulada, nos dois
temas; não instala os aplicativos de engenharia nem testa um aparelho físico.

Fontes: [comentários de conversa](https://docs.github.com/pt/rest/issues/comments)
e [comentários de revisão](https://docs.github.com/en/rest/pulls/comments).
