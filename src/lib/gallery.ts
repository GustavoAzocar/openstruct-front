/** Explicit navigation stops at either end; an empty collection has no target. */
export function nextCapture(index: number, step: number, count: number): number {
  return count > 0 ? Math.max(0, Math.min(count - 1, index + step)) : 0;
}
