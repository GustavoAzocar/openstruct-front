## Escopo

O ConsoloStruct 0.7.1 reúne a modelagem de consolos simples curtos e muito curtos de concreto armado, as verificações locais do estado limite último (ELU) e o detalhamento. A memória reúne as verificações de cada peça. O detalhamento apresenta elevação, planta, cortes e quadro de aço. Esta edição descreve o aplicativo 0.7.1 com o motor 0.4.0, política LC-ELU-2026.2.

## Primeiros passos

1. Abra um projeto ou crie um com **Novo projeto**. O aplicativo salva projetos em `.consolo.json` e também abre os arquivos anteriores `.lume.json`.
2. Selecione uma peça. As propriedades organizam geometria, ações, materiais, armaduras e parâmetros de cálculo.
3. Use **Calcular** e abra **Memória** para consultar as exigências, os valores disponíveis e o resultado de cada verificação.

Siga o [exemplo C01, do modelo à memória](/docs/consolostruct/edicao-1/c01-modelo-memoria), para percorrer essas etapas com o projeto público da versão.

## Limites

> [!NOTE]
> O motor trata o ELU estático local. A análise da estrutura global, as verificações de serviço e a conferência executiva da peça permanecem sob responsabilidade do projetista. As combinações de ações são informadas no projeto.

## Fontes da versão

- [README do ConsoloStruct 0.7.1](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/README.md)
- [Guia de uso da versão 0.7.1](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/docs/GUIA-DE-USO.md)
- [Critérios e domínio de cálculo do motor](https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/docs/CRITERIOS-DE-CALCULO.md)
