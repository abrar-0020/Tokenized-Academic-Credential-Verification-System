// Serverless Pinata proxy for secure uploads from frontend
// Rejects unencrypted plaintext student/academic metadata before pinning to public IPFS.

const DISALLOWED_PLAINTEXT_KEYS = [
  'studentName',
  'enrollmentNumber',
  'degree',
  'grade',
  'branch',
  'fieldOfStudy',
  'field',
  'institution',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metadata = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON metadata payload' });
    }

    // Refuse plaintext PII or academic records on public IPFS before checking credentials
    const leakedKeys = DISALLOWED_PLAINTEXT_KEYS.filter(
      (key) => metadata[key] !== undefined && metadata[key] !== null && String(metadata[key]).trim() !== ''
    );
    if (leakedKeys.length > 0 || !metadata.isEncrypted || !metadata.encryptedData?.ciphertext) {
      return res.status(400).json({
        error: 'Refusing to upload unencrypted credential metadata to public IPFS',
        details: leakedKeys.length > 0 ? `Disallowed plaintext fields: ${leakedKeys.join(', ')}` : 'Missing AES-256-GCM encryptedData payload',
      });
    }

    const PINATA_API_KEY = process.env.IPFS_API_KEY || process.env.PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.IPFS_SECRET_KEY || process.env.PINATA_SECRET_KEY;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return res.status(500).json({ error: 'Pinata keys not configured on server' });
    }

    const safePinName = `tokcred-${String(metadata.credentialId || 'confidential').replace(/[^a-zA-Z0-9_-]/g, '')}-${Date.now()}`;

    const body = JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: safePinName },
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
