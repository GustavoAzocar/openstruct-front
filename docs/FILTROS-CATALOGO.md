# Filtros compartilháveis — OSF-13

Base: 0cb23757ca75331db14d3cf31941e4f3de793c48. OSF-01/05 reutilizadas.

Parâmetros: q (até 200 caracteres), category (nome oficial), availability
(all/available/unconfirmed/planned), platform (all/windows/linux), future (1).
Valores inválidos usam os padrões; duplicatas usam o primeiro valor. Os valores
padrão são omitidos ao editar/copiar. Planejamento ativa future explicitamente.
Limpar filtros volta aos quatro aplicativos atuais, sem horizonte futuro.

A URL é a fonte dos controles, sem estado paralelo de seleção. Alterações de
categoria, disponibilidade, plataforma e horizonte criam entradas no histórico.
Uma edição contínua da busca cria uma entrada e substitui somente essa entrada
até perder o foco; voltar/avançar restaura a URL e encerra a sessão de edição.
Copiar link usa a seleção normalizada; uma recusa da área de transferência tem
mensagem explícita e alternativa de copiar a barra de endereços.

Filtros de pacote e plataforma usam exclusivamente products do CatalogProvider,
verificado pela OSF-05. Não usam distribuição editorial, detecção de sistema ou
releases/latest. Dados antigos validados conservam os avisos dos cartões; produto
sem confirmação não vira instalável. Planejamento nunca recebe plataforma.
A seleção por URL compartilha filtros, não congela versões/dados de distribuição.

Ordem: pacote confirmado, demais apps atuais, planejamento; desempate é a ordem
original do registro. Não há nomes alterados nem classificação alfabética local.
As contagens distinguem aplicativos atuais e planejamento. A combinação de
planejamento com plataforma é vazia, com explicação e limpeza dos filtros.

O registro contém dez entradas: quatro atuais e seis planejadas. AnchorStruct e
SlopeStruct exibem “A iniciar”, continuam sujeitos a `future=1` ou
`availability=planned` e não recebem plataforma. Suas páginas informativas não
alteram disponibilidade, ordenação ou contagem dos produtos atuais.

Testes de contrato cobrem roundtrip, valores inválidos, limite da busca, acentos,
combinações, dados indisponíveis/desatualizados, planejamento e ordem estável.

Validação inicial da OSF-13, anterior às propostas da issue #15: 48 testes
aprovados e build TypeScript/Vite concluído. Conferidos no
Chromium: busca combinada com categoria/plataforma, voltar/avançar, link copiado,
limpeza, horizonte com sete entradas e planejamento combinado com plataforma
produzindo vazio explícito. Desktop e largura móvel de 337 px simulada por zoom,
nos dois temas, sem rolagem horizontal. Não houve teste em aparelho físico.

Na issue #15, passaram 233 testes, o build e a auditoria sem erros locais.
O catálogo e as duas páginas novas foram conferidos no Chromium em 320, 390,
768 e 1440 px, nos dois temas, sem rolagem horizontal. Busca, horizonte,
planejamento, plataforma, limpeza e navegação pelos cards também foram verificados.
