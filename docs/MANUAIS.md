# Manuais do OpenStruct

A [central de documentação](/docs) reúne os manuais dos aplicativos atuais e os
recursos editoriais. Use o [capítulo-modelo](/docs/recursos-editoriais/edicao-1/modelo-editorial)
e seu [arquivo Markdown](../src/content/manuals/modelo-editorial.md) como ponto de
partida. Para um percurso de uso completo, consulte o
[exemplo C01 do ConsoloStruct](/docs/consolostruct/edicao-1/c01-modelo-memoria).

## Adicionar um capítulo ou manual

1. Localize o sistema em [manual-chapters.ts](../src/lib/manual-chapters.ts). Os
   sistemas de aplicativos usam o mesmo ID, nome e repositório de
   [apps.ts](../src/lib/apps.ts). Localize o registro do aplicativo em `appManuals`.
2. Escreva o capítulo em `src/content/manuals/`. Use um arquivo próprio para cada
   capítulo de cada edição. O campo `source` é relativo a esse diretório e precisa
   ser único no registro.
3. Na edição, informe o ID, o título, o estado editorial, a data de revisão
   (`AAAA-MM-DD`) e a cobertura. Para cada capítulo, informe `slug`, `title`,
   `summary`, `order`, `keywords`, `source`, `status`, `reviewedAt` e `sources`.
   IDs e slugs aceitam letras minúsculas, números e hífens. A ordem é um inteiro
   positivo, único na edição.
4. Marque `currentEditionId` somente depois de tornar a edição pública. O
   roteador, o sumário, a navegação entre capítulos e o índice de busca são
   derivados dos metadados e do Markdown. Para incluir conteúdo, basta editar
   o registro editorial e os arquivos Markdown.

O capítulo C01 pertence à primeira edição de `appManuals.consolostruct`.
As três constantes em `sources` são referências fixadas já declaradas no mesmo
arquivo. Este exemplo mostra todos os campos do capítulo.

```ts
const c01: ManualChapter = {
  slug: 'c01-modelo-memoria',
  title: 'C01: do modelo à memória de cálculo',
  summary: 'Abra o exemplo público, confira as entradas e acompanhe o resultado da peça C01.',
  order: 2,
  keywords: ['C01', 'primeiros passos', 'unidades', 'modelo', 'memória', 'captura'],
  source: 'consolostruct/c01-modelo-memoria.md',
  status: 'sample',
  reviewedAt: '2026-11-11',
  sources: [consoloGuide, consoloReadme, consoloExample],
};
```

O auxiliar `initialSampleEdition` preenche a ordem, o caminho, o estado e a data
das primeiras amostras. Para criar uma edição, acrescente um objeto `ManualEdition`
com os campos explícitos à lista `appManuals[systemId].editions`. Uma edição
`draft` contém capítulos `draft` e fica fora da navegação e da busca. Use
`sample` para amostras públicas e `reviewed` para uma edição revisada com ao
menos um capítulo `published`. Use `reviewedAt: null` enquanto o conteúdo for
rascunho.

## Cobertura, fontes e histórico

- Em `coverage.version`, registre a versão efetivamente revisada. Para uma faixa
  de versões revisada editorialmente, informe também `coverage.range` com os
  limites inclusivos `min` e `max`. Inclua a versão revisada dentro da faixa e
  cite as evidências dos limites. Para amostras sem cobertura confirmada, use
  `null` em `coverage`.
- Em `sources`, fixe cada afirmação técnica a uma tag de versão ou a um SHA
  completo do repositório oficial do aplicativo. Informe a mesma ref no campo
  `ref` e na URL HTTPS da fonte. Use tags no formato `vX.Y.Z`. Nas legendas de
  capturas, identifique o aplicativo e a versão. Junto à figura, registre origem,
  condições de reprodução e licença.
  A [captura da memória do ConsoloStruct](CONSOLOSTRUCT-CAPTURAS.md) serve de exemplo.
- A edição editorial e a versão do aplicativo têm funções distintas. A
  disponibilidade de distribuição vem do catálogo assinado. O snapshot público
  acrescenta publicações cuja distribuição pode estar por confirmar. Use os
  avisos de versão para orientar a próxima revisão editorial.
  [Contrato e fontes de releases públicas](RELEASES-PUBLICAS.md)
- Para cobrir outra versão, confira as fontes fixadas, as telas e os passos
  afetados. Publique uma edição com ID novo e altere `currentEditionId` depois
  de revisar o conteúdo. Preserve os IDs e os arquivos das edições anteriores
  para manter os endereços compartilhados.

## Endereços e recursos de edição

Os níveis são `/docs`, `/docs/<sistema>`,
`/docs/<sistema>/<edicao>` e `/docs/<sistema>/<edicao>/<capitulo>#<secao>`.
Os títulos geram âncoras como `#antes-de-comecar`. Preserve os títulos que
determinam âncoras publicadas e a ordem de títulos repetidos. Em links para outros
capítulos, prefira a rota com o ID da edição e o fragmento da seção.

Escreva em Markdown. Use títulos, listas numeradas, tabelas, links, código
cercado com a linguagem, imagens com texto alternativo e notas em citação.
Use destinos internos ou URLs HTTPS para os links.
Coloque `[!NOTE]`, `[!TIP]` ou `[!WARNING]` sozinho na primeira linha da citação
e acrescente o texto nas linhas seguintes. Uma imagem isolada com título entre
aspas gera a legenda da figura. Use arquivos em `public/assets/` com
destinos `/assets/…`. Para equações, use `$…$` na linha e `$$` para
delimitar blocos. Dê um único rótulo a cada equação que será citada.

```md
Veja a [equação da área](#eq-area-retangular).

$$
A = b h
\label{eq:area-retangular}
$$

> [!NOTE]
> Expresse a base e a altura na mesma unidade.
```

Descreva a equação em prosa junto ao bloco, com grandezas, símbolos, unidades,
hipóteses e limites. É essa descrição que a busca indexa. Use termos reais nas
palavras-chave e no glossário. A busca gera um índice local por edição com
títulos, prosa, glossário e legendas. Na central, ela usa as edições vigentes
por padrão. Para pesquisar uma edição histórica, selecione-a no filtro.
Cada resultado leva à seção correspondente. Ao publicar, confira também
consultas sem acento e termos presentes apenas no corpo do capítulo.

## Verificar a publicação

```sh
npm test
npm run typecheck
npm run build
npm run audit:content
```

Abra a rota direta e as âncoras, teste a navegação entre capítulos e edições e
confira os destinos retornados pela busca. Teste teclado, temas claro e escuro,
larguras estreitas e a impressão do capítulo. Veja o relatório em
`out/content-audit/report.md` para corrigir destinos locais, mídias, âncoras
e destinos do índice de busca antes de revisar a contribuição.
