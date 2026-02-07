let games = new Map();

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        data.lastUpdate = Date.now();
        // Guardamos usando el JobId que envía tu infect
        games.set(data.jobId, data);
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        const now = Date.now();
        // CAMBIO: Aumentamos a 30000 (30 segundos) para que no desaparezca el cuadro
        for (let [id, g] of games) {
            if (now - g.lastUpdate > 30000) { 
                games.delete(id);
            }
        }
        return res.status(200).json(Array.from(games.values()));
    }
}
