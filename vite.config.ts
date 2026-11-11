import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compileManualMarkdown } from './scripts/manual-markdown.ts';
import {
  manualSystems,
  publicManualChapters,
  publicManualEditions,
  validateManualSystems,
} from './src/lib/manual-chapters.ts';

const manualContentId = 'virtual:manual-content';
const resolvedManualContentId = `\0${manualContentId}`;

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'manual-markdown',
      configResolved() {
        validateManualSystems(manualSystems);
      },
      resolveId(id) {
        if (id === manualContentId) return resolvedManualContentId;
      },
      async load(id) {
        if (id === resolvedManualContentId) {
          const entries = manualSystems.flatMap((system) =>
            publicManualEditions(system).flatMap((edition) =>
              publicManualChapters(edition).map(({ source }) => {
                const modulePath = JSON.stringify(`/src/content/manuals/${source}?manual`);
                return `${JSON.stringify(source)}: () => import(${modulePath}).then((module) => module.default)`;
              }),
            ),
          );
          return `export default {${entries.join(',')}};`;
        }
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
