export const config = {
  maxDuration: 120,
};

const REPO = 'underwritemydeal/propertyownercoverage';

function keywordToFilename(keyword) {
  return keyword
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')
    .replace(/[^A-Za-z0-9\-]/g, '') + '.html';
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

  const filename = keywordToFilename(keyword);
  const filePath = `articles/${filename}`;

  // Step 1: Generate article via Anthropic
  const startTime = Date.now();
  console.log(`[generate] keyword: "${keyword.trim()}" -> ${filename}`);

  let content;
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
- Output ONLY HTML body content — no <html>, <head>, <body>, or <style> tags
- Use <h2> for main section headings (4–6 sections per article)
- Use <h3> for subsection headings where needed
- Use <p> for paragraphs, <ul>/<ol> and <li> for lists, <strong> for emphasis
- Write 1,500–2,500 words
- Include specific dollar amounts, percentages, coverage limits, and deductible ranges
- Name real insurance carriers and programs where relevant
- Reference actual policy forms (CP 00 10, CP 00 30, CG 00 01) when applicable
- Mention state-specific considerations (especially California, Texas, Florida, New York)
- Include practical advice: what to ask your agent, what to look for at renewal, red flags in declarations pages
- Write in a direct, authoritative tone — no hedging, no "it depends" without explanation
- No generic filler like "insurance is important" or "contact a professional" — give the actual answer
- End with a concrete action list the reader can use immediately

INTERNAL LINKING (required):
Include 2–3 internal links naturally within the article body text. Use descriptive anchor text that fits the sentence — never "click here." Links must use full URLs.

Available link targets:
- Articles index: https://www.propertyownercoverage.com/articles.html
- Tools page: https://www.propertyownercoverage.com/tools.html (premium estimator, coinsurance calculator)
- Individual articles use this URL pattern: https://www.propertyownercoverage.com/article.html?slug=Title-With-Dashes.html

Link to related insurance topics that are likely to exist on the site. Choose slugs from common property insurance subjects:
  Habitability-Coverage-For-Landlords.html
  Building-Ordinance-And-Law-Coverage-Explained.html
  Wrongful-Eviction-Liability-Insurance.html
  Coinsurance-Penalty-Explained.html
  Why-Is-My-Apartment-Building-Insurance-Going-Up.html
  Loss-Of-Rents-Coverage-For-Landlords.html
  Lender-Insurance-Requirements-For-Rental-Properties.html
  California-Landlord-Insurance-Guide.html
  How-To-Lower-Apartment-Building-Insurance-Costs.html

If the article topic relates to costs or coverage amounts, include a link to the tools page (e.g., "Use our <a href="https://www.propertyownercoverage.com/tools.html">premium estimator</a> to see how this affects your rates").

Example of a natural internal link within body text:
<p>This gap is closely related to <a href="https://www.propertyownercoverage.com/article.html?slug=Building-Ordinance-And-Law-Coverage-Explained.html">building ordinance and law coverage</a>, which pays for code upgrades required after a partial loss.</p>`,
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
    content = textBlocks.map(block => block.text).join('');

    if (!content) {
      console.error('[generate] No text content. Block types:', data.content?.map(b => b.type));
      return res.status(502).json({ error: 'No text content in API response' });
    }

    console.log(`[generate] Article: ${content.length} chars`);
  } catch (err) {
    console.error('[generate] Error:', err.message);
    return res.status(500).json({ error: 'Article generation error', detail: err.message });
  }

  // Step 2: Check if file already exists (need SHA to update)
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
      console.log(`[github] File exists, will update (sha: ${existingSha.slice(0, 7)})`);
    } else {
      console.log(`[github] File does not exist, will create`);
    }
  } catch (err) {
    console.log(`[github] Existence check failed, assuming new file: ${err.message}`);
  }

  // Step 3: Save to GitHub
  try {
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');

    const githubBody = {
      message: `Add article: ${filename}`,
      content: base64Content,
    };
    if (existingSha) {
      githubBody.sha = existingSha;
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
        body: JSON.stringify(githubBody),
      }
    );

    if (!putRes.ok) {
      const errBody = await putRes.text();
      console.error('[github] Save failed:', putRes.status, errBody);
      // Still return the content so it's not lost
      return res.status(502).json({
        error: 'Article generated but GitHub save failed',
        status: putRes.status,
        detail: errBody,
        content,
        filename,
      });
    }

    const result = await putRes.json();
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const articleUrl = `https://www.propertyownercoverage.com/article.html?slug=${encodeURIComponent(filename)}`;

    console.log(`[done] ${filename} saved in ${totalElapsed}s -> ${articleUrl}`);

    return res.status(200).json({
      success: true,
      filename,
      path: filePath,
      url: articleUrl,
      sha: result.content.sha,
      chars: content.length,
    });
  } catch (err) {
    console.error('[github] Error:', err.message);
    return res.status(500).json({
      error: 'GitHub save error',
      detail: err.message,
      content,
      filename,
    });
  }
}
