export interface Bookmark {
  url: string;
  slug: string;
}

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const normalized = url.href;
    if (url.pathname === '/' && !url.search && !url.hash) {
      return normalized.replace(/\/$/, '');
    }
    return normalized;
  } catch {
    return null;
  }
}

export function loadBookmarks(raw: string | null): Bookmark[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return [];

      const bookmark = entry as Partial<Bookmark>;
      if (typeof bookmark.url !== 'string' || typeof bookmark.slug !== 'string') {
        return [];
      }
      if (!/^mona-[a-z\d]+$/i.test(bookmark.slug)) return [];

      const url = normalizeUrl(bookmark.url);
      return url ? [{ url, slug: bookmark.slug }] : [];
    });
  } catch {
    return [];
  }
}

export function encodeBase62(value: number): string {
  if (!Number.isSafeInteger(value) || value <= 0) return '0';

  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let remaining = value;
  let encoded = '';

  while (remaining > 0) {
    encoded = alphabet[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  }

  return encoded;
}

export function nextSlug(counter: number): string {
  const safeCounter = Number.isSafeInteger(counter) && counter > 0
    ? counter
    : 1;
  return `mona-${encodeBase62(safeCounter)}`;
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
