type SectionClick = Pick<
  MouseEvent,
  'defaultPrevented' | 'button' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'preventDefault'
>;

/** Repeated clicks on the current section must scroll even when the URL does not change. */
export function refocusManualSection(
  event: SectionClick,
  currentHash: string,
  section: HTMLElement | null,
  content: HTMLElement | null,
): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !section ||
    currentHash !== `#${section.id}` ||
    !content?.contains(section)
  )
    return false;

  event.preventDefault();
  if (!section.hasAttribute('tabindex')) section.tabIndex = -1;
  section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: 'instant' });
  return true;
}
