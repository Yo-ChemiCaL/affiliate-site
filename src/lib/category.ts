/**
 * 購買行動シーン別カテゴリ マッピング（Phase1）
 *
 * 分類軸: 商品種類ではなく「利用シーン（いつ・どこで使うか）」
 *   work-from-home : 在宅ワーク・デスク環境・照明・集中
 *   commute        : 通勤・外出・車内
 *   travel         : 旅行・長距離移動
 *   charging       : 充電・バッテリー補充
 *   consumables    : 低単価の日用消耗品
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'テレワーク・在宅': 'work-from-home',
  '通勤・外出':       'commute',
  '旅行・移動':       'travel',
  '充電・電源':       'charging',
  '日用消耗品':       'consumables',
};

/** 英語スラッグ → 日本語カテゴリ名 逆引き */
export const SLUG_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([k, v]) => [v, k])
);

export function toCategorySlug(name: string): string {
  return CATEGORY_SLUG_MAP[name] ?? name.toLowerCase().replace(/[\s・]+/g, '-');
}

export function fromCategorySlug(slug: string): string {
  return SLUG_CATEGORY_MAP[slug] ?? slug;
}
