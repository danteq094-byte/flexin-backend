let games = new Map();

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        // Usamos el jobId de Roblox para identificar el servidor único
        data.lastUpdate = Date.now();
        games.set(data.jobId || 'default-server', data);
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        const now = Date.now();
        // CAMBIO: Ahora espera 2 minutos (120000ms) antes de borrar un juego inactivo
        for (let [id, g] of games) {
            if (now - g.lastUpdate > 120000) { 
                games.delete(id);
            }
        }
        return res.status(200).json(Array.from(games.values()));
    }
}
