/**
 * GitHub Pages のサブパス（/affiliate-site/）に対応したURLヘルパー
 * BASE_URL は astro.config.mjs の base 設定から自動注入される
 */

const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // 末尾スラッシュ除去

/**
 * 内部リンクをベースパス付きで返す
 * @example url('/products/foo/') → '/affiliate-site/products/foo/'
 */
export function url(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}
