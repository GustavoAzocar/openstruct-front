import { tex } from '@mdit/plugin-tex';
import katex from 'katex';
import MarkdownIt from 'markdown-it';
import type { Env, Token } from 'markdown-it';

type ManualHeading = { id: string; title: string; depth: number };
type ManualDiagnostic = { message: string };

export type CompiledManual = {
  html: string;
  headings: ManualHeading[];
  diagnostics: ManualDiagnostic[];
};

type ManualEnvironment = Env & { diagnostics: ManualDiagnostic[] };

const MAX_FORMULA_LENGTH = 4_000;
const markdown = MarkdownIt({ html: true, linkify: true });
const escapeHtml = markdown.utils.escapeHtml;

markdown.validateLink = (target) => {
  if (!target || /[\\\s\u0000-\u001f\u007f]/u.test(target) || target.startsWith('//')) return false;
  if (!/^[a-z][a-z\d+.-]*:/i.test(target)) return true;
  if (!/^https:\/\//i.test(target)) return false;
  const url = URL.parse(target);
  return url !== null && !url.username && !url.password;
};

// Recognize raw HTML so it can be flagged and escaped in the preview.
markdown.renderer.rules.html_inline = (tokens, index, _options, env) => {
  (env as ManualEnvironment).diagnostics.push({ message: 'Use Markdown em vez de HTML bruto.' });
  return escapeHtml(tokens[index].content);
};
markdown.renderer.rules.html_block = (tokens, index, _options, env) => {
  (env as ManualEnvironment).diagnostics.push({ message: 'Use Markdown em vez de HTML bruto.' });
  return `<pre><code>${escapeHtml(tokens[index].content)}</code></pre>\n`;
};

markdown.renderer.rules.table_open = () =>
  '<div class="manual-table-scroll" tabindex="0" role="group" aria-label="Tabela"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';

markdown.use(tex, {
  render(source, displayMode, env) {
    const formula = source.trim();
    let markup: string;
    try {
      if (!formula) throw new Error('a expressão está vazia');
      if (formula.length > MAX_FORMULA_LENGTH)
        throw new Error('a expressão excede o tamanho máximo');

      let restrictedCommand: string | undefined;
      markup = katex.renderToString(formula, {
        displayMode,
        output: 'mathml',
        strict: 'error',
        throwOnError: true,
        trust: ({ command }) => {
          restrictedCommand = command;
          return false;
        },
        maxExpand: 250,
        maxSize: 20,
      });
      if (restrictedCommand) throw new Error(`o comando ${restrictedCommand} não é permitido`);
      if (/<[^>]+\sstyle\s*=/i.test(markup)) throw new Error('a expressão exige estilos inline');
    } catch (error) {
      const excerpt = formula.replace(/\s+/g, ' ').slice(0, 80);
      const reason =
        error instanceof katex.ParseError ? error.rawMessage : (error as Error).message;
      (env as ManualEnvironment).diagnostics.push({
        message: `Fórmula inválida ${JSON.stringify(excerpt)} (${reason}).`,
      });
      markup = `<span class="manual-math-error">Fórmula inválida. <code>${escapeHtml(formula)}</code></span>`;
    }

    return displayMode
      ? `<div class="manual-math-scroll" tabindex="0" role="group" aria-label="Equação">${markup}</div>\n`
      : markup;
  },
});

function headingText(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'softbreak' || token.type === 'hardbreak') return ' ';
      if (token.children) return headingText(token.children);
      return token.content;
    })
    .join('')
    .trim();
}

export function compileManualMarkdown(source: string): CompiledManual {
  const env: ManualEnvironment = { diagnostics: [] };
  const tokens = markdown.parse(source, env);
  const headings: ManualHeading[] = [];
  const ids = new Set<string>();

  for (const [index, token] of tokens.entries()) {
    if (token.type === 'heading_open') {
      const title = headingText(tokens[index + 1].children ?? []);
      const slug =
        title
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'secao';
      let id = slug;
      for (let suffix = 2; ids.has(id); suffix++) id = `${slug}-${suffix}`;
      ids.add(id);
      token.attrSet('id', id);
      headings.push({ id, title, depth: Number(token.tag.slice(1)) });
    }

    if (token.type === 'th_open' || token.type === 'td_open') {
      // Markdown-it emits alignment as an inline style by default.
      const style = token.attrGet('style');
      const alignment = /^text-align:(left|center|right)$/.exec(String(style))?.[1];
      if (alignment) token.attrSet('class', `manual-align-${alignment}`);
      if (token.attrs) token.attrs = token.attrs.filter(([name]) => name !== 'style');
    }
  }

  return {
    html: markdown.renderer.render(tokens, markdown.options, env),
    headings,
    diagnostics: env.diagnostics,
  };
}
