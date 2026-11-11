## Como estruturar um capítulo

1. Identifique a versão coberta e o objetivo do capítulo.
2. Apresente as entradas, as unidades e o resultado que o leitor deve encontrar.
3. Registre a origem das imagens e ligue cada afirmação técnica à fonte da versão.

| Elemento | O que registrar                                             |
| -------- | ----------------------------------------------------------- |
| Fórmula  | Símbolos, unidades, hipóteses e referência                  |
| Captura  | Descrição alternativa, legenda, aplicativo, versão e origem |
| Exemplo  | Pré-requisitos, passos, resultado e limites                 |

> [!NOTE]
> Use a [área de um retângulo](/docs/recursos-editoriais/edicao-1/area-retangular) como exemplo de apresentação de uma única fórmula com substituição numérica.

## Captura com legenda

![Tela da Memória do ConsoloStruct 0.7.1 com o resumo do exemplo C01 e a tabela de verificações.](/assets/consolostruct/v0.7.1/memoria.jpg 'Memória de C01 no ConsoloStruct 0.7.1, motor 0.4.0. Captura da interface web, realizada em 07/11/2026.')

Origem: [registro das capturas e condições de reprodução](https://github.com/ricardocorsini/openstruct-front/blob/88ffb2e06b2e87d7270ff9e4bc40f48937b97e29/docs/CONSOLOSTRUCT-CAPTURAS.md). O [percurso de C01](/docs/consolostruct/edicao-1/c01-modelo-memoria) explica como chegar a essa tela. Consulte a [licença que acompanha a imagem](/assets/consolostruct/v0.7.1/LICENSE.txt).

## Código copiável

Neste exemplo didático, o JSON registra as dimensões de um retângulo. Os sufixos `_m` indicam que os valores estão em metros.

```json
{
  "base_m": 0.2,
  "altura_m": 0.3
}
```

> [!TIP]
> Indique a linguagem do bloco e explique o significado das chaves ao lado do exemplo.

> [!WARNING]
> Este JSON ilustra a documentação de entradas. Para importar projetos, consulte o formato descrito no manual da versão do aplicativo.

## Fórmulas e referências cruzadas

Considere duas regiões retangulares planas que não se sobrepõem, com áreas $A_1 = 0{,}060\,\mathrm{m}^2$ e $A_2 = 0{,}040\,\mathrm{m}^2$. O índice $i$ identifica cada região. A [equação da soma](#eq-areas-somadas) mostra a substituição dos valores, todos em metros quadrados.

$$
\begin{aligned}
A_{\mathrm{total}} &= \sum_{i=1}^{2} A_i \\
&= 0{,}060\,\mathrm{m}^2 + 0{,}040\,\mathrm{m}^2 \\
&= 0{,}100\,\mathrm{m}^2.
\end{aligned}
\label{eq:areas-somadas}
$$

A área média por região é $\bar{A} = \frac{A_{\mathrm{total}}}{2} = 0{,}050\,\mathrm{m}^2$. Na matriz abaixo, a primeira linha contém as duas áreas, em metros quadrados. A segunda linha contém as respectivas frações do total, sem unidade.

$$
\begin{bmatrix}
0{,}060 & 0{,}040 \\
0{,}60 & 0{,}40
\end{bmatrix}
\label{eq:matriz-exemplo}
$$

A leitura da [matriz de áreas e frações](#eq-matriz-exemplo) por coluna identifica a região correspondente. A primeira região representa 60% do total, e a segunda, 40%.

## Glossário

### Âncora

Identificador de uma seção ou equação. O fragmento do link começa com `#`.

### Edição

Revisão do conjunto de capítulos. A cobertura editorial indica a versão do aplicativo à qual a edição se refere.

### Fonte fixada

Material identificado por uma revisão específica, como um commit, uma tag de lançamento ou a edição de uma obra.

## Referências

- [OpenStax, _Prealgebra 2e_, seção 9.4: área de um retângulo](https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids).
- [Manual do GeoSPT-STRUCT, referência de organização editorial](https://github.com/ricardocorsini/GEOSPT-STRUCT/blob/f3f31df7e9dfa35967ceac6f26a950d80014a120/public/manual.html).
