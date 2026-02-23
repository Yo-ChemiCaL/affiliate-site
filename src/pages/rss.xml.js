import rss from '@astrojs/rss';
import productsData from '../data/products.json';

const bestModules = import.meta.glob('../data/best/*.json', { eager: true });
const bestArticles = Object.values(bestModules).map((m) => m.default);

export async function GET(context) {
  const productItems = productsData.map((product) => ({
    title: `${product.title}レビュー`,
    pubDate: new Date(product.publishedAt),
    description: product.description,
    link: `/products/${product.slug}/`,
    categories: [product.category, ...product.tags],
  }));

  const bestItems = bestArticles.map((article) => ({
    title: article.title,
    pubDate: new Date(article.publishedAt),
    description: article.description,
    link: `/best/${article.slug}/`,
    categories: [article.category],
  }));

  const allItems = [...productItems, ...bestItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime()
  );

  return rss({
    title: 'mono-lab',
    description: 'Amazon厳選おすすめ商品を用途別に比較・紹介',
    site: context.site,
    items: allItems,
    customData: '<language>ja</language>',
  });
}
