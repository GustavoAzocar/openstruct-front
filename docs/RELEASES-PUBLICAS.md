# Histórico unificado — OSF-25

Revisão: 07/11/2026. Base frontend `39a6df0a424fe95933c55058124fd1444814a3d5`.
Rota `/releases`, acessível na central e no rodapé. Funciona no Vite estático:
catálogo público assinado + feed público do Launcher + snapshot de GitHub Actions.
Não há OAuth, banco, serviço pago, token ou chamada REST GitHub no navegador.

## Fontes e confiança

- OSF-05 já verifica o envelope e as assinaturas de todos os pacotes. O leitor
  passa a preservar também o histórico validado, canais, notas limitadas e assets,
  mantendo a seleção estável de instalação. O store compartilha consulta, cache
  reverificado e orçamento de tentativas; falha por produto mantém seu último dado.
- Metadados históricos vêm somente das releases dos distribuidores autorizados:
  ConsoloStruct e MolaStruct nos próprios repositórios; ArmaduraStruct no hub com
  prefixo `armadurastruct-v`; Launcher no hub com prefixo `launcher-v`.
- Histórico do frontend e releases de código do ArmaduraStruct não são publicados
  como instaladores. Prefixos desconhecidos são ignorados. Não se consulta o código
  privado do Launcher. Referências a esse repositório nas notas públicas do hub são
  omitidas; nenhum conteúdo privado é lido.
- A versão atual do Launcher usa o parser de formato/origem de `launcher/latest.json`,
  com timeout e uma consulta por montagem da página. O parser exige os campos de
  assinatura, mas a página não verifica criptograficamente o binário nem afirma isso.
  O feed fornece só a versão atual, não o histórico inteiro.

Uma linha é identificada por produto + versão. O catálogo assinado tem preferência
quando a mesma publicação aparece no snapshot. Não se duplica hub/repo. Um registro
GitHub não catalogado continua como publicação pública com disponibilidade não
confirmada. `prerelease=true` ou sufixo SemVer de pré-release são explícitos; canal
`stable`/`beta` só vem do catálogo validado. Divergência stable/prerelease é exibida.
Stable é canal de distribuição, não validação de engenharia nem maturidade estável.

Cada linha tem tag, data original, produto, canal conhecido, resumo das notas e
links às notas/arquivos reais da própria release. Código só recebe link na fonte
pública correspondente: tag do próprio repo ou referência explícita às fontes do
produto nas notas. Para o Launcher não há link de código privado. Sem notas,
mostra-se sua ausência; nunca se usa README mais novo como changelog de pacote.
Assets não são montados por suposição e a instalação principal continua no Launcher.

## Contrato, segurança e custo

Snapshot **v7** acrescenta `releaseHistory` por repositório, com estado, coleta,
truncamento e até 60 registros normalizados. Contém apenas produto, versão, tag,
título, URL oficial, data, prerelease, texto limitado e referência pública de código.
Validação estrita de campos/origem/prefixo evita misturar os produtos do hub.
Drafts são removidos antes de normalizar ou gravar em cache, mesmo quando o token
de leitura do runner poderia enxergá-los. Nenhum autor, e-mail ou perfil é exportado.

São no máximo duas páginas de 30 por distribuidor, três distribuidores: até **6
GETs adicionais** por execução horária, com ETag/304 e paginação validada. O teto do
coletor com amostras de discussão passa de 90 a 96 GETs; o caso usual usa três GETs
extras. O cache de Actions muda a v7. A publicação permanece restrita ao snapshot e
à configuração que desabilita deploy da branch de dados.

Notas são texto React, sem Markdown executável/HTML remoto, autolinks, imagens ou
anexos. São limitadas a 2.000 caracteres, com controles e e-mails removidos. Em falta
de espaço no limite global do snapshot, amostras de discussão e depois notas são
retiradas, mantendo metadados e marca de texto parcial. Refresh bem-sucedido substitui
a lista, removendo releases retiradas; falhas preservam o último recorte como antigo.

Contratos v1–v6 continuam aceitos; histórico ausente fica desconhecido, não vazio.
A migração v6 preserva milestones e comentários já existentes. Cada origem tem sua
data e estado. CDN e janela de cinco minutos podem servir o snapshot anterior durante
a propagação; a página o identifica e o catálogo continua utilizável.

## Navegação e manutenção

`product` e `page` ficam na URL, com valores inválidos ignorados, página efetiva
limitada ao recorte e histórico voltar/avançar. São oito linhas por página, por data
decrescente e desempate estável. O link de cada versão inclui produto, página e
âncora exclusiva, inclusive para SemVer com metadados. O carregamento da rota é
separado; a âncora é restaurada após os dados e a página chegarem.

O histórico é explicitamente parcial: catálogo até 200 versões por app, snapshot
até 60 releases por distribuidor; o limite do hub é compartilhado. Não há censo de
tags sem release. Os links originais permanecem quando falha uma origem. Para
adicionar um produto, revisar as políticas de assinatura e a lista de distribuidores;
não basta aceitar um novo prefixo recebido remotamente.

Testes cobrem deduplicação, identidade de produtos, canais, drafts, notas inseguras,
recorte, ETag/304, falha parcial, retirada, migração, ordenação e URL. A conferência
visual usa dados públicos reais, desktop/largura móvel simulada e ambos os temas.

Fontes: [GitHub Releases](https://docs.github.com/en/rest/releases/releases),
[catálogo assinado](https://github.com/ricardocorsini/openstruct-catalog/blob/main/catalog.signed.json),
[distribuidores](https://github.com/ricardocorsini/openstruct-catalog/blob/main/distribution.json),
[feed do Launcher](https://github.com/ricardocorsini/openstruct-catalog/blob/main/launcher/latest.json).
