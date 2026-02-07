let games = new Map();
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'POST') {
        const data = req.body;
        data.lastUpdate = Date.now();
        games.set(data.jobId || 'default', data);
        return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
        return res.status(200).json(Array.from(games.values()));
    }
}
