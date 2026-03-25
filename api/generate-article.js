export const config = {
  maxDuration: 120,
};

const REPO = 'underwritemydeal/propertyownercoverage';
const SITE_URL = 'https://www.propertyownercoverage.com';

function keywordToSlug(keyword) {
  return keyword
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')
    .replace(/[^A-Za-z0-9\-]/g, '');
}

function slugToTitle(slug) {
  return slug.split('-').join(' ');
}

function guessCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('habitab') || t.includes('loss of rent') || t.includes('uninhabit')) return 'Habitability';
  if (t.includes('wrongful eviction') || t.includes('liability') || t.includes('assault') || t.includes('battery') || t.includes('lawsuit')) return 'Liability';
  if (t.includes('rate') || t.includes('premium') || t.includes('cost') || t.includes('increas') || t.includes('expensive')) return 'Rate Increases';
  if (t.includes('ordinance') || t.includes('building code') || t.includes('law coverage')) return 'Building Ordinance';
  if (t.includes('california') || t.includes('fair plan') || t.includes('wildfire')) return 'California';
  if (t.includes('earthquake')) return 'Earthquake';
  if (t.includes('flood')) return 'Flood';
  return 'Coverage Guide';
}

function generateMetaDescription(content, maxLength = 160) {
  // Extract first paragraph text, strip HTML tags
  const firstParagraph = content.match(/<p>(.*?)<\/p>/s);
  if (firstParagraph) {
    let text = firstParagraph[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > maxLength) {
      text = text.substring(0, maxLength - 3).replace(/\s+\S*$/, '') + '...';
    }
    return text;
  }
  return 'Expert insurance guide for property owners and landlords. Plain-English coverage advice from a 20-year commercial insurance specialist.';
}

