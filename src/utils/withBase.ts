/**
 * Astroのベース設定を考慮してパスを生成する
 * 外部リンクはそのまま返し、内部リンクのみベースパスを適用
 */
export function withBase(path: string): string {
  // 外部URLの場合はそのまま返す
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }
  
  // 既にベースパスが含まれている場合はそのまま返す
  if (path.startsWith('/portfolio')) {
    return path;
  }
  
  // プロダクション環境では/portfolioを前に追加
  const base = '/portfolio';
  return path === '/' ? base : `${base}${path}`;
}