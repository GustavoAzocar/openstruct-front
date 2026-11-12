import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { compileManualMarkdown, indexManualMarkdown } from '../scripts/manual-markdown.ts';
import { manualSystems, publicManualEditions } from '../src/lib/manual-chapters.ts';

test('compiles section anchors, GFM tables and code without inline styles', () => {
  const source = [
    '## Área *retangular*',
    'Veja a [substituição](#substituicao-numerica).',
    '### Substituição numérica',
    '',
    '| Símbolo | Unidade |',
    '| --- | ---: |',
    '| b | m |',
    '',
    '```text',
    '$A = b h$ <exemplo>',
    '```',
    '## Área retangular',
  ].join('\n');

  const chapter = compileManualMarkdown(source);

  assert.deepEqual(chapter.headings, [
    { id: 'area-retangular', title: 'Área retangular', depth: 2 },
    { id: 'substituicao-numerica', title: 'Substituição numérica', depth: 3 },
    { id: 'area-retangular-2', title: 'Área retangular', depth: 2 },
  ]);
  assert.deepEqual(chapter.diagnostics, []);
  assert.match(chapter.html, /<h2 id="area-retangular">Área <em>retangular<\/em><\/h2>/);
  assert.match(chapter.html, /href="#substituicao-numerica"/);
  assert.match(chapter.html, /class="manual-table-scroll" tabindex="0"[^>]*><table>/);
  assert.match(chapter.html, /<th class="manual-align-right">Unidade<\/th>/);
  assert.match(chapter.html, /<code class="language-text">\$A = b h\$ &lt;exemplo&gt;/);
  assert.doesNotMatch(chapter.html, /\sstyle=/);
});

test('generates MathML for inline, aligned and matrix formulas', () => {
  const source = String.raw`A área é $A = b h$.

$$
\begin{aligned}
x &= \frac{1}{2} \\
y &= \sum_{i=1}^{n} i^2
\end{aligned}
$$

$$
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
$$`;

  const chapter = compileManualMarkdown(source);

  assert.deepEqual(chapter.diagnostics, []);
  assert.match(chapter.html, /A área é <span class="katex"><math/);
  assert.match(
    chapter.html,
    /class="manual-math-scroll" tabindex="0"[^>]*><span class="katex"><math/,
  );
  assert.match(chapter.html, /<math[^>]+display="block"/);
  assert.match(chapter.html, /<mfrac>/);
  assert.match(chapter.html, /<mtable/);
  assert.match(chapter.html, /<msup>/);
  assert.doesNotMatch(chapter.html, /\sstyle=|katex-html/);
});

