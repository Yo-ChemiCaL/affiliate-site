/**
 * 内部リンクをベースパス付きで返すURLヘルパー
 * base設定なし（独自ドメイン）の場合は BASE_URL = '/' のため
 * url('/products/foo/') → '/products/foo/' となる
 */

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}
