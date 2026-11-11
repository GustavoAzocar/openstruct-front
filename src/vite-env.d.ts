/// <reference types="vite/client" />

declare module 'virtual:manual-content' {
  type CompiledManual = import('../scripts/manual-markdown.ts').CompiledManual;
  const chapters: Record<string, () => Promise<CompiledManual>>;
  export default chapters;
}
