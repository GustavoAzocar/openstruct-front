## Escopo

O ArmaduraStruct 0.2.0 é um editor CAD 2D para detalhar armaduras. Trabalha com barras por vértices, estribos, cotas, chamadas e rebatimentos ligados às posições de aço. A relação de aço reúne quantidades, comprimentos e massas teóricas. O projeto editável usa `.armstruct.json` com o esquema `armadurastruct/2`. As saídas incluem DXF, PDF A3 e CSV.

## Primeiros passos

1. Abra o exemplo ou crie um projeto. Em **Importar máscara**, carregue uma referência DXF ASCII ou DWG. Confira a unidade da máscara e verifique uma distância conhecida com **Medir**.
2. Na faixa **Armaduras**, escolha **Barra livre** ou **Estribo**. Selecione uma posição para inspecionar suas dimensões, bitola e quantidade em **Propriedades**.
3. Abra o **Quadro de aço** para conferir as posições. Salve o projeto editável antes de exportar os desenhos e quantitativos.

## Limites

> [!NOTE]
> O escopo desta versão é o detalhamento gráfico e o quantitativo. O dimensionamento e a conferência normativa de ancoragens, emendas, cobrimento e dobras ficam a cargo do projetista. O traspasse é informado manualmente. A compatibilidade DWG depende das entidades do arquivo de entrada. Para a saída CAD, o aplicativo usa DXF.

## Fontes da versão

- [README do ArmaduraStruct 0.2.0](https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/README.md)
- [Guia de comandos e convenções](https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/docs/GUIA.md)
