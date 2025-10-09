const schemeRegex = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

/**
 * Astroのベース設定を考慮してパスを生成する。
 * 外部リンクやアンカーなどは書き換えず、内部リンクのみベースパスを適用する。
 */
export function withBase(path: string): string {
  if (!path) {
    return path;
  }

  if (schemeRegex.test(path) || path.startsWith('//') || path.startsWith('#')) {
    return path;
  }

  const astroGlobal = globalThis as { Astro?: { site?: URL } };
  const rawBase =
    astroGlobal.Astro?.site?.pathname ?? import.meta.env.BASE_URL ?? '/';
  const base = normalizeBase(rawBase);

  if (
    base !== '/' &&
    (path === base || path === base.slice(0, -1) || path.startsWith(base))
  ) {
    return path;
  }

  if (base === '/') {
    if (path === '/' || path === '') {
      return '/';
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  if (path === '/' || path === '') {
    return base;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalizedPath}`;
}

function normalizeBase(input?: string): string {
  if (!input || input === '/') {
    return '/';
  }

  let value = input;

  if (!value.startsWith('/')) {
    try {
      value = new URL(value, 'http://localhost').pathname || '/';
    } catch {
      value = `/${value}`;
    }
  }

  value = value.replace(/\/+$/, '');

  if (!value.startsWith('/')) {
    value = `/${value}`;
  }

  return value === '/' ? '/' : `${value}/`;
}
