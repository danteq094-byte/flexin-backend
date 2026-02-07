let games = new Map();

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        // Usamos el JobId de Roblox para que no se dupliquen
        data.lastUpdate = Date.now();
        games.set(data.jobId || 'default', data);
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        const now = Date.now();
        // Solo borra si el juego no ha enviado señal en 1 minuto (60000ms)
        for (let [id, g] of games) {
            if (now - g.lastUpdate > 60000) { 
                games.delete(id);
            }
        }
        return res.status(200).json(Array.from(games.values()));
    }
}
