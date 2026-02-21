#!/usr/bin/env node
/**
 * fetch-products.js
 * 商品データを外部ソースから取得して src/data/products.json を更新するスクリプト
 *
 * 使用方法:
 *   node scripts/fetch-products.js
 *   node scripts/fetch-products.js --dry-run    # 更新せずに取得結果を表示
 *   node scripts/fetch-products.js --merge       # 既存データとマージ（slug重複は上書き）
 *
 * 環境変数:
 *   AMAZON_ACCESS_KEY    - Amazon PA-API アクセスキー
 *   AMAZON_SECRET_KEY    - Amazon PA-API シークレットキー
 *   AMAZON_PARTNER_TAG   - Amazon アソシエイトタグ
 *   A8_AFFILIATE_ID      - A8.net アフィリエイトID
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = resolve(__dirname, '../src/data/products.json');

// コマンドライン引数
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isMerge = args.includes('--merge');

// ============================================================
// Amazon PA-API v5 ヘルパー
// ============================================================
async function fetchAmazonProduct(asin) {
  const {
    AMAZON_ACCESS_KEY,
    AMAZON_SECRET_KEY,
    AMAZON_PARTNER_TAG,
  } = process.env;

  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_PARTNER_TAG) {
    console.warn('[Amazon] 環境変数が未設定のためスキップします');
    return null;
  }

  // PA-API v5 リクエスト構築
  const endpoint = 'webservices.amazon.co.jp';
  const path = '/paapi5/getitems';
  const payload = JSON.stringify({
    ItemIds: [asin],
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price',
      'Images.Primary.Large',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
    ],
    PartnerTag: AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.co.jp',
  });

  // TODO: AWS Signature Version 4 署名実装
  // 本番では paapi5-nodejs-sdk パッケージの使用を推奨:
  // npm install paapi5-nodejs-sdk
  // import ProductAdvertisingAPIv1 from 'paapi5-nodejs-sdk';

  console.log(`[Amazon] ASIN ${asin} の取得をシミュレート (PA-API実装必要)`);
  return null;
}

// ============================================================
// A8.net フィード取得
// ============================================================
async function fetchA8Products(feedUrl) {
  if (!feedUrl) {
    console.warn('[A8] フィードURLが未指定のためスキップします');
    return [];
  }

  try {
    const response = await fetch(feedUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    // A8.net のCSVフィードをパース (実際のフォーマットに合わせて調整)
    const lines = text.split('\n').filter(Boolean);
    const headers = lines[0].split(',');

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj = Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim() ?? '']));

      return {
        // A8フィードの列名はプログラムによって異なるため要調整
        externalId: obj.item_id ?? obj.id ?? '',
        title: obj.item_name ?? obj.name ?? '',
        price: parseInt(obj.price ?? '0', 10) || undefined,
        image: obj.image_url ?? obj.image ?? '',
        affiliateUrl: obj.url ?? '',
      };
    }).filter((p) => p.title);
  } catch (err) {
    console.error(`[A8] フィード取得エラー: ${err.message}`);
    return [];
  }
}

// ============================================================
// 商品スラグ生成
// ============================================================
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

// ============================================================
// メイン処理
// ============================================================
async function main() {
  console.log('=== 商品データ取得スクリプト ===');
  console.log(`モード: ${isDryRun ? 'dry-run' : isMerge ? 'merge' : 'replace'}`);

  // 既存データ読み込み
  let existingProducts = [];
  try {
    existingProducts = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'));
    console.log(`既存商品数: ${existingProducts.length}`);
  } catch {
    console.log('既存データなし。新規作成します。');
  }

  // ============================================================
  // ここにデータソースを追加
  // ============================================================
  const newProducts = [];

  // 例1: 特定ASINのAmazon商品取得
  const targetAsins = [
    // 'B0BSQ5Z3MQ', // Anker Q45
    // 'B09HRBLCMK', // MX Master 3S
  ];

  for (const asin of targetAsins) {
    const product = await fetchAmazonProduct(asin);
    if (product) newProducts.push(product);
  }

  // 例2: A8.net フィード取得
  const a8FeedUrl = process.env.A8_FEED_URL ?? '';
  const a8Products = await fetchA8Products(a8FeedUrl);

  for (const item of a8Products) {
    newProducts.push({
      slug: generateSlug(item.title),
      title: item.title,
      description: '',
      image: item.image,
      category: '未分類',
      tags: [],
      rating: 4.0,
      reviewCount: 0,
      price: item.price,
      amazonUrl: '',
      a8Url: item.affiliateUrl,
      featured: false,
      publishedAt: new Date().toISOString().split('T')[0],
    });
  }

  console.log(`取得した新規商品数: ${newProducts.length}`);

  if (newProducts.length === 0) {
    console.log('新しい商品データがありません。終了します。');
    console.log('\n[ヒント] 環境変数を設定してください:');
    console.log('  AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG');
    console.log('  A8_FEED_URL');
    return;
  }

  // マージ or 置換
  let finalProducts;
  if (isMerge) {
    const existingMap = new Map(existingProducts.map((p) => [p.slug, p]));
    for (const p of newProducts) {
      existingMap.set(p.slug, { ...existingMap.get(p.slug), ...p });
    }
    finalProducts = [...existingMap.values()];
  } else {
    finalProducts = newProducts;
  }

  // ソート (新しい順)
  finalProducts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (isDryRun) {
    console.log('\n--- Dry Run 結果 (保存しません) ---');
    console.log(JSON.stringify(finalProducts, null, 2));
    return;
  }

  writeFileSync(PRODUCTS_PATH, JSON.stringify(finalProducts, null, 2), 'utf-8');
  console.log(`✅ ${PRODUCTS_PATH} を更新しました (${finalProducts.length}件)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
