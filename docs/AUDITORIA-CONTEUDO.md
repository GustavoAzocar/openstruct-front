# Auditoria de links e revisão editorial — OSF-49

Revisão: 08/11/2026. Base: `7578bd4212593b91ea2a4dd1f089599a321bb27e`.
A OSF-01 já fornece o registro tipado em `src/lib/apps.ts`; a verificação reaproveita
esse registro, as políticas públicas e o verificador criptográfico da OSF-05.
Não há backend, serviço pago, token do visitante ou dependência de execução no navegador.

## Executar e ler

- `npm run audit:content`: determinístico, sem rede; integrado à CI após build.
- `npm run audit:external`: acrescenta a consulta ao catálogo assinado atual e URLs
  externas. Uso rápido: `npm run audit:external -- --limit=8` (1–120 sondagens HTTP).
- `out/content-audit/report.json`: contrato v1 com coleta, cobertura, origem/data do
  feed, observações externas e achados com arquivo/linha/URL/ação.
- `out/content-audit/report.md`: leitura humana; também publicado no resumo da Action.
  `error` bloqueia apenas por erro local determinístico. `review` solicita revisão
  humana; `inconclusive` não significa link quebrado. Nenhum deles altera o conteúdo.

A CI guarda o relatório por 14 dias. A Action **External content review** executa
ao publicar mudanças no verificador, manualmente ou diariamente às 09:47 UTC (06:47 em Fortaleza), aproximadamente;
agendamentos do GitHub podem atrasar e dependem de Actions habilitado no branch padrão.
Não cria issues, comentários, commits ou duplicações de tickets. Use a mesma URL/arquivo
no relatório para acompanhar uma correção. O relatório não é uma lista pública do site.

## Cobertura local

O auditor lê o roteador real, resolve suas páginas, inclusive lazy, e renderiza cada
uma com os providers existentes em memória. Não mantém uma segunda lista manual de
rotas. Sintaxe de rota não reconhecida exige adaptação explícita e falha, em vez de
omitir a página. A saída identifica as rotas verificadas.

Verifica links e imagens do HTML inicial, atributos JSX absolutos, URLs e mídia de
registros TypeScript, fontes CSS, manifestos e documentos Markdown (README e docs),
incluindo links relativos, âncoras de títulos e referências `[texto][nome]`. Artigos
atuais da página Docs estão no HTML renderizado. Destinos absolutos do próprio domínio
são tratados como locais. Âncora inválida, rota desconhecida, referência Markdown não
definida ou arquivo inexistente são erros. O snapshot assinado local deve passar pelo
contrato/assinatura; URLs editoriais de pacote respeitam a origem pública de cada app.

Para URL literal, arquivo e linha apontam à origem. Uma URL calculada por expressão que
não está escrita literalmente usa o arquivo renderizador, com marca **destino calculado**;
a linha é o primeiro ponto de link dessa página, não uma precisão falsa de source map.
Essa limitação aparece também no JSON. O navegador não é iniciado pelo auditor.

Não cobre conteúdo remoto de issues/PRs, estados após interação, diálogos fechados,
âncoras criadas apenas por dados remotos ou a existência de fragmentos em sites externos.
O parser Rolldown já usado pelo Vite é declarado como dependência de desenvolvimento
com versão fixa para a leitura do TSX. Layout e CatalogProvider aceitam renderização
no servidor somente para essa auditoria, sem mudar o fluxo do navegador.
Não substitui os testes de contratos dos feeds/galerias nem os testes de interação.
Para novos formatos de artigos ou destinos gerados, amplie a extração e seus testes.

## Rede e cache

Sem credenciais, com requisições seriais, limite total de 120 sondagens HTTP por execução,
timeout de 8 s por requisição e cancelamento do corpo. HEAD é o padrão; GET apenas
quando HEAD não é aceito (405/501), e conta no mesmo orçamento. Não baixa instaladores
inteiros. Redirecionamentos são relatados para revisão sem seguir outro destino:
HTTP 3xx não vira link quebrado nem prova de disponibilidade do arquivo final.

404/410 indicam candidato a link público quebrado, sujeito à revisão; GitHub pode
mascarar recurso privado como 404. 401/403 indicam autenticação/limite; 429 indica quota;
5xx, timeout, DNS e demais falhas são inconclusivos. Retry-After e reset de quota são
respeitados por host, inclusive entre execuções com cache. Não há retry em loop.
Hosts sem resposta entram em pausa durante a execução. Erros contam no orçamento.
URLs externas não recebem token; o repositório privado do Launcher não é sondado.

Cache em `.cache/content-audit/links.json`, restaurado por Actions, retém só metadados
HTTP e datas, sem corpos/páginas. Validade: sucesso 24 h, 404/410 7 dias, demais falhas
1 h, respeitando cabeçalhos de quota. ETag permite 304 apenas com observação válida
anterior; data da observação original fica visível quando não houve nova consulta.
URLs ainda não sondadas/mais antigas são priorizadas, para não deixar as últimas
eternamente fora do orçamento. Itens omitidos pelo orçamento são inconclusivos.
Sem cache, o checker continua limitado e seguro. JSON de relatório limita-se aos
arquivos públicos do checkout; não recebe uploads nem procura repositórios privados.

A leitura do feed usa separadamente o leitor existente: uma consulta HTTPS de até 10 s,
corpo limitado e assinatura verificada antes de ler versões. Falha conserva a comparação
com o snapshot assinado do checkout, marcada como tal; não apresenta isso como consulta
atual. Nenhuma diferença muda textos, capturas ou disponibilidade automaticamente.

## Evidência de versão atrasada

Execução em 08/11/2026: catálogo oficial assinado, publicado em
`2026-11-07T19:53:18.985Z`, sinalizou ConsoloStruct **0.6.0 → 0.7.1** e ArmaduraStruct
**0.2.0 → 0.3.0**. MolaStruct permaneceu em 0.5.1. Fonte:
https://raw.githubusercontent.com/ricardocorsini/openstruct-catalog/main/catalog.signed.json

O relatório classifica essas diferenças como revisão editorial, sem atualizar os textos
nem atribuir recursos da master ao instalador. Compara a versão **distribuída documentada**
com o canal estável validado; ignora diferenças de versão do código e do motor.
O teste reproduz atraso editorial com uma cópia do registro e o catálogo assinado real,
sem alterar arquivos oficiais. Outros testes simulam rota/âncora/mídia/artigo ausente,
404/410, autenticação, quota, timeout, 304, cache, rotação do orçamento e redirecionamento.

Referência operacional: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
