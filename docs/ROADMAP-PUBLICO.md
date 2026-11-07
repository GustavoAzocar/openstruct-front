# Roadmap público — OSF-23

Revisão: 07/11/2026, base frontend `a976974e8c206079423d53761bc51a8c35870464`.
As dependências OSF-17/18 já fornecem coleta pública limitada, cache, publicação
estática e central por repositório. A visão fica em `/development#roadmap`, também
acessível pela Comunidade. Usa o mesmo filtro `repo` e o mesmo loader, sem chamadas
REST por visitante. Não importa o backlog interno nem cria issues ou milestones.

## Fontes e regras

| Origem                                       | Exibição                            | Regra e limite                                                                                                                                                                                   |
| -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Milestone GitHub `open`                      | Milestone aberto                    | Não comprova execução nem prioridade relativa.                                                                                                                                                   |
| Milestone GitHub `closed`                    | Milestone fechado                   | Não comprova implementação, release ou ausência de pendências.                                                                                                                                   |
| `open_issues` e `closed_issues` do milestone | Itens abertos/fechados e percentual | Denominador = soma dos próprios contadores; inclui issues e PRs. Não usa listas truncadas, `open_issues_count` do repo ou média do ecossistema. Zero ou dado desconhecido não produz percentual. |
| `due_on`                                     | Previsão registrada no GitHub       | Só aparece quando fornecida pela API; pode mudar e não é promessa de entrega.                                                                                                                    |
| `updated_at`, `closed_at`, coleta            | Datas identificadas por finalidade  | Data de coleta não é data de conclusão.                                                                                                                                                          |
| MolaStruct `docs/ROADMAP.md`, `[ ]`          | Proposta no documento               | Item pendente na revisão do documento; sem prazo ou início inferido.                                                                                                                             |
| MolaStruct `docs/ROADMAP.md`, `[x]`          | Concluído no documento              | Declaração da fonte, sem comprovar distribuição ou conformidade técnica integral.                                                                                                                |
| ArmaduraStruct README                        | Direções de contribuição            | Texto sem estado individual; não criar cards de pendências porque algumas direções também constam como recursos.                                                                                 |
| Labels                                       | Sem estado derivado                 | Nenhuma regra de prioridade/andamento por label foi identificada nesta revisão; nomes genéricos não viram roadmap automaticamente.                                                               |

Não há regra pública de “em andamento” identificada. Portanto, não se preenche essa
categoria com inferências a partir de comentários, commits, datas, IA ou progresso.
Fechamentos podem incluir itens descartados: o indicador mede fechamento, não entrega.
Cada milestone leva diretamente à lista original com seus itens vinculados.

## Revisões editoriais rastreáveis

- [MolaStruct, docs/ROADMAP.md](https://github.com/ricardocorsini/mola-struct/blob/aeda58309ddadcd53cac16aa1625473391d8efad/docs/ROADMAP.md):
  seleção explícita de cinco itens, mantendo o estado dos checkboxes. Não é o
  documento inteiro nem uma ordenação oficial de prioridade. A fonte não fixa datas.
- [ArmaduraStruct, README](https://github.com/ricardocorsini/armadura-struct/blob/7fd484d4b0be110dea2a15174c3e1bf92b86a043/README.md#contribuir):
  contexto para testes e refinamento CAD, sem atribuir estados não documentados.
- Na revisão das árvores públicas de ConsoloStruct (`54abc400ae43a5a3bdf025df85c327dde1ad5086`),
  frontend (base acima) e hub (`a527a902cb35299c334e01564e83e798cd64c048`), não foi
  identificado documento de roadmap; isso não significa ausência de trabalho.

`src/lib/roadmap.ts` guarda os trechos, ref e data. Sua atualização editorial é
manual, após leitura do documento. A interface distingue essa revisão da coleta
automática de milestones e oferece a fonte imutável e o documento atual. O código
de desenvolvimento e seu roadmap não comprovam recursos dos pacotes distribuídos.
O catálogo de instalações continua separado; quatro produtos planejados não ganham
plataformas, versão ou data de lançamento por aparecerem no catálogo editorial.

## Contrato e atualização

O snapshot **v6** preserva `milestone.state`, `openItems`, `closedItems`, `dueOn`,
`closedAt` e `updatedAt`. Validação estrita recusa campos extras, contadores
inválidos, datas incoerentes e fontes não autorizadas. O coletor confirma a
visibilidade pública antes de consultar cada repositório; o Launcher privado não
é fonte. Bodies, criador e descrição do milestone não são exportados.

A consulta passa de abertos para `state=all`, no máximo duas páginas de 30 por
repositório, com prazo crescente na API. A interface ordena abertos antes de
fechados e depois atualização/identificador, sem ranking inventado. O limite de
chamadas não aumenta: são as mesmas cinco listas de milestones com ETag, timeout e
falha isolada. Cache de Actions passa a v6. Contratos v1–v5 continuam aceitos;
milestones antigos, abertos apenas e sem metadados, viram indisponíveis até nova
coleta. Não viram ausência confirmada de planejamento.

Dados antigos mantêm a identificação e a data; fonte indisponível não vira zero.
O loader público usa `?schema=6` e mantém janela de cinco minutos. Actions publica
na branch `github-data`, que permanece com deploy desabilitado. Documentos fixados
continuam legíveis mesmo sem snapshot. Os links oficiais sempre permanecem.

## Validação

Testes protegem coleta dos dois estados, ETag/304, contadores, origem, zero,
ausência, migração, ordenação, filtros por fonte, dados antigos e falha parcial.
A conferência visual usa desktop e largura móvel simulada, ambos os temas e
links da Comunidade, central e fontes. Milestones positivos são fixtures de teste
quando não existem no snapshot público; nenhuma fixture é publicada como dado real.

Referências: [contrato GitHub de milestones](https://docs.github.com/en/rest/issues/milestones)
e [prioridades do Godot](https://godotengine.org/priorities/) como referência de
apresentação de direções com contexto e fontes, sem transformar desejos em prazo.
