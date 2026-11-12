## Escopo

O MolaStruct 0.5.1 estima a rigidez do conjunto fundação–solo para representar apoios elásticos. Trabalha com sapatas retangulares e blocos sobre uma a quatro estacas. Geometria, ações, materiais, sondagem SPT e camadas alimentam a análise. A matriz 6 × 6 apresenta a rigidez nos seis graus de liberdade e seus acoplamentos. As estimativas de capacidade têm uma seção própria.

## Primeiros passos

1. Selecione uma fundação. Na versão web, o projeto inicial tem dois blocos, uma sapata e uma sondagem fictícia.
2. Abra **Geometria** para conferir as dimensões da fundação e **Sondagem** para consultar o perfil SPT.
3. No painel de resultados, examine os coeficientes de mola. Consulte a memória para identificar o método e as hipóteses usados. A memória também pode ser exportada em PDF.

## Limites

> [!NOTE]
> A versão 0.5.1 tem caráter experimental. A estimativa depende dos parâmetros do solo e das hipóteses do método. O bloco é representado como rígido. A validação com provas de carga e a verificação normativa integral estão pendentes na documentação desta versão.

## Fontes da versão

- [Escopo e execução do MolaStruct](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/README.md)
- [Mapa de funcionalidades da versão](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/docs/FUNCIONALIDADES.md)
- [Identificação do pacote 0.5.1](https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/package.json)