test('escapes raw markup and suppresses unsafe destinations', () => {
  const chapter = compileManualMarkdown(
    [
      '<script>alert(1)</script>',
      '',
      'Um <img src="https://exemplo.test/captura.png" onerror="alert(1)"> literal.',
      '',
      '[JS](jav&#x61;script:alert%281%29)',
      '[Protocolo relativo](//exemplo.test/captura.png)',
      '[Protocolo sem segurança](http://exemplo.test/)',
      '![URI de dados](data:image/png;base64,AAAA)',
      '[Link interno](/docs/armadurastruct)',
      '[Fonte](https://exemplo.test/guia)',
    ].join('\n'),
  );

  assert.equal(chapter.diagnostics.length, 2);
  assert.match(chapter.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(chapter.html, /&lt;img /);
  assert.match(chapter.html, /href="\/docs\/armadurastruct"/);
  assert.match(chapter.html, /href="https:\/\/exemplo.test\/guia"/);
  assert.doesNotMatch(chapter.html, /<script|<img|href="(?:javascript:|\/\/|http:)|src="data:/i);
});

test('reports invalid formulas locally and retains readable chapter text', () => {
  const chapter = compileManualMarkdown(
    String.raw`Antes $\frac{1$ e $\href{https://exemplo.test}{A}$, depois $A=bh$.`,
  );

  assert.equal(chapter.diagnostics.length, 2);
  assert.ok(chapter.diagnostics.every(({ message }) => message.startsWith('Fórmula inválida')));
  assert.match(chapter.html, /manual-math-error">Fórmula inválida\. <code>\\frac\{1<\/code>/);
  assert.match(chapter.html, /depois <span class="katex"><math/);
  assert.doesNotMatch(chapter.html, /<a\s/);
});

test('isolates macros between formulas', () => {
  const chapter = compileManualMarkdown(String.raw`$\gdef\dimensao{b}\dimensao$ e $\dimensao$.`);

  assert.equal(chapter.diagnostics.length, 1);
  assert.match(chapter.html, /<mi>b<\/mi>/);
  assert.match(chapter.html, /e <span class="manual-math-error">/);
});

test('links to a stable display equation without passing its label to KaTeX', () => {
  const chapter = compileManualMarkdown(String.raw`## Formulação geométrica

Veja a [equação da área](#eq-area-do-retangulo).

$$
A = b h \label{eq:area-do-retangulo}
$$

O seno é apresentado como

$$
\sin\label{eq:seno}x
$$`);

  assert.deepEqual(chapter.diagnostics, []);
  assert.match(chapter.html, /href="#eq-area-do-retangulo">equação da área<\/a>/);
  assert.match(
    chapter.html,
    /id="eq-area-do-retangulo"><span class="katex"><math[^>]*display="block"/,
  );
  assert.match(chapter.html, /id="eq-seno">/);
  assert.match(chapter.html, /<mi>sin<\/mi>/);
  assert.doesNotMatch(chapter.html, /\\label\{|\sstyle=/);
});

test('flags malformed, duplicate and inline equation labels without creating duplicate anchors', () => {
  const chapter = compileManualMarkdown(String.raw`## Eq seção

$$ x = 1 \label{eq:repetido} $$

$$ x = 2 \label{eq:repetido} $$

$$ x = 3 \label{eq:secao} $$

$$ x = 4 \label{eq:ruim_<x>} $$

$$ x = 5 \label{eq:um} \label{eq:dois} $$

A expressão $x \label{eq:inline}$ e o texto seguinte continuam disponíveis.`);

  assert.equal(chapter.diagnostics.length, 5);
  assert.match(chapter.diagnostics[0].message, /identificador eq-repetido já está em uso/);
  assert.match(chapter.diagnostics[1].message, /identificador eq-secao já está em uso/);
  assert.match(chapter.diagnostics[2].message, /use um rótulo no formato/);
  assert.match(chapter.diagnostics[3].message, /use um rótulo por equação/);
  assert.match(chapter.diagnostics[4].message, /rótulos só são permitidos em equações em bloco/);
  assert.equal([...chapter.html.matchAll(/id="eq-repetido"/g)].length, 1);
  assert.equal([...chapter.html.matchAll(/id="eq-secao"/g)].length, 1);
  assert.doesNotMatch(chapter.html, /id="eq-(?:inline|ruim|um|dois)|<x>/);
  assert.match(chapter.html, /&lt;x&gt;/);
  assert.match(chapter.html, /texto seguinte continuam disponíveis/);
});

test('uses a standalone image title as an escaped caption and keeps its alt text', () => {
  const chapter = compileManualMarkdown(
    [
      '![Janela de entrada](/assets/tela.png "Entrada &amp; saída &lt;exemplo&gt;")',
      '',
      'Texto com ![ícone](/assets/icone.png "Um título") na mesma linha.',
      '',
      '![Imagem sem legenda](/assets/sem-legenda.png " ")',
      '',
      '![Destino inseguro](javascript:alert%281%29 "Uma legenda")',
    ].join('\n'),
  );

  assert.deepEqual(chapter.diagnostics, []);
  assert.match(
    chapter.html,
    /<figure class="manual-figure">\s*<img src="\/assets\/tela\.png" alt="Janela de entrada">\s*<figcaption>Entrada &amp; saída &lt;exemplo&gt;<\/figcaption>\s*<\/figure>/,
  );
  assert.match(
    chapter.html,
    /<p>Texto com <img[^>]* title="Um título"[^>]*> na mesma linha\.<\/p>/,
  );
  assert.match(chapter.html, /<p><img src="\/assets\/sem-legenda.png"/);
  assert.equal([...chapter.html.matchAll(/<figure /g)].length, 1);
  assert.doesNotMatch(chapter.html, /src="javascript:|<exemplo>/);
});

test('renders only supported blockquote callouts and retains nested content', () => {
  const chapter = compileManualMarkdown(String.raw`> [!NOTE]
> Consulte a **fonte**.
>
> > Uma citação.

> [!TIP]
>
> - Confira as unidades.
> - Registre a saída.

> [!WARNING]
> Observe o limite <u>informado</u>.

> [!UNKNOWN]
> Citação literal.

> \[!NOTE]
> Marcador escapado.`);

  assert.equal(chapter.diagnostics.length, 2);
  assert.match(
    chapter.html,
    /<aside class="manual-callout manual-callout-note">\s*<p class="manual-callout-title">Nota<\/p>\s*<p>Consulte a <strong>fonte<\/strong>\.<\/p>\s*<blockquote>[\s\S]*?<\/blockquote>\s*<\/aside>/,
  );
  assert.match(
    chapter.html,
    /<aside class="manual-callout manual-callout-tip">\s*<p class="manual-callout-title">Dica<\/p>\s*<ul>/,
  );
  assert.match(
    chapter.html,
    /<aside class="manual-callout manual-callout-warning">\s*<p class="manual-callout-title">Atenção<\/p>\s*<p>Observe o limite &lt;u&gt;informado&lt;\/u&gt;\.<\/p>/,
  );
  assert.equal([...chapter.html.matchAll(/<aside /g)].length, 3);
  assert.equal([...chapter.html.matchAll(/<\/aside>/g)].length, 3);
  assert.match(chapter.html, /<blockquote>\s*<p>\[!UNKNOWN\]/);
  assert.match(chapter.html, /<blockquote>\s*<p>\[!NOTE\]\nMarcador escapado/);
});

test('indexes introductory prose and uses the renderer IDs for visible section text', () => {
  const source = String.raw`Apresentação com [a fonte](https://example.test/referencia) e $x_{ignorar}$.

## Área $y_{ignorar}$ de referência

A altura perpendicular aparece no cálculo da área total.

$$
\sum_{i=1}^{n} A_i \label{eq:ignorar}
$$

![Captura com valores de entrada](/assets/ignorar.png "Legenda da interface.")

| Símbolo | Unidade |
| --- | --- |
| $A_i$ | metro quadrado |

> [!NOTE]
> Confira o resultado.

~~~text
fenced-example-ignore
~~~

## Glossário

### Âncora

Identificador de seção.

### Âncora

Identificador de equação.`;
  const rendered = compileManualMarkdown(source);
  const sections = indexManualMarkdown(source);
  assert.deepEqual(rendered.diagnostics, []);
  assert.deepEqual(
    sections.map(({ id }) => id),
    [null, ...rendered.headings.map(({ id }) => id)],
  );
  assert.deepEqual(sections[0], { id: null, title: '', text: 'Apresentação com a fonte e .' });
  assert.equal(sections[1].title, 'Área de referência');
  assert.match(sections[1].text, /altura perpendicular/);
  assert.match(sections[1].text, /Captura com valores de entrada Legenda da interface/);
  assert.match(sections[1].text, /Símbolo Unidade metro quadrado Confira o resultado/);
  assert.doesNotMatch(sections[1].text, /ignorar|fenced-example-ignore|\[!NOTE\]|<[^>]+>/);
  assert.equal(sections.find(({ id }) => id === 'glossario').title, 'Glossário');
  assert.equal(sections.find(({ id }) => id === 'ancora-2').text, 'Identificador de equação.');
});

test('Vite exposes lazy public edition indexes with links to rendered sections', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, host: '127.0.0.1' },
    appType: 'custom',
  });
  try {
    const { default: searchEditions } = await server.ssrLoadModule('virtual:manual-search');
    const { default: content } = await server.ssrLoadModule('virtual:manual-content');
    assert.deepEqual(
      Object.keys(searchEditions),
      manualSystems.flatMap((system) =>
        publicManualEditions(system).map((edition) => `${system.id}/${edition.id}`),
      ),
    );
    assert.ok(Object.values(searchEditions).every((load) => typeof load === 'function'));

    const editorial = await searchEditions['recursos-editoriais/edicao-1']();
    const glossary = editorial.find(({ href }) => href.endsWith('/modelo-editorial#ancora'));
    assert.equal(glossary.sectionTitle, 'Âncora');
    assert.equal(glossary.appVersion, null);
    assert.equal(glossary.chapterStatus, 'sample');
    assert.equal(glossary.historical, false);

    const consolo = await searchEditions['consolostruct/edicao-1']();
    assert.ok(
      consolo.every(
        ({ systemId, appVersion }) => systemId === 'consolostruct' && appVersion === '0.7.1',
      ),
    );
    const chapter = await content['modelo-editorial.md']();
    assert.ok(chapter.headings.some(({ id }) => glossary.href.endsWith('#' + id)));
    assert.equal('sections' in chapter, false);
  } finally {
    await server.close();
  }
});
