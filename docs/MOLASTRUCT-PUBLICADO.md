# Apresentação pública do MolaStruct — OSF-03

Revisão de **07/11/2026**. O conteúdo disponível para instalar é o aplicativo
**0.5.1**, tag `v0.5.1`, commit `5d22f0626f8feb709a8b3b8301babd9985667d01`.
O código da master consultado é **0.7.0**, commit
`aeda58309ddadcd53cac16aa1625473391d8efad`. São evidências distintas.

## Distribuição e divergências editoriais

- O [catálogo público fixado](https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog.signed.json)
  e a [release v0.5.1](https://github.com/ricardocorsini/mola-struct/releases/tag/v0.5.1)
  oferecem pacotes Windows/Linux x86_64 da versão 0.5.1. Não havia pacote 0.6/0.7
  nessas fontes na revisão.
- O [package.json da tag](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/package.json)
  confirma 0.5.1, embora o README e o título de MOTOR ainda identifiquem a base
  técnica 0.5.0. A versão do pacote não foi deduzida desses títulos antigos.
- O README da tag ainda contém ressalvas sobre instaladores não validados. Elas
  distinguem publicação de validação nativa; não anulam os artefatos publicados
  nem autorizam alegar validação completa Windows/Linux.
- A OSF-01 já fornece versões de código e distribuição, estado experimental,
  pacotes e proveniência. A OSF-03 reutiliza esse registro e atualiza a descrição
  curta para manter catálogo, diálogo e página coerentes.

## Fontes da versão distribuída

Todos os links desta seção apontam ao mesmo commit da tag 0.5.1.

| Afirmação na apresentação                                                                                              | Evidência / seção                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sapatas retangulares, blocos 1–4 estacas, SPT/camadas, CSV/TSV e colagem                                               | [README](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/README.md), Sobre e Funcionalidades; [Funcionalidades](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/FUNCIONALIDADES.md) |
| Cálculo local, memória/PDF, matriz/SPT CSV, geometria DXF, SVG e projeto JSON                                          | README, Sobre e Funcionalidades                                                                                                                                                                                                                                                  |
| Winkler, barra axial/torsional, ligação rígida/rotulada, redutor informado e bloco rígido                              | [Motor](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/MOTOR.md), Estacas em Winkler e Ligação estaca–bloco                                                                                                                    |
| Matriz 6×6, ordem, acoplamentos, Kii, unidades e graus livres                                                          | Motor, Convenções e Matriz e resposta                                                                                                                                                                                                                                            |
| Mindlin/Aoki–Lopes/Steinbrenner, interação vertical, encurtamento, transferência fixa e sapata com recalque central    | Motor, Mindlin / Aoki–Lopes / Steinbrenner, Estacas, Sapatas e Discretização e cobertura                                                                                                                                                                                         |
| Randolph–Wroth simplificado de fuste, disco equivalente e kv/SAFE-Morrison                                             | Motor, seções específicas; [Metodologias](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/METODOLOGIAS.md), Alcance de cada fonte e Escolhas que ainda dependem de calibração                                                   |
| Schmertmann e E0 Aoki opcionais; não recalibram kh/kt/kp                                                               | Motor, Correlação opcional SPT → E e Correlação opcional E0 de Aoki                                                                                                                                                                                                              |
| Aoki–Velloso da estaca isolada, Vésic centrado, referência exploratória SPT; separação capacidade/rigidez              | Motor, Capacidade Aoki–Velloso e Tensão última com fatores de Vésic                                                                                                                                                                                                              |
| Terzaghi pendente, sem resultados                                                                                      | README, Métodos de cálculo; Motor, Referências; Funcionalidades                                                                                                                                                                                                                  |
| Conferência parcial NBR 6122:2022, ações independentes ELS/ELU, limites justificados e pendências                      | [Conferência normativa](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/NBR6122-2022.md), Conclusão, Matriz de atendimento e Como funciona                                                                                      |
| Recusa SPT não demonstra base indeslocável; limitações de contato, grupo, longo prazo e estrutura                      | Conferência normativa, Serviço e contato e O que ainda falta; Motor, domínios e limites de cada método                                                                                                                                                                           |
| Testes analíticos, OpenSees em casos Winkler, ausência de validação geotécnica integral e de equivalência integral TQS | [Validação](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/VALIDACAO.md), Desktop e validação de engenharia e Verificação externa Winkler; Metodologias                                                                        |

As referências são links à descrição pública do próprio produto, não reprodução
de PDFs privados, trechos da norma ou material de terceiros. As edições normativas
são apresentadas como alcance declarado pelo aplicativo, sem certificar a norma
integral ou a obra. A edição de 1996 é somente referência histórica no material
de comparação; não fundamenta a apresentação atual.

## O que não pertence ao instalador 0.5.1

O [histórico da master revisada](https://github.com/ricardocorsini/mola-struct/blob/aeda58309ddadcd53cac16aa1625473391d8efad/CHANGELOG.md)
registra seleção CRH manual/K/nh/SPT/m e tabelas TQS 3829/3836 na **0.6.0**;
sapatas de meio contínuo com constantes k0 FEMA 273 e Teixeira–Godoy na **0.7.0**.
O [README dessa revisão](https://github.com/ricardocorsini/mola-struct/blob/aeda58309ddadcd53cac16aa1625473391d8efad/README.md)
anuncia esses avanços. Eles aparecem somente na seção de desenvolvimento,
explicitamente fora do pacote confirmado 0.5.1.

Os perfis simplificados Randolph e SAFE, que já citam documentação TQS na tag,
não devem ser confundidos com a nova seleção de CRH. O fato de haver um método
documentado pelo TQS não comprova identidade com seu algoritmo ou resultados.

## Atualização posterior

Quando surgir nova distribuição, confira catálogo, release, tag, package.json e
documentos da mesma revisão. Atualize o registro e revise o texto dos métodos e
limites antes de mover uma funcionalidade para a seção disponível. Não basta
elevar uma versão ou substituir os links por master.

Esta tarefa altera apresentação, Docs, descrição editorial e legendas do SVG.
Não modifica motores de engenharia, pacotes ou o catálogo do Launcher. As
conferências desta entrega dizem respeito ao frontend; os testes de engenharia
citados acima são evidências documentais da versão do produto.
