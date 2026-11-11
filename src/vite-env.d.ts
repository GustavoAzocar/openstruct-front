/// <reference types="vite/client" />

declare module 'virtual:manual-content' {
  type CompiledManual = import('../scripts/manual-markdown.ts').CompiledManual;
  const chapters: Record<string, () => Promise<CompiledManual>>;
  export default chapters;
}

declare module 'virtual:manual-search' {
  type ManualSearchSection = import('./lib/manual-search.ts').ManualSearchSection;
  const editions: Record<string, () => Promise<ManualSearchSection[]>>;
  export default editions;
}
