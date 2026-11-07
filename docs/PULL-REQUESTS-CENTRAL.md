# Pull requests na central — OSF-20

Revisão: 07/11/2026. Base: `1bcf8f7d889ea052106a6625c103383fa5a8a487`.
OSF-17 e OSF-18 estão atendidas. A prévia anterior mostrava apenas PRs abertos,
sem autor ou evidência de draft/merge; esta entrega cobre essa lacuna.

O coletor usa `/pulls?state=all&sort=updated&direction=desc`, até duas páginas de
30 por repositório. Não adiciona chamadas de detalhe, reviews ou checks; permanece
o orçamento de 60 GETs máximos e 35 no caso usual. ETag/304, timeout, falha parcial,
reconfirmação de visibilidade e suspensão por limites continuam compartilhados.

`ActivityItem.pull` registra somente estado, draft, presença da informação de
merge, merged_at, datas, login público e nomes de branches. Bodies, e-mails,
repositórios dos forks, comentários, reviews e checks não são exportados.

Estados exibidos:

- **Aberto**: open e draft=false.
- **Rascunho**: open e draft=true.
- **Mesclado**: closed com merged_at confirmado.
- **Fechado sem merge**: closed com merged_at explicitamente nulo.
- **Estado detalhado não informado**: evidência insuficiente; não vira aprovação.

O contrato v4 aceita e migra v1–v3, preservando issues e releases. A prévia antiga
de PRs abertos é retirada da cobertura confirmada até uma coleta v4, pois ela não
representa o histórico de todos os estados. O leitor usa `?schema=4`; o cache
Actions usa v4 para não reutilizar páginas normalizadas do contrato anterior.
O fallback local v3 é aceito por essa migração.

Na central, `repo` seleciona o repositório; `pullState` e `pullPage` preservam o
filtro e a página na URL, sem sobrescrever os filtros de issues. A ordenação é por
atualização, com desempate estável e deduplicação por URL. São exibidos dez itens
por página. O filtro limita o conjunto coletado, não todo o histórico do GitHub.
Até PRs abertos antigos podem ficar fora do recorte recente de todos os estados.

Os resumos continuam contando somente PRs abertos/rascunhos desse recorte.
O endpoint de issues exclui qualquer item com `pull_request`, e a central elimina
números de PRs das métricas de issues. Zero, indisponibilidade e dado antigo têm
tratamentos distintos, com links oficiais preservados e data por fonte.

Testes exercitam os quatro estados, ausência de evidência, dados inválidos,
metadados privados, filtros, migração, 304, falha parcial, privacidade e paginação
limitada. `npm test`: 105 testes aprovados. `npm run build`: aprovado.
Estados não existentes nos repositórios reais são verificados por fixtures de
teste, sem publicá-las no site.

Fontes: [API de pulls](https://docs.github.com/en/rest/pulls/pulls#list-pull-requests)
e [boas práticas REST](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).
