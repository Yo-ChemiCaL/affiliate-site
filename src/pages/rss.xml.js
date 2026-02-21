import rss from '@astrojs/rss';
import productsData from '../data/products.json';

export async function GET(context) {
  const products = productsData;

  return rss({
    title: 'おすすめ商品レビュー',
    description: 'Amazon・A8.netアフィリエイトおすすめ商品を厳選紹介',
    site: context.site,
    items: products.map((product) => ({
      title: `${product.title}レビュー`,
      pubDate: new Date(product.publishedAt),
      description: product.description,
      link: `/products/${product.slug}/`,
      categories: [product.category, ...product.tags],
    })),
    customData: '<language>ja</language>',
  });
}
