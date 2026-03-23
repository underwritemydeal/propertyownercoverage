export default async function handler(req, res) {
  // CORS headers for frontend calls
  res.setHeader('Access-Control-Allow-Origin', 'https://www.propertyownercoverage.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  const apiToken = process.env.MAILERLITE_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ error: 'MAILERLITE_API_TOKEN not configured' });
  }

  const GROUP_ID = '182709599355274836';

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        groups: [GROUP_ID],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MailerLite error:', response.status, JSON.stringify(data));
      // Still return success if subscriber already exists
      if (response.status === 422 && JSON.stringify(data).includes('already')) {
        return res.status(200).json({ success: true, message: 'Already subscribed' });
      }
      return res.status(502).json({ error: 'Subscription failed', detail: data });
    }

    console.log(`[subscribe] ${email.trim()} added to group ${GROUP_ID}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[subscribe] Error:', err.message);
    return res.status(500).json({ error: 'Subscription error' });
  }
}
