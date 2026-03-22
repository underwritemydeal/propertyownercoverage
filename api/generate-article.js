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
        system: `You are a senior commercial insurance specialist with 20+ years experience. Write accurate, expert articles for property owners nationwide. Research the topic using web search before writing.

When writing articles, output ONLY the article HTML body content — no <html>, <head>, <body>, or <style> tags. Use these HTML elements:
- <h2> for main section headings
- <h3> for subsection headings
- <p> for paragraphs
- <ul>/<ol> and <li> for lists
- <strong> for emphasis

Write 1,500–2,500 words. Be specific with numbers, dollar amounts, and real carrier names. No fluff or generic advice. Write like you're explaining to a landlord who owns 5–20 units.`,
        tools: [{ type: 'web_search_20250305' }],
        messages: [
          {
            role: 'user',
            content: `Research and write a comprehensive insurance article about: ${keyword.trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return res.status(502).json({ error: 'Anthropic API request failed', status: response.status });
    }

    const data = await response.json();

    // Extract text blocks from the response (skip tool_use/search result blocks)
    const textBlocks = (data.content || []).filter(block => block.type === 'text');
    const content = textBlocks.map(block => block.text).join('');

    if (!content) {
      return res.status(502).json({ error: 'No text content in API response' });
    }

    return res.status(200).json({ content });
  } catch (err) {
    console.error('Generate article error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
