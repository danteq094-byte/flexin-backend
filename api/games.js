// Variable temporal (Se borra si Vercel apaga la función)
let tempGames = new Map();

export default function handler(req, res) {
    // Configuración de CORS para permitir peticiones desde tu frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responder rápido a peticiones de pre-vuelo (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // REGISTRAR O ACTUALIZAR UN JUEGO
    if (req.method === 'POST') {
        const data = req.body;
        
        // Validamos que el ID exista, si no, no guardamos nada
        const gameId = data.gameId || data.placeId;
        if (!gameId) {
            return res.status(400).json({ error: "Falta gameId o placeId" });
        }

        const newGame = {
            jobId: data.jobId || "N/A",
            gameId: gameId.toString(),
            name: (data.name || "JUEGO SIN NOMBRE").toUpperCase(),
            players: data.players || 0,
            maxPlayers: data.maxPlayers || 0,
            // Usamos el endpoint que devuelve la IMAGEN DIRECTA (.png)
            thumbnail: `https://www.roblox.com/asset-thumbnail/image?assetId=${gameId}&width=768&height=432&format=png`,
            lastUpdate: Date.now()
        };

        // Guardar en la memoria temporal
        tempGames.set(gameId.toString(), newGame);
        
        return res.status(200).json({ 
            status: "success", 
            message: "Juego actualizado",
            data: newGame 
        });
    }

    // OBTENER LA LISTA DE JUEGOS
    if (req.method === 'GET') {
        const now = Date.now();
        
        // Limpieza: Borrar juegos que no han enviado señal en 10 minutos (600,000 ms)
        for (let [id, game] of tempGames) {
            if (now - game.lastUpdate > 600000) {
                tempGames.delete(id);
            }
        }

        // Convertir el Map a un Array para que el frontend lo lea fácilmente
        const gamesList = Array.from(tempGames.values());
        return res.status(200).json(gamesList);
    }

    // Si usan otro método (PUT, DELETE, etc)
    res.status(405).json({ error: "Método no permitido" });
}
