# Apresentação pública do ArmaduraStruct — OSF-04

Revisão de **07/11/2026**. A versão disponível para instalar é **0.2.0**, tag
`v0.2.0`, commit `c25baa3b6b914670eccc58e40c87e06732d9019b`. A distribuição
usa o [hub OpenStruct](https://github.com/ricardocorsini/openstruct-catalog/releases/tag/armadurastruct-v0.2.0),
com pacotes Windows/Linux x86_64 publicados em 06/11/2026.

## Coerência da versão distribuída

- O `package.json`, o README, o GUIA e o CHANGELOG da tag identificam a 0.2.0.
- A captura local `public/assets/armadurastruct-editor.webp` corresponde exatamente
  ao conteúdo visual de `docs/preview.png` da tag: cabeçalho v0.2.0, faixa de
  ferramentas e abas Projeto/Propriedades. Não contém hierarquia ou Pranchas.
- O projeto editável da tag usa o schema **`armadurastruct/2`**. Arquivos 0.1 são
  migrados ao abrir; versões anteriores do aplicativo não abrem o formato 2.
- A licença do aplicativo é **GPL-3.0-or-later**, conforme o arquivo LICENSE da
  mesma tag. Ela não é atribuída automaticamente ao frontend ou aos demais apps.

## Mapa das afirmações

Todos os documentos abaixo estão fixados no commit da tag 0.2.0.

| Conteúdo da página                                                                                                                | Evidência                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CAD 2D, barras, estribos, seguir fôrma, repetição/faixa, rebatimentos, cotas, chamadas e cortes                                   | [README](https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/README.md), Recursos; [GUIA](https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/docs/GUIA.md), Espaço de trabalho, Comandos e Posições |
| Relação de aço vinculada, bloqueio/atualização, comprimentos geométricos e peso teórico                                           | GUIA, Relação de aço e conferência; Comprimento, cotas e peso                                                                                                                                                                                                                                |
| DXF ASCII e DWG somente como máscaras; unidades, relatório e compatibilidade limitada                                             | README, Recursos e Convenções; GUIA, Importação e entrega                                                                                                                                                                                                                                    |
| Projeto `.armstruct.json`, máscaras normalizadas e schema `armadurastruct/2`                                                      | README, Convenções; GUIA, Importação e entrega                                                                                                                                                                                                                                               |
| DXF, PDF A3 e CSV como saídas; ausência de exportação DWG                                                                         | README, Recursos e Convenções; GUIA, Importação e entrega                                                                                                                                                                                                                                    |
| Coordenadas/geometria em mm, cotas em cm e comprimentos do quadro em m                                                            | README, Primeiros passos e Convenções; GUIA, Coordenadas e Comprimento                                                                                                                                                                                                                       |
| Traspasse informado manualmente e somado às duas peças                                                                            | README, Convenções; GUIA, Dividir e emendar poligonais                                                                                                                                                                                                                                       |
| Ausência de dimensionamento, verificação normativa, ancoragem, cobrimento, dobra mínima, perdas e otimização de corte automáticos | README, Convenções e limites; GUIA, Dividir e Comprimento                                                                                                                                                                                                                                    |
| Processamento e arquivos locais                                                                                                   | README, apresentação da versão e Executar                                                                                                                                                                                                                                                    |
| GPL-3.0-or-later e dependência GPL para leitura DWG                                                                               | [LICENSE](https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/LICENSE); README, Licença                                                                                                                                                          |

O fluxo editorial segue quatro etapas: **importar máscara → detalhar → conferir
quantitativos → salvar/exportar**. O projeto JSON é a fonte editável; DXF, PDF e
CSV são entregas e não conservam todos os vínculos do aplicativo.

## Recursos posteriores na master

A master consultada está no commit
`2b19db198eba2ad4174b366df457521d3dc45808`. Seu `package.json` ainda informa
0.2.0, mas o [CHANGELOG](https://github.com/ricardocorsini/armadura-struct/blob/2b19db198eba2ad4174b366df457521d3dc45808/CHANGELOG.md)
marca como **Em desenvolvimento**:

- hierarquia por pavimento, elemento e detalhamento composto, edição isolada e
  transferência de objetos;
- gerenciador de pranchas, folhas A0–A4, vistas, abas e composição vetorial em
  milímetros de papel;
- migrações sucessivas e salvamento atual no formato **`armadurastruct/5`**.

Esses itens não são anunciados como parte da distribuição 0.2.0. Uma nova página
de release, tag e entrada no catálogo precisam existir antes de promover qualquer
um deles para o quadro de recursos disponíveis. O número do `package.json` da
master, isoladamente, não prova paridade com o binário da tag.

## Alcance desta tarefa

A OSF-04 altera somente o frontend: textos, fluxo, quadro de formatos, links de
origem e distinção da master. Nenhum motor, importador, exportador, instalador ou
catálogo de distribuição foi modificado. A verificação funcional desta entrega
cobre a apresentação web; as capacidades do produto são citadas a partir dos
documentos e da captura congelados na tag.
