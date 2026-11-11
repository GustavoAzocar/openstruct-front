import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  highlightManualText,
  MANUAL_SEARCH_QUERY_LIMIT,
  MANUAL_SEARCH_RESULT_LIMIT,
  searchManualSections,
} from '../src/lib/manual-search.ts';

function section(overrides = {}) {
  return {
    systemId: 'geosptstruct',
    systemName: 'GeoSPT',
    editionId: 'edicao-1',
    editionTitle: 'Edição 1',
    appVersion: '2.0.7',
    historical: false,
    chapterTitle: 'Apresentação',
    chapterStatus: 'sample',
    href: '/docs/geosptstruct/edicao-1/apresentacao#primeiros-passos',
    sectionTitle: 'Primeiros passos',
    text: '',
    keywords: [],
    ...overrides,
  };
}

test('finds all terms across section fields without requiring an exact phrase', () => {
  const relevant = section({
    sectionTitle: 'Compatibilização por cota',
    keywords: ['sondagem'],
    text: 'Confira primeiro a profundidade do nível d’água no cadastro de cada furo.',
  });
  const partial = section({ sectionTitle: 'Compatibilização', text: 'Ajuste a cota.' });
  const results = searchManualSections(
    [partial, relevant],
    '  PROFuNdIdade\n compatibilizacao, SONDAGEM  ',
  );

  assert.deepEqual(results, [{ section: relevant, snippet: relevant.text }]);
  assert.equal(results[0].section.href, relevant.href);
  assert.deepEqual(searchManualSections([relevant], 'profundidade recalque'), []);
  assert.deepEqual(searchManualSections([relevant], ' \n , ! '), []);
  assert.deepEqual(searchManualSections([relevant], ' \t '), []);
});

test('ranks section titles, chapter titles and keywords before body occurrences', () => {
  const body = section({ text: 'A capacidade apresenta estimativas por furo.' });
  const keyword = section({ keywords: ['capacidade'], text: 'Consulte o comparativo.' });
  const chapter = section({ chapterTitle: 'Capacidade das estacas' });
  const title = section({ sectionTitle: 'Capacidade' });

  const results = searchManualSections([body, keyword, chapter, title], 'capacidade');
  assert.deepEqual(
    results.map(({ section }) => section),
    [title, chapter, keyword, body],
  );
});

test('makes a bounded snippet around the matching part of a long section', () => {
  const relevant = section({
    text: `${'Texto de exemplo. '.repeat(20)}\n A substituição dá 0,060 m². ${'Texto depois do resultado. '.repeat(20)}`,
  });
  const [{ snippet }] = searchManualSections([relevant], 'de substituicao');
  assert.match(snippet, /^… .+A substituição dá 0,060 m²\..+ …$/);
  assert.ok(snippet.length <= 184);
  assert.doesNotMatch(snippet, /\n/);

  const keywordOnly = section({
    keywords: ['termo'],
    text: `  Início do capítulo. ${'Palavra '.repeat(30)}`,
  });
  assert.match(
    searchManualSections([keywordOnly], 'termo')[0].snippet,
    /^Início do capítulo\..+ …$/,
  );
});

test('clips snippets at Unicode code point boundaries', () => {
  const emojis = '🙂'.repeat(120);
  const relevant = section({ text: `${emojis}alvo${emojis}` });
  const [{ snippet }] = searchManualSections([relevant], 'alvo');
  assert.match(snippet, /alvo/);
  assert.doesNotMatch(snippet, /\p{Cs}/u);
});

test('highlights the original accents and preserves markup-like text as plain text', () => {
  const text = '<script>ÁREA</script> e raciocínio de sondação.';
  const highlighted = highlightManualText(text, 'AREA sondacao');
  assert.deepEqual(highlighted, [
    { text: '<script>', match: false },
    { text: 'ÁREA', match: true },
    { text: '</script> e raciocínio de ', match: false },
    { text: 'sondação', match: true },
    { text: '.', match: false },
  ]);
  assert.equal(highlighted.map((segment) => segment.text).join(''), text);
  assert.deepEqual(highlightManualText('Retângulo', 'ret retangulo angulo'), [
    { text: 'Retângulo', match: true },
  ]);
  assert.deepEqual(highlightManualText('Água', '---'), [{ text: 'Água', match: false }]);
});

test('caps the query and keeps only the first bounded page of equally ranked results', () => {
  const longTerm = 'a'.repeat(MANUAL_SEARCH_QUERY_LIMIT);
  const sections = Array.from({ length: MANUAL_SEARCH_RESULT_LIMIT + 5 }, (_, index) =>
    section({ sectionTitle: longTerm, href: `/docs/section-${index}` }),
  );

  const results = searchManualSections(sections, `${longTerm} nonmatching`);
  assert.equal(results.length, MANUAL_SEARCH_RESULT_LIMIT);
  assert.deepEqual(
    results.map(({ section }) => section),
    sections.slice(0, MANUAL_SEARCH_RESULT_LIMIT),
  );
});
