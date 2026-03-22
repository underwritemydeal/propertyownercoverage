export const config = {
  maxDuration: 120,
};

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

  const requestBody = {
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
- End with a concrete action list the reader can use immediately`,
    messages: [
      {
        role: 'user',
        content: `Write a comprehensive insurance article about: ${keyword.trim()}`,
      },
    ],
  };

  try {
    const startTime = Date.now();
    console.log('Calling Anthropic API for keyword:', keyword.trim());

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({
        error: 'Anthropic API request failed',
        status: response.status,
        detail: errBody,
      });
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Anthropic responded in ${elapsed}s, stop_reason: ${data.stop_reason}, blocks: ${data.content?.length}`);

    const textBlocks = (data.content || []).filter(block => block.type === 'text');
    const content = textBlocks.map(block => block.text).join('');

    if (!content) {
      console.error('No text content found. Block types:', data.content?.map(b => b.type));
      return res.status(502).json({ error: 'No text content in API response' });
    }

    console.log(`Article generated: ${content.length} chars in ${elapsed}s`);
    return res.status(200).json({ content });
  } catch (err) {
    console.error('Generate article error:', err.message, err.stack);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
