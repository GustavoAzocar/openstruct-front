/// <reference types="vite/client" />

declare module '*.md?manual' {
  const chapter: import('../scripts/manual-markdown.ts').CompiledManual;
  export default chapter;
}
