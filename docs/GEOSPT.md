# GeoSPT no OpenStruct

Página pública: `/apps/geosptstruct`. Revisão editorial: 10/11/2026.

## Fontes e escopo

O conteúdo descreve a versão 2.0.7 do repositório original
[`itanervale/GEOSPT-STRUCT`](https://github.com/itanervale/GEOSPT-STRUCT/tree/5f5cded75e94dbce2bea90eb685deef74d1dfd1f),
commit `5f5cded75e94dbce2bea90eb685deef74d1dfd1f`, tag `v2.0.7`:

- `README.md`: sete abas, métodos, quatro modos, configurações, autosave e formatos.
- `NOTAS_TECNICAS.md` e `HISTORICO_DESENVOLVIMENTO.md`: referências técnicas e histórico.
- `docs/DESKTOP.md`: instalação, requisitos e adaptação dos arquivos no desktop.
- `public/imagens-manual/`: capturas reais da documentação, com o exemplo Balsas.

O GeoSPT estima capacidade de carga de estacas. A página não oferece uma calculadora,
não afirma aprovação normativa integral nem atribui ao aplicativo o cálculo de recalques,
efeitos de grupo ou dimensionamento de armaduras. O código e o pacote do GeoSPT não
são alterados por esta integração visual.

O README ainda não define a licença. `license.spdx: null` representa essa ausência,
com fonte no próprio README; não herda MIT ou GPL de outro aplicativo.

## Arte e capturas

Arte fornecida pelo responsável pelo OpenStruct:
[pasta de identidade visual do GeoSPT](https://drive.google.com/drive/folders/1iIoKw2T5CrJ9SXVW2rLxU_o5eWVV1-gP).

- WebP revisado: `GeoSPT-Struct_Icone_Web_768x768.webp`, Atena à esquerda e estaca
  cilíndrica à direita. Copiado sem alteração para `public/assets/geosptstruct-athena.webp`.
- Fundo de referência: verde mineral `#238A74`.
- As quatro capturas foram convertidas de PNG para WebP sem perdas, preservando
  dimensões e conteúdo. Origem, descrição e hashes dos derivados estão em
  `src/lib/geospt-media.json`. São registros do manual, não novos testes de instalação.

## Distribuição e atividade

Os instaladores vêm do catálogo Ed25519 verificado, com a política específica
`geosptstruct-v` no hub `ricardocorsini/openstruct-catalog`, fonte
`itanervale/GEOSPT-STRUCT` e chave de pacotes `launcher-packages-v1`.
A página usa os componentes compartilhados de disponibilidade e instalação.

O código-fonte, issues, PRs e créditos apontam ao repositório original. A coleta
pública inclui esse repositório. Snapshots anteriores com as cinco fontes existentes
continuam válidos, acrescentando o GeoSPT como desconhecido até a coleta seguinte.
Os testes históricos usam um fixture assinado fixo de 07/11/2026; os testes de
integração GeoSPT verificam o catálogo atual incluído no site.
