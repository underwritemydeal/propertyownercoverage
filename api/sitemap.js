export default async function handler(req, res) {
  const SITE = 'https://www.propertyownercoverage.com';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0', lastmod: today },
    { loc: '/articles.html', changefreq: 'daily', priority: '0.9', lastmod: today },
    { loc: '/tools.html', changefreq: 'weekly', priority: '0.8', lastmod: '2025-03-01' },
    { loc: '/coverage-types.html', changefreq: 'weekly', priority: '0.8', lastmod: '2025-03-01' },
    { loc: '/about.html', changefreq: 'monthly', priority: '0.6', lastmod: '2025-02-01' },
    { loc: '/author.html', changefreq: 'monthly', priority: '0.6', lastmod: '2025-03-15' },
    { loc: '/contact.html', changefreq: 'monthly', priority: '0.5', lastmod: '2025-02-01' },
    { loc: '/disclaimer.html', changefreq: 'monthly', priority: '0.4', lastmod: '2025-02-01' },
    { loc: '/privacy.html', changefreq: 'monthly', priority: '0.4', lastmod: '2025-02-01' },
  ];

  let articleUrls = [];
  try {
    // Fetch article metadata for lastmod dates
    const metadataResponse = await fetch(
      'https://api.github.com/repos/underwritemydeal/propertyownercoverage/contents/articles-metadata.json',
      { headers: { 'User-Agent': 'PropertyOwnerCoverage-Sitemap' } }
    );

    let metadata = {};
    if (metadataResponse.ok) {
      const metadataFile = await metadataResponse.json();
      const content = Buffer.from(metadataFile.content, 'base64').toString('utf-8');
      metadata = JSON.parse(content);
    }

    // Fetch article list
    const response = await fetch(
      'https://api.github.com/repos/underwritemydeal/propertyownercoverage/contents/articles',
      { headers: { 'User-Agent': 'PropertyOwnerCoverage-Sitemap' } }
    );

    if (response.ok) {
      const files = await response.json();
      articleUrls = files
        .filter(f => f.name.endsWith('.html') && !f.name.includes(' ') && f.name !== '.html' && f.name.replace('.html', '').trim() !== '')
        .map(f => {
          const slug = f.name.replace('.html', '');
          const articleMeta = metadata[slug];
          const lastmod = articleMeta?.publishDate
            ? articleMeta.publishDate.split('T')[0]
            : today;
          return {
            loc: `/articles/${f.name}`,
            changefreq: 'weekly',
            priority: '0.7',
            lastmod,
          };
        });
    }
  } catch (e) {
    // If GitHub API fails, sitemap still works with static pages
    console.error('[sitemap] Error fetching articles:', e.message);
  }

  const allUrls = [...staticPages, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(xml);
}
