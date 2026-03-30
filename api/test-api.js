export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  console.log('Test started');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('Key exists:', !!apiKey);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say hello' }],
    }),
  });

  console.log('API responded:', response.status);
  const data = await response.json();
  return res.status(200).json({ status: response.status, data });
}
