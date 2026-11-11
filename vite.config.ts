import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compileManualMarkdown } from './scripts/manual-markdown.ts';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'manual-markdown',
      async load(id) {
        if (!id.endsWith('.md?manual')) return;
        const path = id.slice(0, -'?manual'.length);
        this.addWatchFile(path);
        const chapter = compileManualMarkdown(await readFile(path, 'utf8'));

        if (chapter.diagnostics.length) {
          const messages = chapter.diagnostics.map(({ message }) => message).join('\n');
          if (command === 'build') this.error({ id: path, message: messages });
          else this.warn({ id: path, message: messages });
        }

        return `export default ${JSON.stringify(chapter)};`;
      },
    },
  ],
  server: { allowedHosts: ['terminal.local'] },
}));