function generateFullArticlePage(slug, title, category, content, publishDate, relatedArticles) {
  const metaDescription = generateMetaDescription(content);
  const canonicalUrl = `${SITE_URL}/articles/${slug}.html`;
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Generate Related Articles HTML
  let relatedHtml = '';
  if (relatedArticles && relatedArticles.length > 0) {
    const relatedLinks = relatedArticles.slice(0, 3).map(article => {
      const articleTitle = slugToTitle(article.slug);
      const articleCategory = guessCategory(articleTitle);
      return `
      <a href="/articles/${article.slug}.html" class="related-card">
        <span class="related-cat">${articleCategory}</span>
        <h3>${articleTitle}</h3>
      </a>`;
    }).join('');

    relatedHtml = `
  <div class="related-section">
    <div class="related-label">Related Articles</div>
    <div class="related-grid">${relatedLinks}
    </div>
  </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="google-site-verification" content="AubdGnziVGAxauod6W0wxXlR3ROMWULFvBk6vUITM6k" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Property Owner Coverage</title>
<meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}">
<link rel="canonical" href="${canonicalUrl}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#141414; --bg-mid:#1e1518; --wine:#8b1a2a; --wine-bright:#b02438;
    --wine-light:#c44455; --wine-dim:rgba(139,26,42,0.18);
    --cream:#f0ebe3; --cream-dim:rgba(240,235,227,0.55);
    --border:rgba(139,26,42,0.3); --border-sub:rgba(240,235,227,0.08);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--cream); }

  nav { position:sticky; top:0; z-index:100; background:rgba(20,20,20,0.97); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); padding:0 40px; height:64px; display:flex; align-items:center; justify-content:space-between; }
  .logo { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:600; color:var(--cream); text-decoration:none; display:flex; align-items:center; gap:10px; }
  .logo-mark { width:30px; height:30px; background:var(--wine); border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .logo-mark svg { width:16px; height:16px; }
  .logo span { color:var(--wine-light); }
  .nav-links { display:flex; align-items:center; gap:28px; list-style:none; }
  .nav-links a { color:var(--cream-dim); text-decoration:none; font-size:12px; font-weight:500; letter-spacing:0.6px; text-transform:uppercase; transition:color 0.2s; }
  .nav-links a:hover { color:var(--cream); }
  .nav-cta { background:var(--wine) !important; color:var(--cream) !important; padding:7px 16px; font-weight:600 !important; text-transform:none !important; font-size:13px !important; }

  .breadcrumb { padding:20px 40px 0; font-size:12px; color:var(--cream-dim); }
  .breadcrumb a { color:var(--wine-light); text-decoration:none; }
  .breadcrumb a:hover { color:var(--cream); }

  .article-container { max-width:800px; margin:0 auto; padding:40px 40px 60px; }

  .article-header { margin-bottom:40px; padding-bottom:32px; border-bottom:1px solid var(--border-sub); }
  .article-cat { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--wine-light); margin-bottom:14px; }
  .article-title { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,4.5vw,48px); font-weight:700; line-height:1.12; color:var(--cream); margin-bottom:20px; }
  .article-meta { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--cream-dim); flex-wrap:wrap; }
  .article-meta a { color:var(--wine-light); text-decoration:none; font-weight:500; }
  .article-meta a:hover { color:var(--cream); }
  .meta-sep { color:var(--border); }

  .article-body h2 { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:700; color:var(--cream); margin:40px 0 16px; line-height:1.2; }
  .article-body h3 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; color:var(--wine-light); margin:32px 0 12px; line-height:1.3; }
  .article-body p { font-size:16px; color:var(--cream-dim); line-height:1.85; margin-bottom:20px; font-weight:300; }
  .article-body ul, .article-body ol { margin:0 0 20px 24px; }
  .article-body li { font-size:16px; color:var(--cream-dim); line-height:1.75; margin-bottom:8px; font-weight:300; }
  .article-body strong { color:var(--cream); font-weight:600; }
  .article-body a { color:var(--wine-light); text-decoration:underline; text-underline-offset:2px; }
  .article-body a:hover { color:var(--cream); }

  .related-section { margin-top:60px; padding-top:40px; border-top:1px solid var(--border-sub); }
  .related-label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--wine-light); margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .related-label::before { content:''; width:20px; height:1px; background:var(--wine-light); }
  .related-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }
  .related-card { background:rgba(30,21,24,0.4); border:1px solid var(--border-sub); padding:20px; text-decoration:none; transition:all 0.2s; display:block; }
  .related-card:hover { background:rgba(40,28,32,0.65); border-color:var(--border); }
  .related-cat { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--wine-light); margin-bottom:8px; display:block; }
  .related-card h3 { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:var(--cream); line-height:1.3; }

  footer { border-top:1px solid var(--border); padding:28px 40px; background:rgba(10,7,8,0.8); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:60px; }
  footer p { font-size:11px; color:var(--cream-dim); }
  .footer-links { display:flex; gap:20px; flex-wrap:wrap; }
  .footer-links a { font-size:11px; color:var(--cream-dim); text-decoration:none; transition:color 0.2s; }
  .footer-links a:hover { color:var(--cream); }

  @media (max-width:768px) {
    nav { padding:0 20px; } .nav-links { display:none; }
    .breadcrumb { padding:16px 20px 0; }
    .article-container { padding:32px 20px 48px; }
    .related-grid { grid-template-columns:1fr; }
    footer { padding:24px 20px; flex-direction:column; align-items:flex-start; }
  }
</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title.replace(/"/g, '\\"')}",
  "description": "${metaDescription.replace(/"/g, '\\"')}",
  "author": {
    "@type": "Person",
    "name": "Robert Hess",
    "url": "https://www.propertyownercoverage.com/author.html",
    "jobTitle": "Senior Commercial Insurance Specialist",
    "knowsAbout": ["commercial insurance", "landlord insurance", "property insurance", "California insurance market"]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Property Owner Coverage",
    "url": "https://www.propertyownercoverage.com"
  },
  "datePublished": "${publishDate}",
  "dateModified": "${publishDate}",
  "mainEntityOfPage": "${canonicalUrl}"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.propertyownercoverage.com/"},
    {"@type": "ListItem", "position": 2, "name": "Articles", "item": "https://www.propertyownercoverage.com/articles.html"},
    {"@type": "ListItem", "position": 3, "name": "${title.replace(/"/g, '\\"')}"}
  ]
}
</script>
</head>
<body>

<nav>
  <a href="/" class="logo">
    <div class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#f0ebe3" stroke-width="2.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
    Property<span>Owner</span>Coverage
  </a>
  <ul class="nav-links">
    <li><a href="/articles.html">Articles</a></li>
    <li><a href="/tools.html">Tools</a></li>
    <li><a href="/coverage-types.html">Coverage Types</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/#policy-analyzer" class="nav-cta">Free Tools</a></li>
  </ul>
</nav>

<div class="breadcrumb">
  <a href="/">Home</a> &nbsp;/&nbsp; <a href="/articles.html">Articles</a> &nbsp;/&nbsp; ${title}
</div>

<article class="article-container">
  <header class="article-header">
    <div class="article-cat">${category}</div>
    <h1 class="article-title">${title}</h1>
    <div class="article-meta">
      <span>By <a href="/author.html">Robert Hess</a></span>
      <span class="meta-sep">|</span>
      <span>Published ${formattedDate}</span>
    </div>
  </header>

  <div class="article-body">
${content}
  </div>
${relatedHtml}
</article>

<footer>
  <p>&copy; 2026 PropertyOwnerCoverage.com &mdash; For informational purposes only. Not insurance advice.</p>
  <div class="footer-links">
    <a href="/about.html">About</a>
    <a href="/author.html">Author</a>
    <a href="/articles.html">Articles</a>
    <a href="/tools.html">Tools</a>
    <a href="/disclaimer.html">Disclaimer</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/contact.html">Contact</a>
  </div>
</footer>

</body>
</html>`;
}

function generateArticlesIndexPage(articles) {
  // Sort by date (newest first) - articles should have publishDate
  const sorted = [...articles].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

  const articleCards = sorted.map(article => {
    const category = guessCategory(article.title);
    const dateStr = new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `
    <a href="/articles/${article.slug}.html" class="article-card">
      <div class="article-cat">${category}</div>
      <h2>${article.title}</h2>
      <div class="article-meta">Robert Hess &nbsp;&middot;&nbsp; ${dateStr}</div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Insurance Articles & Guides | Property Owner Coverage</title>
<meta name="description" content="Expert insurance guides for apartment owners, landlords, and commercial real estate investors. Coverage explained in plain English by a 20-year specialist.">
<link rel="canonical" href="${SITE_URL}/articles.html">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#141414; --bg-mid:#1e1518; --wine:#8b1a2a; --wine-bright:#b02438;
    --wine-light:#c44455; --wine-dim:rgba(139,26,42,0.18);
    --cream:#f0ebe3; --cream-dim:rgba(240,235,227,0.55);
    --border:rgba(139,26,42,0.3); --border-sub:rgba(240,235,227,0.08);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--cream); }

  nav { position:sticky; top:0; z-index:100; background:rgba(20,20,20,0.97); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); padding:0 40px; height:64px; display:flex; align-items:center; justify-content:space-between; }
  .logo { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:600; color:var(--cream); text-decoration:none; display:flex; align-items:center; gap:10px; }
  .logo-mark { width:30px; height:30px; background:var(--wine); border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .logo-mark svg { width:16px; height:16px; }
  .logo span { color:var(--wine-light); }
  .nav-links { display:flex; align-items:center; gap:28px; list-style:none; }
  .nav-links a { color:var(--cream-dim); text-decoration:none; font-size:12px; font-weight:500; letter-spacing:0.6px; text-transform:uppercase; transition:color 0.2s; }
  .nav-links a:hover { color:var(--cream); }
  .nav-cta { background:var(--wine) !important; color:var(--cream) !important; padding:7px 16px; font-weight:600 !important; text-transform:none !important; font-size:13px !important; }

  .page-hero { padding:56px 40px 40px; border-bottom:1px solid var(--border-sub); background:linear-gradient(160deg,#141414 0%,#0e0a0b 100%); position:relative; overflow:hidden; }
  .page-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(139,26,42,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,26,42,0.05) 1px,transparent 1px); background-size:56px 56px; }
  .page-hero-inner { position:relative; z-index:1; max-width:680px; }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:10px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--wine-light); margin-bottom:14px; }
  .eyebrow::before { content:''; display:block; width:20px; height:1px; background:var(--wine-light); }
  .page-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,4.5vw,52px); font-weight:700; line-height:1.08; color:var(--cream); margin-bottom:12px; }
  .page-hero h1 em { color:var(--wine-light); font-style:italic; }
  .page-hero p { font-size:15px; font-weight:300; color:var(--cream-dim); line-height:1.7; max-width:520px; }

  .articles-body { padding:48px 40px; }
  .articles-count { font-size:12px; color:var(--cream-dim); margin-bottom:28px; font-family:'DM Mono',monospace; }
  .articles-count span { color:var(--wine-light); }

  .articles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }

  .article-card { background:rgba(30,21,24,0.35); border:1px solid var(--border-sub); padding:28px; text-decoration:none; color:var(--cream); transition:all 0.2s; display:flex; flex-direction:column; }
  .article-card:hover { background:rgba(40,28,32,0.65); border-color:var(--border); }
  .article-cat { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--wine-light); margin-bottom:10px; }
  .article-card h2 { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; line-height:1.25; color:var(--cream); margin-bottom:10px; flex:1; }
  .article-meta { font-size:11px; color:var(--cream-dim); font-family:'DM Mono',monospace; margin-top:16px; }

  footer { border-top:1px solid var(--border); padding:28px 40px; background:rgba(10,7,8,0.8); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
  footer p { font-size:11px; color:var(--cream-dim); }
  .footer-links { display:flex; gap:20px; flex-wrap:wrap; }
  .footer-links a { font-size:11px; color:var(--cream-dim); text-decoration:none; transition:color 0.2s; }
  .footer-links a:hover { color:var(--cream); }

  @media (max-width:900px) { .articles-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:768px) {
    nav { padding:0 20px; } .nav-links { display:none; }
    .page-hero { padding:40px 20px 32px; }
    .articles-body { padding:32px 20px; }
    .articles-grid { grid-template-columns:1fr; }
    footer { padding:24px 20px; flex-direction:column; align-items:flex-start; }
  }
</style>
</head>
<body>

<nav>
  <a href="/" class="logo">
    <div class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#f0ebe3" stroke-width="2.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
    Property<span>Owner</span>Coverage
  </a>
  <ul class="nav-links">
    <li><a href="/articles.html">Articles</a></li>
    <li><a href="/tools.html">Tools</a></li>
    <li><a href="/coverage-types.html">Coverage Types</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/#policy-analyzer" class="nav-cta">Free Tools</a></li>
  </ul>
</nav>

<div class="page-hero">
  <div class="page-hero-inner">
    <div class="eyebrow">Insurance Guides</div>
    <h1>Expert Guides for<br><em>Property Owners.</em></h1>
    <p>Plain-English insurance articles written by a 20-year commercial insurance specialist. No jargon. No fluff. Real answers for landlords and real estate investors nationwide.</p>
  </div>
</div>

<div class="articles-body">
  <div class="articles-count">Showing <span>${sorted.length}</span> article${sorted.length !== 1 ? 's' : ''}</div>
  <div class="articles-grid">${articleCards}
  </div>
</div>

<footer>
  <p>&copy; 2026 PropertyOwnerCoverage.com &mdash; For informational purposes only. Not insurance advice.</p>
  <div class="footer-links">
    <a href="/about.html">About</a>
    <a href="/author.html">Author</a>
    <a href="/articles.html">Articles</a>
    <a href="/tools.html">Tools</a>
    <a href="/disclaimer.html">Disclaimer</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/contact.html">Contact</a>
  </div>
</footer>

</body>
</html>`;
}

async function fetchExistingArticles(githubToken) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/articles`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'PropertyOwnerCoverage-Bot',
        },
      }
    );
    if (!response.ok) return [];
    const files = await response.json();

    // Filter valid article files (no spaces in filename, ends with .html)
    return files
      .filter(f => f.name.endsWith('.html') && !f.name.includes(' ') && f.name !== '.html')
      .map(f => ({
        slug: f.name.replace('.html', ''),
        filename: f.name,
        // Use file sha as proxy for date ordering since we can't get commit dates easily
        // For existing articles, we'll use a default date
        publishDate: new Date().toISOString(),
      }));
  } catch (e) {
    console.error('[fetchExistingArticles] Error:', e.message);
    return [];
  }
}

async function fetchArticleMetadata(githubToken) {
  // Fetch the articles-metadata.json file if it exists
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/articles-metadata.json`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'PropertyOwnerCoverage-Bot',
        },
      }
    );
    if (!response.ok) return {};
    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { data: JSON.parse(content), sha: data.sha };
  } catch (e) {
    return {};
  }
}

