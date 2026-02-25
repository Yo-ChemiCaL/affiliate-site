/**
 * デスクセットアップ特化カテゴリ マッピング（Phase2）
 *
 * 分類軸: デスク環境構築シーン
 *   desk-monitor  : モニター・ディスプレイ
 *   desk-input    : キーボード・マウス
 *   desk-lighting : ライト・照明
 *   desk-cable    : ケーブル・充電
 *   desk-audio    : オーディオ・集中
 *   desk-hub      : ハブ・拡張
 *   desk-stand    : スタンド・周辺機器
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'モニター・ディスプレイ': 'desk-monitor',
  'キーボード・マウス':     'desk-input',
  'ライト・照明':           'desk-lighting',
  'ケーブル・充電':         'desk-cable',
  'オーディオ・集中':       'desk-audio',
  'ハブ・拡張':             'desk-hub',
  'スタンド・周辺機器':     'desk-stand',
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
