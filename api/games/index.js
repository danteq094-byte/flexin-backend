// api/games/index.js
let activeGames = {}; // Esto guarda los juegos en la memoria de Vercel

export default function handler(req, res) {
    // Configurar CORS para que Roblox pueda entrar
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const { jobId, name, players, maxPlayers, gameId } = req.body;
        
        // Guardamos o actualizamos el juego usando el jobId como llave
        activeGames[jobId] = {
            jobId,
            name,
            players,
            maxPlayers,
            gameId,
            lastSeen: Date.now()
        };

        return res.status(200).json({ success: true });
    } 

    if (req.method === 'GET') {
        // Limpiar juegos que no han enviado señal en más de 30 segundos
        const now = Date.now();
        Object.keys(activeGames).forEach(id => {
            if (now - activeGames[id].lastSeen > 30000) delete activeGames[id];
        });

        return res.status(200).json(Object.values(activeGames));
    }

    res.status(405).end(); // Método no permitido
}