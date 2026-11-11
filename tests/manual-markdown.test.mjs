import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compileManualMarkdown } from '../scripts/manual-markdown.ts';

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
