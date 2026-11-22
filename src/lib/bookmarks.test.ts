import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatBookmark,
  loadBookmarks,
  normalizeUrl,
  nextSlug,
  encodeBase62,
} from './bookmarks.ts';

test('normalizes URLs with and without https', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('https://example.com'), 'https://example.com');
  assert.equal(normalizeUrl('https://example.com'), normalizeUrl('example.com'));
});

test('rejects invalid and unsupported URLs', () => {
  assert.equal(normalizeUrl(''), null);
  assert.equal(normalizeUrl('not a url'), null);
  assert.equal(normalizeUrl('javascript:alert(1)'), null);
});

test('loads an empty or corrupted storage value as an empty list', () => {
  for (const raw of [null, '', 'not json', '{}', '["legacy"]', 'null']) {
    assert.deepEqual(loadBookmarks(raw), []);
  }
});

test('drops malformed bookmark entries and keeps valid entries', () => {
  const raw = JSON.stringify([
    { url: 'example.com', slug: 'mona-1' },
    { url: 'ftp://example.com', slug: 'mona-2' },
    { url: 'https://example.com', slug: 42 },
    null,
  ]);

  assert.deepEqual(loadBookmarks(raw), [
    { url: 'https://example.com', slug: 'mona-1' },
  ]);
});

test('generates base62 mona slugs', () => {
  assert.equal(encodeBase62(62), '10');
  assert.equal(nextSlug(1), 'mona-1');
  assert.equal(nextSlug(62), 'mona-10');
});

test('formats the exact bookmark separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