async function saveFile(githubToken, filePath, content, message) {
  // Check if file exists to get SHA
  let existingSha = null;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'PropertyOwnerCoverage-Bot',
        },
      }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
    }
  } catch (e) {
    // File doesn't exist, that's fine
  }

  const base64Content = Buffer.from(content, 'utf-8').toString('base64');
  const body = {
    message,
    content: base64Content,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PropertyOwnerCoverage-Bot',
      },
      body: JSON.stringify(body),
    }
  );

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`GitHub save failed: ${putRes.status} ${errBody}`);
  }

  return putRes.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keyword } = req.body || {};
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid "keyword" field' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  const slug = keywordToSlug(keyword);
  const title = slugToTitle(slug);
  const filePath = `articles/${slug}.html`;
  const publishDate = new Date().toISOString();

  const startTime = Date.now();
  console.log(`[generate] keyword: "${keyword.trim()}" -> ${slug}.html`);

  // Fetch existing articles for Related Articles section
  const existingArticles = await fetchExistingArticles(githubToken);
  // Filter out the current article and get random 3 for related links
  const otherArticles = existingArticles.filter(a => a.slug !== slug);
  const shuffled = otherArticles.sort(() => Math.random() - 0.5);
  const relatedArticles = shuffled.slice(0, 3);

  // Build internal linking context for the prompt
  const availableArticles = existingArticles.slice(0, 10).map(a =>
    `- ${SITE_URL}/articles/${a.slug}.html`
  ).join('\n');

  // Step 1: Generate article via Anthropic
  let articleBody;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: `You are a senior commercial insurance specialist with 20+ years of underwriting, claims, and brokerage experience across all 50 states. You have direct expertise with carriers including Travelers, Hartford, Zurich, Chubb, Liberty Mutual, AmTrust, Berkshire Hathaway Guard, Distinguished Programs, Honeycomb, and Lloyd's syndicates. You understand surplus lines markets, California FAIR Plan, NFIP flood programs, and state-specific regulations.

Write expert insurance articles for property owners — specifically landlords and investors who own 5–20 unit apartment buildings, mixed-use properties, or small commercial real estate.

ARTICLE REQUIREMENTS:
- Output ONLY the article body HTML content — no DOCTYPE, html, head, body, or style tags
- Start directly with content (your first tag should be <h2> or <p>)
- Use <h2> for main section headings (4–6 sections per article)
- Use <h3> for subsection headings where needed
- Use <p> for paragraphs, <ul>/<ol> and <li> for lists, <strong> for emphasis
- Write 1,800–2,500 words
- Include specific dollar amounts, percentages, coverage limits, and deductible ranges
- Name real insurance carriers and programs where relevant
- Reference actual policy forms (CP 00 10, CP 00 30, CG 00 01) when applicable
- Mention state-specific considerations (especially California, Texas, Florida, New York)
- Include practical advice: what to ask your agent, what to look for at renewal, red flags in declarations pages
- Write in a direct, authoritative tone — no hedging, no "it depends" without explanation
- No generic filler like "insurance is important" or "contact a professional" — give the actual answer
- End with a concrete action list or FAQ section the reader can use immediately

INTERNAL LINKING (required):
Include 2–3 internal links naturally within the article body text. Use descriptive anchor text that fits the sentence — never "click here." Use these exact URLs for links:

Available articles to link to:
${availableArticles || '- https://www.propertyownercoverage.com/articles.html (articles index)'}

Also link to the tools page when relevant:
- https://www.propertyownercoverage.com/tools.html (premium estimator, coinsurance calculator)

Example of a natural internal link:
<p>This gap is closely related to <a href="https://www.propertyownercoverage.com/articles/Building-Ordinance-Coverage-Explained.html">building ordinance and law coverage</a>, which pays for code upgrades required after a partial loss.</p>`,
        messages: [
          {
            role: 'user',
            content: `Write a comprehensive insurance article about: ${keyword.trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[generate] Anthropic API error:', response.status, errBody);
      return res.status(502).json({
        error: 'Article generation failed',
        status: response.status,
        detail: errBody,
      });
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[generate] Anthropic responded in ${elapsed}s, stop_reason: ${data.stop_reason}`);

    const textBlocks = (data.content || []).filter(block => block.type === 'text');
    articleBody = textBlocks.map(block => block.text).join('');

    if (!articleBody) {
      console.error('[generate] No text content. Block types:', data.content?.map(b => b.type));
      return res.status(502).json({ error: 'No text content in API response' });
    }

    console.log(`[generate] Article body: ${articleBody.length} chars`);
  } catch (err) {
    console.error('[generate] Error:', err.message);
    return res.status(500).json({ error: 'Article generation error', detail: err.message });
  }

  // Step 2: Generate full HTML page
  const category = guessCategory(title);
  const fullHtml = generateFullArticlePage(slug, title, category, articleBody, publishDate, relatedArticles);

  // Step 3: Save article to GitHub
  try {
    const result = await saveFile(githubToken, filePath, fullHtml, `Add article: ${title}`);
    console.log(`[github] Article saved: ${filePath}`);

    // Step 4: Update articles metadata
    const metadataResult = await fetchArticleMetadata(githubToken);
    const metadata = metadataResult.data || {};
    metadata[slug] = {
      title,
      slug,
      publishDate,
      category,
    };

    await saveFile(
      githubToken,
      'articles-metadata.json',
      JSON.stringify(metadata, null, 2),
      `Update articles metadata: add ${slug}`
    );

    // Step 5: Rebuild articles.html
    const allArticles = Object.values(metadata).map(m => ({
      slug: m.slug,
      title: m.title,
      publishDate: m.publishDate,
    }));

    const articlesIndexHtml = generateArticlesIndexPage(allArticles);
    await saveFile(githubToken, 'articles.html', articlesIndexHtml, `Rebuild articles index: add ${title}`);
    console.log(`[github] articles.html rebuilt with ${allArticles.length} articles`);

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const articleUrl = `${SITE_URL}/articles/${slug}.html`;

    console.log(`[done] ${slug}.html saved in ${totalElapsed}s -> ${articleUrl}`);

    return res.status(200).json({
      success: true,
      slug,
      filename: `${slug}.html`,
      path: filePath,
      url: articleUrl,
      sha: result.content.sha,
      chars: fullHtml.length,
      articlesCount: allArticles.length,
    });
  } catch (err) {
    console.error('[github] Error:', err.message);
    return res.status(500).json({
      error: 'GitHub save error',
      detail: err.message,
    });
  }
}
