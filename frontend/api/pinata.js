// Serverless Pinata proxy for secure uploads from frontend
// Deploy this file under frontend/api/ (Vercel serverless function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const PINATA_API_KEY = process.env.IPFS_API_KEY || process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.IPFS_SECRET_KEY || process.env.PINATA_SECRET_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    return res.status(500).json({ error: 'Pinata keys not configured on server' });
  }

  try {
    const metadata = req.body;

    // Build payload expected by Pinata
    const body = JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `credential-${metadata.studentName || 'unknown'}-${Date.now()}` },
    });

    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body,
    });

    const data = await pinataRes.json();

    if (!pinataRes.ok) {
      return res.status(pinataRes.status || 502).json({ error: data?.error || 'Pinata upload failed', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Pinata proxy error:', err);
    return res.status(500).json({ error: 'Pinata proxy error', details: err.message });
  }
}
