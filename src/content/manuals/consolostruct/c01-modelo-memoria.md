## Antes de começar

Este percurso usa a versão web do ConsoloStruct 0.7.1 e o projeto público fictício **Consolos - exemplo de detalhamento**. Para executar a mesma revisão, prepare o ambiente web com Node.js 22.12 ou superior e siga as instruções de execução do [README da versão 0.7.1](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/README.md) a partir do código desse commit.

Baixe o arquivo [consolos-detalhados.lume.json](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/examples/detalhamento/consolos-detalhados.lume.json). Mantenha as entradas do arquivo para reproduzir o resultado mostrado.

## Abra o modelo e confira as entradas

1. Use **Abrir** para carregar o arquivo.
2. Na árvore do projeto, selecione **C01 · Consolo com tirante simples em alças**.
3. Abra **Geometria**, **Ações** e **Materiais** nas propriedades da peça. Confira os valores abaixo nas unidades da interface.

| Campo do exemplo                             | Valor              |
| -------------------------------------------- | ------------------ |
| Largura do consolo                           | 40 cm              |
| Altura no pilar                              | 50 cm              |
| Comprimento do consolo                       | 45 cm              |
| Ações de cálculo vertical e horizontal total | 140,0 kN e 15,0 kN |
| Resistência característica do concreto (fck) | 30 MPa             |

## Calcule e leia a memória

1. Clique em **Calcular** e abra **Memória**.
2. Confirme **C01** no seletor **Peça**.
3. Compare o resumo com os valores observados na captura. A tabela de verificações, abaixo do resumo, mostra as exigências e os valores disponíveis para a peça selecionada.

| Indicador na memória de C01 | Resultado observado |
| --------------------------- | ------------------- |
| Altura útil                 | 46,07 cm            |
| Relação a/d                 | 0,651               |
| Área de tirante necessária  | 4,42 cm²            |
| Área de tirante adotada     | 8,04 cm²            |

![Tela de memória de C01, com o resumo de altura útil, relação a/d e áreas de tirante acima da tabela de verificações](/assets/consolostruct/v0.7.1/memoria.jpg 'Memória de C01 após Calcular no ConsoloStruct 0.7.1, motor 0.4.0.')

Captura feita em 07/11/2026 no Chromium, executando a [revisão oficial 0.7.1](https://github.com/ricardocorsini/consolo-struct/tree/f5267af015b77741b5e31b2a1900056bf43f7740) com o arquivo de exemplo sem alterações. Consulte o [aviso da licença MIT](/assets/consolostruct/v0.7.1/LICENSE.txt).

> [!WARNING]
> O estado **Atende às verificações implementadas** se refere às verificações do motor para estas entradas. Os valores registram a execução do exemplo. A aprovação executiva e as verificações complementares de uma peça real exigem conferência do responsável técnico.

## Fontes da versão

- [Guia de uso do ConsoloStruct 0.7.1](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/docs/GUIA-DE-USO.md)
- [Projeto público com as entradas de C01](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/examples/detalhamento/consolos-detalhados.lume.json)
