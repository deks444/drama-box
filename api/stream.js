export default async function handler(req, res) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    const { endpoint } = req.query;
    const apiKey = process.env.VITE_STREAM_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    // Reconstruct the target URL
    // endpoint comes from the rewrite rule: /stream-api/:path* -> /api/stream?endpoint=:path*
    // If request was /stream-api/index.php?page=1, endpoint is "index.php" (or ["index.php"]?)
    // and req.query is { endpoint: 'index.php', page: '1' }

    const pathStr = Array.isArray(endpoint) ? endpoint.join('/') : (endpoint || '');

    // Filter out the 'endpoint' param from query string to pass the rest
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'endpoint') {
            queryParams.append(key, value);
        }
    }

    const targetUrl = `https://streamapi.web.id/${pathStr}?${queryParams.toString()}`;

    try {
        const apiResponse = await fetch(targetUrl, {
            headers: {
                'X-API-Key': apiKey,
                'User-Agent': 'DramaBox-Proxy/1.0'
            }
        });

        const data = await apiResponse.json();

        // Set cache control for performance
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

        return res.status(apiResponse.status).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: 'Failed to fetch data' });
    }
}
