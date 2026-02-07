// Usamos una variable fuera del handler para persistencia temporal
let gamesCache = []; 

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        data.lastUpdate = Date.now();
        
        // Filtramos para no repetir el mismo juego (usando jobId)
        gamesCache = gamesCache.filter(g => g.jobId !== data.jobId);
        gamesCache.push(data);
        
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        const now = Date.now();
        // Limpiamos SOLO juegos que tengan más de 5 minutos de inactividad
        gamesCache = gamesCache.filter(g => (now - g.lastUpdate) < 300000);
        
        return res.status(200).json(gamesCache);
    }
}
