import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Ruta a tu carpeta en Vercel/Local
    const logsDir = path.join(process.cwd(), 'public', 'Game-Logs');

    if (req.method === 'POST') {
        const data = req.body;
        const gameId = data.gameId || data.placeId;

        const newGame = {
            jobId: data.jobId,
            gameId: gameId,
            name: data.name || data.gameName || "Unknown Game",
            players: data.players || 0,
            maxPlayers: data.maxPlayers || 0,
            detectedAt: new Date().toISOString()
        };

        // GUARDADO ÚNICO: Usamos el gameId como nombre de archivo
        // Esto sobrescribe el archivo anterior del mismo juego, evitando duplicados.
        const filePath = path.join(logsDir, `${gameId}.json`);
        
        try {
            fs.writeFileSync(filePath, JSON.stringify(newGame));
            return res.status(200).json({ status: "success" });
        } catch (err) {
            return res.status(500).json({ error: "Error escribiendo log" });
        }
    }

    if (req.method === 'GET') {
        try {
            // Leemos todos los archivos .json de la carpeta
            const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.json'));
            const allGames = files.map(file => {
                const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
                return JSON.parse(content);
            });

            // Devolvemos el array limpio para tu script.js
            return res.status(200).json(allGames);
        } catch (err) {
            return res.status(200).json([]); // Si la carpeta está vacía
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}