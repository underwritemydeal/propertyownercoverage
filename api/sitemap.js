export default async function handler(req, res) {
  const SITE = 'https://www.propertyownercoverage.com';

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/articles.html', changefreq: 'daily', priority: '0.9' },
    { loc: '/tools.html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/coverage-types.html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/about.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/author.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/disclaimer.html', changefreq: 'monthly', priority: '0.4' },
    { loc: '/privacy.html', changefreq: 'monthly', priority: '0.4' },
  ];

  let articleUrls = [];
  try {
    const response = await fetch(
      'https://api.github.com/repos/underwritemydeal/propertyownercoverage/contents/articles',
      { headers: { 'User-Agent': 'PropertyOwnerCoverage-Sitemap' } }
    );
    if (response.ok) {
      const files = await response.json();
      articleUrls = files
        .filter(f => f.name.endsWith('.html') && !f.name.includes(' ') && f.name !== '.html' && f.name.replace('.html', '').trim() !== '')
        .map(f => ({
          loc: `/articles/${f.name}`,
          changefreq: 'weekly',
          priority: '0.7',
        }));
    }
  } catch (e) {
    // If GitHub API fails, sitemap still works with static pages
  }

  const allUrls = [...staticPages, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(xml);
}
