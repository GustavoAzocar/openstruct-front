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

type ManualEnvironment = Env & { diagnostics: ManualDiagnostic[]; anchorIds: Set<string> };

const MAX_FORMULA_LENGTH = 4_000;
const callouts = {
  NOTE: { variant: 'note', title: 'Nota' },
  TIP: { variant: 'tip', title: 'Dica' },
  WARNING: { variant: 'warning', title: 'Atenção' },
} as const;
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

markdown.renderer.rules.manual_figure_content = (tokens, index, options, env, renderer) => {
  const { children, content } = tokens[index];
  const image = renderer.renderInline(children ?? [], options, env);
  return `${image}\n<figcaption>${escapeHtml(content)}</figcaption>\n`;
};

markdown.renderer.rules.manual_callout_open = (tokens, index, options, _env, renderer) =>
  `${renderer.renderToken(tokens, index, options)}<p class="manual-callout-title">${escapeHtml(tokens[index].content)}</p>\n`;

markdown.use(tex, {
  render(source, displayMode, context) {
    const env = context as ManualEnvironment;
    let formula = source.trim();
    let id: string | undefined;
    let markup: string;
    try {
      if (formula.length > MAX_FORMULA_LENGTH)
        throw new Error('a expressão excede o tamanho máximo');

      // Só a barra de um comando real inicia um rótulo. Preserve pares de barras.
      const labels = [...formula.matchAll(/(?<!\\)((?:\\\\)*)\\label(?![a-zA-Z])/g)];
      if (labels.length) {
        if (!displayMode) throw new Error('rótulos só são permitidos em equações em bloco');
        if (labels.length > 1) throw new Error('use um rótulo por equação');
        const [label] = labels;
        const commandEnd = label.index + label[0].length;
        const argument = /^\{eq:([a-z0-9]+(?:-[a-z0-9]+)*)\}/.exec(formula.slice(commandEnd));
        if (!argument) throw new Error('use um rótulo no formato \\label{eq:identificador}');

        const anchor = `eq-${argument[1]}`;
        if (env.anchorIds.has(anchor)) throw new Error(`o identificador ${anchor} já está em uso`);
        env.anchorIds.add(anchor);
        id = anchor;
        formula = (
          formula.slice(0, label.index + label[1].length) +
          ' ' +
          formula.slice(commandEnd + argument[0].length)
        ).trim();
      }
      if (!formula) throw new Error('a expressão está vazia');

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
      env.diagnostics.push({
        message: `Fórmula inválida ${JSON.stringify(excerpt)} (${reason}).`,
      });
      markup = `<span class="manual-math-error">Fórmula inválida. <code>${escapeHtml(formula)}</code></span>`;
    }

    return displayMode
      ? `<div class="manual-math-scroll" tabindex="0" role="group" aria-label="Equação"${id ? ` id="${id}"` : ''}>${markup}</div>\n`
      : markup;
  },
});

function promoteFigure(tokens: Token[], index: number): void {
  const [open, inline, close] = tokens.slice(index, index + 3);
  const [image] = inline.children ?? [];
  if (inline.children?.length !== 1 || image.type !== 'image') return;
  const title = image.attrGet('title');
  if (typeof title !== 'string' || !title.trim()) return;

  open.type = 'figure_open';
  open.tag = 'figure';
  open.hidden = false;
  open.attrSet('class', 'manual-figure');
  inline.type = 'manual_figure_content';
  inline.content = title.trim();
  image.attrs = image.attrs?.filter(([name]) => name !== 'title') ?? null;
  close.type = 'figure_close';
  close.tag = 'figure';
  close.hidden = false;
}

function promoteCallout(tokens: Token[], index: number): boolean {
  const [open, paragraph, inline, paragraphClose, next] = tokens.slice(index, index + 5);
  if (paragraph?.type !== 'paragraph_open' || inline?.type !== 'inline') return false;
  const marker = /^\[!(NOTE|TIP|WARNING)\][ \t]*(?:\n|$)/.exec(inline.content);
  const [text, newline] = inline.children ?? [];
  if (!marker || text?.type !== 'text' || text.content.trim() !== `[!${marker[1]}]`) return false;
  if (newline && newline.type !== 'softbreak' && newline.type !== 'hardbreak') return false;
  if (!newline && next?.type === 'blockquote_close') return false;

  const { variant, title } = callouts[marker[1] as keyof typeof callouts];
  open.type = 'manual_callout_open';
  open.tag = 'aside';
  open.content = title;
  open.attrSet('class', `manual-callout manual-callout-${variant}`);

  if (newline) {
    inline.children = inline.children!.slice(2);
  } else {
    paragraph.hidden = true;
    inline.children = [];
    paragraphClose.hidden = true;
  }
  return true;
}

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
  const ids = new Set<string>();
  const env: ManualEnvironment = { diagnostics: [], anchorIds: ids };
  const tokens = markdown.parse(source, env);
  const headings: ManualHeading[] = [];
  const openCallouts = new Set<number>();

  for (const [index, token] of tokens.entries()) {
    if (token.type === 'paragraph_open') promoteFigure(tokens, index);
    if (token.type === 'blockquote_open' && promoteCallout(tokens, index)) {
      openCallouts.add(token.level);
    }
    if (token.type === 'blockquote_close' && openCallouts.delete(token.level)) {
      token.type = 'aside_close';
      token.tag = 'aside';
    }

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
