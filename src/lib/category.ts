/** 日本語カテゴリ名 → 英語スラッグ マッピング */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'オーディオ': 'audio',
  'スマホアクセサリー': 'smartphone-accessories',
  'カー用品': 'car-accessories',
  'スマートホーム': 'smart-home',
  '家電': 'appliances',
  'PCアクセサリー': 'pc-accessories',
  '花粉症・アレルギー対策': 'allergy',
  '新生活・引越し準備': 'new-life',
  'UV・日焼け対策': 'uv-care',
  'モバイルバッテリー・外出ガジェット': 'mobile-gadgets',
  'デスク環境・生産性': 'desk-productivity',
  '節電ガジェット': 'energy-saving',
};

/** 英語スラッグ → 日本語カテゴリ名 逆引き */
export const SLUG_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([k, v]) => [v, k])
);

export function toCategorySlug(name: string): string {
  return CATEGORY_SLUG_MAP[name] ?? name.toLowerCase().replace(/\s+/g, '-');
}

export function fromCategorySlug(slug: string): string {
  return SLUG_CATEGORY_MAP[slug] ?? slug;
}
