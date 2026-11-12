import assert from 'node:assert/strict';
import { test } from 'node:test';
import { refocusManualSection } from '../src/lib/manual-navigation.ts';

function fixture(patch = {}, withTabIndex = false) {
  const calls = [];
  const event = {
    defaultPrevented: false,
    button: 0,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: () => calls.push('prevent'),
    ...patch,
  };
  const section = {
    id: 'formulas-e-referencias-cruzadas',
    tabIndex: withTabIndex ? 0 : undefined,
    hasAttribute: () => withTabIndex,
    focus: (options) => calls.push(['focus', options]),
    scrollIntoView: (options) => calls.push(['scroll', options]),
  };
  const content = { contains: (target) => target === section };
  return { event, section, content, calls };
}

test('clicking the active table-of-contents anchor again restores focus and scroll without navigation', () => {
  const { event, section, content, calls } = fixture();
  for (let repeat = 0; repeat < 2; repeat++) {
    assert.equal(refocusManualSection(event, `#${section.id}`, section, content), true);
  }
  assert.equal(section.tabIndex, -1);
  assert.deepEqual(calls, [
    'prevent',
    ['focus', { preventScroll: true }],
    ['scroll', { behavior: 'instant' }],
    'prevent',
    ['focus', { preventScroll: true }],
    ['scroll', { behavior: 'instant' }],
  ]);
});

test('a different section keeps normal router navigation and an existing tabindex is preserved', () => {
  const { event, section, content, calls } = fixture({}, true);
  assert.equal(refocusManualSection(event, '#outro', section, content), false);
  assert.deepEqual(calls, []);
  assert.equal(refocusManualSection(event, `#${section.id}`, section, content), true);
  assert.equal(section.tabIndex, 0);
});

test('modified, non-primary and already-handled clicks retain browser behavior', () => {
  for (const patch of [
    { defaultPrevented: true },
    { button: 1 },
    { altKey: true },
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
  ]) {
    const { event, section, content, calls } = fixture(patch);
    assert.equal(refocusManualSection(event, `#${section.id}`, section, content), false);
    assert.deepEqual(calls, []);
  }
});

test('missing sections and anchors outside the chapter are not intercepted', () => {
  const { event, section, content, calls } = fixture();
  assert.equal(refocusManualSection(event, '#missing', null, content), false);
  assert.equal(refocusManualSection(event, `#${section.id}`, section, null), false);
  assert.equal(
    refocusManualSection(event, `#${section.id}`, section, { contains: () => false }),
    false,
  );
  assert.deepEqual(calls, []);
});
