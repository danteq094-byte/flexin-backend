// ==========================================
// --- VARIABLES DE ESTADO ---
// ==========================================
let wList = JSON.parse(localStorage.getItem('wList')) || [];
let execs = parseInt(localStorage.getItem('execs')) || 0;
let wCount = parseInt(localStorage.getItem('wCount')) || 0;
let currentPage = 1; 

// ==========================================
// --- INICIALIZACIÓN ---
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    showTab('home'); 
    const savedTheme = localStorage.getItem('selectedTheme');
    if(savedTheme) applyTheme(savedTheme);

    updateHomeHeader();
    renderScriptHub();
    renderWhitelist();
    renderThemes(); 
    refreshGames(); 
    createParticles();
    updateStatsUI();

    // Actualizamos cada 5 segundos para CAPTURAR nuevos, pero NO BORRAR los viejos
    setInterval(refreshGames, 5000);
});

function updateStatsUI() {
    const statExecs = document.getElementById('stat-execs');
    if(statExecs) statExecs.innerText = execs;
    const statWCount = document.getElementById('stat-w-count');
    if(statWCount) statWCount.innerText = wCount;
}

// ==========================================
// --- NAVEGACIÓN ---
// ==========================================
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.style.display = 'none'; 
    });
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.remove('hidden');
        target.style.setProperty('display', (tabId === 'home' ? 'flex' : 'block'), 'important');
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + tabId);
    if (activeBtn) activeBtn.classList.add('active');
}

// ==========================================
// --- SISTEMA DE SALUDO ---
// ==========================================
function updateHomeHeader() {
    const welcomeText = document.getElementById('welcome-text');
    const userIcon = document.getElementById('user-icon');
    const activeUser = localStorage.getItem('activeUser');
    
    if (activeUser && wList.includes(activeUser)) {
        welcomeText.innerHTML = `Hi, <span class="font-bold text-white">${activeUser}</span>`;
        userIcon.src = `https://www.roblox.com/headshot-thumbnail/image?username=${encodeURIComponent(activeUser)}&width=420&height=420&format=png`;
        userIcon.style.display = "block";
    } else {
        welcomeText.innerHTML = `Hi, <span class="font-bold text-white">random</span>`;
        if(userIcon) userIcon.style.display = "none";
    }
}

// ==========================================
// --- EXECUTOR ---
// ==========================================
async function runExecute() {
    const editor = document.getElementById('editor');
    const code = editor.value;
    if (!code.trim()) return notify("Put a script first! ❌", true);

    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script: code })
        });
        if (response.ok) {
            execs++; 
            localStorage.setItem('execs', execs);
            updateStatsUI();
            notify("Script sent to server ✅");
        }
    } catch (err) {
        notify("Server connection error ❌", true);
    }
}

// ==========================================
// --- GAMES (EL CAMBIO IMPORTANTE AQUÍ) ---
// ==========================================
async function refreshGames() {
    const container = document.getElementById('games-container');
    const statGames = document.getElementById('stat-games');
    if(!container) return;

    try {
        const response = await fetch('/api/games?t=' + Date.now());
        
        // 1. Sacamos los juegos que ya teníamos guardados en el PC
        let persistentDB = JSON.parse(localStorage.getItem('ss_total_db')) || [];

        if (response.ok) {
            const serverGames = await response.json();

            // 2. Si el servidor trae algo nuevo, lo metemos a la bolsa sin borrar lo viejo
            if (Array.isArray(serverGames) && serverGames.length > 0) {
                serverGames.forEach(newG => {
                    const index = persistentDB.findIndex(saved => saved.jobId === newG.jobId);
                    if (index === -1) {
                        persistentDB.unshift(newG); // Juego nuevo: va arriba
                    } else {
                        persistentDB[index] = newG; // Ya existía: actualizamos (jugadores, etc)
                    }
                });
                // 3. Guardamos la bolsa actualizada en el disco duro
                localStorage.setItem('ss_total_db', JSON.stringify(persistentDB));
            }
        }

        // 4. USAMOS SIEMPRE LA BOLSA LOCAL (persistentDB)
        // Aunque el servidor esté vacío, persistentDB tendrá los juegos de antes.
        if(statGames) statGames.innerText = persistentDB.length;

        if (persistentDB.length > 0) {
            const gamesPerPage = 15;
            const start = (currentPage - 1) * gamesPerPage;
            const end = start + gamesPerPage;
            const paginatedGames = persistentDB.slice(start, end);

            container.innerHTML = paginatedGames.map(g => {
                const thumb = `https://www.roblox.com/asset-thumbnail/image?assetId=${g.gameId}&width=150&height=150&format=png`;
                return `
                <div class="glass-card flex flex-col justify-between p-6 border-l-4 dynamic-border">
                    <div class="flex items-center gap-4">
                        <img src="${thumb}" onerror="this.src='https://tr.rbxcdn.com/38c353386000e311a268e37d97745778/150/150/Image/Png'" class="w-14 h-14 rounded-lg object-cover">
                        <div class="overflow-hidden">
                            <h3 class="text-lg font-bold text-white truncate">${g.name || 'Server'}</h3>
                            <p class="text-zinc-500 text-[10px]">ID: ${g.gameId}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold">🟢 ${g.players || 0} Players</span>
                        <a href="https://www.roblox.com/games/${g.gameId}" target="_blank" class="text-[10px] font-black uppercase dynamic-color">Select ↗</a>
                    </div>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = '<p class="text-zinc-500 py-10 text-center col-span-full">Waiting for infected servers...</p>';
        }
    } catch (err) {
        console.error("Error al refrescar");
    }
}

// Función para cuando quieras limpiar la lista tú mismo
function clearGames() {
    if(confirm("¿Borrar todos los servidores?")) {
        localStorage.removeItem('ss_total_db');
        location.reload();
    }
}

// ==========================================
// --- OTROS (WHITELIST, THEMES, PARTICLES) ---
// ==========================================
// ... (Aquí van tus otras funciones de Whitelist y Temas que ya tenías)
function renderThemes() {
    const grid = document.getElementById('theme-grid');
    if(!grid) return;
    const colors = ['#00ffcc', '#ff0055', '#0077ff', '#ffaa00', '#a200ff', '#ffffff'];
    grid.innerHTML = colors.map(color => `<button onclick="applyTheme('${color}')" class="w-full aspect-square rounded-full border-2 border-white/10" style="background:${color}"></button>`).join('');
}
function applyTheme(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('selectedTheme', color);
}
function notify(text, isError = false) {
    const area = document.getElementById('notif-area');
    if(!area) return;
    const n = document.createElement('div');
    n.className = `notif-bubble ${isError ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'} px-6 py-3 rounded-2xl border border-current mb-2`;
    n.innerText = text;
    area.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}
function createParticles() {
    const bg = document.getElementById('bg-particles');
    if(!bg) return;
    for(let i=0; i<20; i++) {
        const p = document.createElement('div');
        p.className = 'falling-item';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 3 + 4) + 's';
        bg.appendChild(p);
    }
}
// (Agrega aquí handleWhitelist, renderWhitelist, etc. si las borraste)
