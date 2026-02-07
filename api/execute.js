let currentScript = "";

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Guardamos el script que envías desde la web
        currentScript = req.body.script || "";
        return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
        // ESTA ES LA CLAVE: 
        // Enviamos el script directamente como texto, no como JSON.
        res.setHeader('Content-Type', 'text/plain');
        res.send(currentScript);
        
        // Limpiamos el script para que no se ejecute infinitamente
        currentScript = ""; 
    }
}