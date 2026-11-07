import { createElement } from 'react';

/** Remote text is always a React text node, including Markdown, HTML and attachment syntax. */
export function PublicDiscussionText({ text }: { text: string }) {
  return createElement('p', { className: 'discussion-text' }, text);
}
