# Issues na central (OSF-19)

Base revisada em 07/11/2026: openstruct-front `062b319a908ffb6846d02edd62a4b738c9545b35`. OSF-17 e OSF-18 estão implementadas. Esta entrega evolui a seção existente `/development#issues`, mantendo a central e as fontes públicas autorizadas.

## Comportamento

A lista apresenta repositório, número, título, estado aberto/fechado, labels textuais exatas, login público do autor, atualização e quantidade de comentários. Comentários são apenas uma contagem; bodies, comentários individuais, perfis completos e e-mails não são exportados. Um contador zero confirmado é distinto de um campo desconhecido. Dados não fornecidos em snapshots antigos são identificados como não informados.

Há filtros de repositório, estado e label, busca sem acentos sobre título/número/autor/label/repositório, e páginas de dez itens, ordenadas por atualização decrescente, slug e número como desempate estável. Labels são somente os nomes existentes no conjunto coletado dos repositórios selecionados, incluindo recortes antigos identificados. Nenhuma label como bug/enhancement é exigida ou fabricada. Uma label ausente na URL é ignorada com aviso.

O filtro de repositório junto às issues e o filtro geral usam o mesmo parâmetro. Trocar de repositório mantém estado/busca, reinicia a página e retira a label dependente do repositório anterior. Limpar filtros de issues mantém o repositório e os parâmetros de outras seções.

| Parâmetro    | Valores e padrão                                                                          |
| ------------ | ----------------------------------------------------------------------------------------- |
| `repo`       | Slug da allowlist pública; ausente ou inválido mostra todos. Compartilhado com a central. |
| `issueState` | `open` (padrão), `closed`, `all`.                                                         |
| `issueLabel` | Nome exato de uma label carregada; ausente mostra todas.                                  |
| `issueQ`     | Até 200 caracteres, busca local sem acentos.                                              |
| `issuePage`  | Inteiro positivo; padrão 1, limitado às páginas existentes.                               |

Exemplo: `/development?repo=armadura-struct&issueState=closed&issueQ=geometria#issues`.
URLs copiadas e voltar/avançar restauram a seleção. A digitação cria uma entrada no início da edição e substitui as seguintes até sair do campo, sem uma entrada por tecla. Mudanças de filtros/página geram entradas de histórico; filtros reiniciam a página. O hash é preservado, evitando que uma alteração faça a página voltar ao topo. Ao avançar a paginação, o foco vai para o título da lista. Não há requisição ao GitHub a cada filtro.

## Contagens e cobertura

A lista conta somente issues únicas por repositório + número nas coleções selecionadas, antes da paginação visual. PRs são excluídos pela presença da chave `pull_request`, mesmo se seu valor for null. URLs de PR não passam pelo contrato de issue. `open_issues_count` não é usado como contagem de issues puras.

O resultado distingue quantidade carregada nos estados selecionados, correspondências dos filtros e itens da página. A cobertura detalha repositório × estado, horário, dado antigo/indisponível e se havia mais páginas. Uma lista indisponível nunca representa zero. Zero só é exibido após coleta confirmada; o total do recorte nunca é apresentado como total do repositório. As métricas e os cartões da OSF-18 continuam descrevendo somente issues abertas.

## Snapshot v3 e coleta

`issueDetails.open` e `issueDetails.closed` acrescentam coleções com estado, data, limite e os campos de cada issue. Cada estado usa até duas páginas de 30 entradas REST, ordenadas por atualização. O endpoint mistura PRs, removidos antes da exportação, então o recorte pode conter menos de 60 issues. Os dois estados têm ETag, paginação e último dado válido independentes. Uma falha em fechadas não retira as abertas.

A confirmação pública do repositório continua incondicional antes da coleta. Visibilidade não confirmada elimina também as novas coleções; launcher-struct continua excluído. O resumo aberto `lists.issues` é derivado da mesma coleta, sem GET adicional. Ele é uma projeção para compatibilidade da central: nunca é somado às coleções detalhadas. Uma issue fechada/reaberta entre as duas consultas é reconciliada por evidência atual e atualização mais recente, sem duplicação.

O leitor valida e migra v1/v2 para v3: o contrato anterior confirma somente abertas. Labels, autor e comentários ausentes permanecem null; fechadas ficam indisponíveis, nunca artificialmente vazias. As releases e os demais dados são preservados. `?schema=3` e a chave de cache Actions v3 separam o contrato novo dos dados anteriores em cache.

Títulos são limitados a 200 caracteres; até 30 labels de até 100 caracteres são aceitas com nomes exatos. Labels que não atendam aos limites ou contenham campos inseguros tornam esse campo desconhecido, sem renomear uma label para um texto inventado. Autores limitam-se a login e URL pública autorizada, inclusive bots; não há consulta a perfis.

O limite do JSON normalizado passa a 1 MB, compartilhado pelo leitor, CLI e publicador; a saída é compacta para manter o mesmo limite de bytes. Respostas REST continuam limitadas a 2 MB e timeout de 10 s. Orçamento: **60 GETs máximos** por execução, normalmente **35** com uma página por coleção. São cinco repositórios × [metadados + 3 listas existentes + abertas + fechadas + release]. As demais políticas de 304/403/429/Retry-After e publicação da OSF-17 permanecem.

## Validação

`npm test` protege filtros combinados, acentos, parâmetros inválidos, labels reais, paginação, duplicatas e mistura de PRs, metadata pública, campos desconhecidos/zero, migração, fontes parciais, ETags por estado, limite de páginas, privacidade e fechamento/reabertura entre consultas. `npm run build` valida TypeScript e a saída Vite.

A revisão no Chromium usa o feed real para loading/vazio/cobertura e fixtures exclusivamente locais para paginação, foco, filtros combinados, histórico e títulos/labels longos. As fixtures não são publicadas. Desktop e largura móvel simulada são conferidos em ambos os temas; sem teste em aparelho físico. A captura de entrega deve mostrar o estado real publicado, mesmo quando as listas estiverem vazias.

Fonte: [GitHub — API de issues e distinção de PRs](https://docs.github.com/en/rest/issues/issues).

Resultado desta execução: 85 testes aprovados e build concluído. No navegador, as fixtures locais confirmaram a passagem à segunda página com dez itens, foco no título, filtros combinados, uma entrada de histórico por edição da busca e restauração após recarregar a URL. A conferência de título de 200 caracteres e label de 100 caracteres em 337 px manteve leitura e ausência de rolagem horizontal; os dois temas foram conferidos. O feed real também foi conferido, sem preencher listas vazias com exemplos.

O leitor revalida o JSON HTTP com `cache: no-cache`, preservando a única promessa por janela de cinco minutos. Isso evita somar um cache antigo do navegador à troca de contrato; a consulta continua sendo ao JSON estático, sem token e sem chamadas REST por visitante.
