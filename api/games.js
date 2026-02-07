// Variable global (se mantiene mientras el servidor esté "despierto")
let globalGames = [];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        const data = req.body;
        data.lastUpdate = Date.now();

        // Si el juego ya existe, lo actualizamos; si no, lo añadimos
        const index = globalGames.findIndex(g => g.jobId === data.jobId);
        if (index !== -1) {
            globalGames[index] = data;
        } else {
            globalGames.push(data);
        }
        
        return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
        // ELIMINAMOS el código que filtraba por tiempo (now - lastUpdate)
        // Ahora simplemente enviamos lo que haya en la lista
        return res.status(200).json(globalGames);
    }
}
