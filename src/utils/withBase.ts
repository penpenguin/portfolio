/**
 * Astroのベース設定を考慮してパスを生成する
 */
export function withBase(path: string): string {
  // 既に外部URLまたはベースパスが含まれている場合はそのまま返す
  if (path.startsWith('http') || path.startsWith('/portfolio')) {
    return path;
  }
  
  // 開発環境ではベースパスを追加しない
  if (import.meta.env.DEV) {
    return path;
  }
  
  // プロダクション環境では/portfolioを前に追加
  const base = '/portfolio';
  return path === '/' ? base : `${base}${path}`;
}