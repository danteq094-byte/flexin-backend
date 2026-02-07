// Usamos una variable global que Vercel intenta mantener mientras el contenedor esté tibio
let globalGames = [];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        if (!data.jobId) return res.status(400).json({ error: "No JobId" });

        // Buscamos si el juego ya existe para actualizarlo o agregarlo
        const index = globalGames.findIndex(g => g.jobId === data.jobId);
        if (index !== -1) {
            globalGames[index] = { ...data, lastUpdate: Date.now() };
        } else {
            globalGames.push({ ...data, lastUpdate: Date.now() });
        }
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        // No filtramos nada. Enviamos TODO lo que el servidor recuerde.
        return res.status(200).json(globalGames);
    }
}
