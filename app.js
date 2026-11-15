// ==========================================
// WALLORAA CORE ENGINE (app.js) — R2 + SUPABASE HYBRID
// ==========================================
const SUPABASE_URL = "https://dhzkkpsdowpsneozkhvt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uLdZ-Lj2jEWMmyyFNl7W7w_oXlom5lN";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ['All', 'Beauty', 'Abstract', 'Nature', 'Cars & Bikes', 'Anime', 'Minimal', 'AMOLED Dark'];

const STARTER_WALLPAPERS = [
  {
    id: 'demo-1',
    title: 'Chromatic Silk Waves',
    category: 'Abstract',
    resolution: '8K RAW',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=90',
    colors: ['#7c3aed', '#ec4899', '#06b6d4'],
    tags: ['3d', 'silk', 'gradient', 'colorful'],
    downloads: 1420,
    featured: true
  },
  {
    id: 'demo-2',
    title: 'Aurora Borealis Over Iceland',
    category: 'Nature',
    resolution: '4K UHD',
    image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=90',
    colors: ['#10b981', '#06b6d4', '#0f172a'],
    tags: ['aurora', 'night', 'iceland', 'stars'],
    downloads: 985,
    featured: false
  },
  {
    id: 'demo-3',
    title: 'Obsidian Supercar Studio',
    category: 'Cars & Bikes',
    resolution: '4K UHD',
    image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=90',
    colors: ['#f43f5e', '#1e293b', '#09090b'],
    tags: ['supercar', 'dark', 'sport', 'luxury'],
    downloads: 1840,
    featured: false
  },
  {
    id: 'demo-4',
    title: 'Shinjuku Midnight Neon',
    category: 'Anime',
    resolution: '4K UHD',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&q=90',
    colors: ['#ec4899', '#3b82f6', '#1e1b4b'],
    tags: ['tokyo', 'neon', 'cyberpunk', 'night'],
    downloads: 2150,
    featured: false
  }
];

let allWallpapers = [];
let currentUser = null;
let selectedFiles = [];

// Inject Futuristic Global Styles & Fonts
function injectFuturisticTheme() {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');

    :root {
      --bg-void: #05060a;
      --neon-cyan: #00f0ff;
      --neon-violet: #a855f7;
      --neon-pink: #ec4899;
    }

    body {
      background-color: var(--bg-void);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
    }

    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .font-mono-tech { font-family: 'JetBrains Mono', monospace; }

    .cyber-grid {
      background-size: 44px 44px;
      background-image: 
        linear-gradient(to right, rgba(0, 240, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
    }

    .hud-panel {
      background: rgba(10, 12, 20, 0.72);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .hud-card {
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.05) 0%, rgba(10, 12, 20, 0.6) 100%);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.8);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.35s ease;
    }

    .hud-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 240, 255, 0.45);
      box-shadow: 0 20px 45px -12px rgba(0, 240, 255, 0.18), 0 0 20px rgba(168, 85, 247, 0.15);
    }

    .gradient-cyber {
      background: linear-gradient(135deg, #ffffff 0%, #67e8f9 45%, #c084fc 80%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-cyber {
      background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 50%, #db2777 100%);
      background-size: 200% 200%;
      transition: all 0.3s ease;
    }
    .btn-cyber:hover {
      background-position: 100% 50%;
      box-shadow: 0 0 24px rgba(0, 240, 255, 0.4);
      transform: translateY(-1px);
    }

    .masonry-grid { column-count: 1; column-gap: 1.4rem; }
    @media (min-width: 640px) { .masonry-grid { column-count: 2; } }
    @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
    @media (min-width: 1440px) { .masonry-grid { column-count: 4; } }
    .masonry-item { break-inside: avoid; margin-bottom: 1.4rem; }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}

// Render Shared Header, Footer & Admin Modals
function renderShell(activePage) {
  injectFuturisticTheme();

  const bg = document.createElement('div');
  bg.className = 'fixed inset-0 pointer-events-none z-0 cyber-grid overflow-hidden';
  bg.innerHTML = `
    <div class="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]"></div>
    <div class="absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full bg-violet-600/15 blur-[150px]"></div>
    <div class="absolute -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full bg-fuchsia-600/10 blur-[140px]"></div>
  `;
  document.body.prepend(bg);

  const navLinkClass = (page) =>
    activePage === page
      ? 'text-cyan-300 bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
      : 'text-slate-300 hover:text-white border-transparent hover:bg-white/[0.05]';

  const headerHTML = `
    <header class="sticky top-0 z-40 hud-panel border-b border-white/[0.08]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <a href="index.html" class="flex items-center gap-3 group shrink-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div class="w-full h-full bg-[#06070c] rounded-[10.5px] flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M3.5 6.5L7.2 17.5L12 9.5L16.8 17.5L20.5 6.5" stroke="url(#wGrad)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="5" r="1.5" fill="#00f0ff"/>
                <defs>
                  <linearGradient id="wGrad" x1="3.5" y1="6.5" x2="20.5" y2="17.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00f0ff"/><stop offset="0.5" stop-color="#c084fc"/><stop offset="1" stop-color="#f472b6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-display font-bold text-xl tracking-tight text-white">WALLORAA</span>
              <span class="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">OS 2.0</span>
            </div>
            <p class="font-mono-tech text-[10px] text-slate-400 hidden sm:block">4K NEURAL GALLERY</p>
          </div>
        </a>

        <nav class="flex items-center gap-1.5 sm:gap-2 bg-white/[0.03] p-1 rounded-full border border-white/10">
          <a href="index.html" class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${navLinkClass('home')}">Home</a>
          <a href="explore.html" class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${navLinkClass('explore')}">Explore</a>
          <a href="explore.html?sort=popular" class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${navLinkClass('trending')}">Trending</a>
        </nav>

        <div class="flex items-center gap-2 shrink-0">
          <div id="adminControls" class="hidden items-center gap-2">
            <button onclick="openUploadModal()" class="btn-cyber flex items-center gap-1.5 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M12 4v16m8-8H4"/></svg>
              <span>Upload</span>
            </button>
            <button onclick="handleAdminLogout()" title="Sign Out" class="p-2 rounded-full bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
          <button id="adminLoginBtn" onclick="openLoginModal()" class="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition cursor-pointer">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Studio</span>
          </button>
        </div>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  const footerAndModalsHTML = `
        <footer class="relative z-10 border-t border-white/[0.08] hud-panel py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="font-display font-bold text-white text-sm">WALLORAA</span>
          <span class="font-mono-tech text-[11px] text-slate-500">// OPEN-SOURCE 4K ARCHIVE</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <a href="index.html" class="hover:text-cyan-300 transition">Home</a>
          <a href="explore.html" class="hover:text-cyan-300 transition">Catalog</a>
          <a href="privacy.html" class="hover:text-cyan-300 transition">Privacy Policy</a>
          <a href="terms.html" class="hover:text-cyan-300 transition">Terms</a>
          <a href="dmca.html" class="hover:text-cyan-300 transition">DMCA</a>
          <a href="contact.html" class="hover:text-cyan-300 transition">Contact</a>
        </div>
        <p class="font-mono-tech text-[11px]">CC0 FREE LICENSE • 2026</p>
      </div>
    </footer>

    <!-- ADMIN LOGIN MODAL -->
    <div id="loginModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <div class="hud-panel border border-cyan-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <button onclick="closeLoginModal()" class="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">✕</button>
        <span class="font-mono-tech text-[10px] uppercase tracking-widest text-cyan-400">AUTH // ACCESS CONTROL</span>
        <h2 class="font-display font-bold text-2xl text-white mt-1">Walloraa Admin Studio</h2>
        <p class="text-xs text-slate-400 mt-1 mb-6">Sign in to upload or manage 4K wallpapers.</p>

        <form onsubmit="handleAdminLogin(event)" class="space-y-4">
          <div>
            <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Admin Email</label>
            <input id="adminEmailInput" type="email" required placeholder="admin@walloraa.com" class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Password</label>
            <input id="adminPasswordInput" type="password" required placeholder="••••••••" class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400" />
          </div>
          <p id="loginErrorMsg" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5"></p>
          <button id="loginSubmitBtn" type="submit" class="w-full btn-cyber py-3.5 rounded-xl font-bold text-sm text-white shadow-xl cursor-pointer">Initialize Studio Session</button>
        </form>
      </div>
    </div>

    <!-- BATCH UPLOAD + AUTO-WEBP STUDIO MODAL -->
    <div id="uploadModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div class="hud-panel border border-cyan-500/30 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl my-8">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span class="font-mono-tech text-[10px] uppercase tracking-widest text-cyan-400">BATCH + AUTO-WEBP + CLOUDFLARE R2</span>
            <h2 class="font-display font-bold text-xl sm:text-2xl text-white">Upload 4K Wallpapers</h2>
          </div>
          <button onclick="closeUploadModal()" class="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form id="uploadForm" onsubmit="handlePublishWallpaper(event)" class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
          <div class="md:col-span-7 space-y-4">
            <div onclick="document.getElementById('fileInput').click()" class="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-5 text-center cursor-pointer transition bg-cyan-500/[0.02] hover:bg-cyan-500/[0.06]">
              <input id="fileInput" type="file" multiple accept="image/jpeg,image/png,image/webp" class="hidden" onchange="handleFileSelect(event)" />
              <p class="text-sm font-semibold text-white">Select 1 or Multiple 4K Images</p>
              <p id="selectedFileName" class="font-mono-tech text-[11px] text-slate-400 mt-1">Auto-converts to 4K WebP + uploads to R2</p>
            </div>

            <div>
              <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Title (Blank = Auto-Name from File)</label>
              <input id="titleInput" type="text" placeholder="Optional batch title" oninput="updateLiveCardPreview()" class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Category</label>
                <select id="categoryInput" onchange="updateLiveCardPreview()" class="w-full bg-[#0c0e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400">
                  <option value="AMOLED Dark">AMOLED Dark</option>
                  <option value="Anime">Anime</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Nature">Nature</option>
                  <option value="Cars & Bikes">Cars & Bikes</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>
              <div>
                <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Resolution</label>
                <select id="resolutionInput" onchange="updateLiveCardPreview()" class="w-full bg-[#0c0e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400">
                  <option value="4K UHD">4K UHD (3840×2160)</option>
                  <option value="8K RAW">8K RAW (7680×4320)</option>
                  <option value="Mobile 4K">Mobile 4K (2160×3840)</option>
                  <option value="5K Retina">5K Retina</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-mono-tech text-[11px] uppercase text-slate-300 mb-1.5">Tags</label>
              <input id="tagsInput" type="text" placeholder="cyberpunk, neon, dark, amoled" class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400" />
            </div>

            <div class="space-y-2 pt-1">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input id="webpCompressInput" type="checkbox" checked class="w-4 h-4 rounded accent-cyan-400" />
                <span class="text-xs font-medium text-cyan-300">Auto-WebP Compression (~75% smaller, full 4K pixels)</span>
              </label>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input id="featuredInput" type="checkbox" class="w-4 h-4 rounded accent-fuchsia-500" />
                <span class="text-xs font-medium text-slate-300">Feature first image on Home Hero</span>
              </label>
            </div>
          </div>

          <div class="md:col-span-5 flex flex-col justify-between bg-white/[0.02] border border-white/10 rounded-2xl p-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono-tech text-[10px] uppercase text-slate-400">PREVIEW</span>
                <span id="batchCountBadge" class="hidden font-mono-tech px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300">0 files</span>
              </div>
              <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#080910]">
                <div class="relative aspect-[4/5] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img id="uploadPreviewImg" src="" alt="" class="hidden w-full h-full object-cover" />
                  <p id="uploadPlaceholder" class="text-xs text-slate-500 p-4 text-center">No image selected</p>
                  <span id="previewResBadge" class="font-mono-tech absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] bg-black/70 text-cyan-300 border border-cyan-500/30">4K UHD</span>
                </div>
                <div class="p-3">
                  <p id="previewTitleText" class="font-display font-bold text-sm text-white truncate">Auto-Named Artwork</p>
                  <p id="previewCatText" class="font-mono-tech text-[11px] text-cyan-400 mt-0.5">AMOLED Dark</p>
                </div>
              </div>
            </div>
            <button id="publishSubmitBtn" type="submit" class="w-full mt-4 btn-cyber py-3 rounded-xl font-bold text-sm text-white shadow-xl cursor-pointer">Deploy to R2 Cloud</button>
          </div>
        </form>
      </div>
    </div>

    <!-- TOAST -->
    <div id="toast" class="fixed bottom-6 right-6 z-50 translate-y-24 opacity-0 transition-all duration-300 hud-panel border border-cyan-400/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium">
      <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
      <span id="toastMessage">Ready</span>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', footerAndModalsHTML);
}

// Fetch Wallpapers + Session
async function loadWalloraaData() {
  const { data: { session } } = await sb.auth.getSession();
  updateAuthUI(session?.user || null);

  sb.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session?.user || null);
  });

  const { data, error } = await sb
    .from('wallpapers')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data && data.length > 0) {
    allWallpapers = data;
  } else {
    allWallpapers = [...STARTER_WALLPAPERS];
  }
  return allWallpapers;
}

function updateAuthUI(user) {
  currentUser = user;
  const controls = document.getElementById('adminControls');
  const loginBtn = document.getElementById('adminLoginBtn');
  if (!controls || !loginBtn) return;

  if (user) {
    controls.classList.remove('hidden');
    controls.classList.add('flex');
    loginBtn.classList.add('hidden');
  } else {
    controls.classList.add('hidden');
    controls.classList.remove('flex');
    loginBtn.classList.remove('hidden');
  }
}

// Card Template
function createWallpaperCardHTML(item) {
  const colors = Array.isArray(item.colors) ? item.colors : ['#00f0ff', '#a855f7', '#ec4899'];
  const isCloud = !String(item.id).startsWith('demo-');
  return `
    <article class="masonry-item group hud-card rounded-2xl overflow-hidden relative">
      <a href="wallpaper.html?id=${encodeURIComponent(item.id)}" class="block relative overflow-hidden">
        <img
          src="${item.image_url}"
          alt="${item.title}"
          loading="lazy"
          class="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#05060a] via-black/20 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span class="font-mono-tech px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            ${item.resolution || '4K UHD'}
          </span>
          ${currentUser && isCloud ? `
            <button
              onclick="event.preventDefault(); event.stopPropagation(); deleteWallpaper('${item.id}', '${item.image_url}')"
              title="Delete"
              class="w-8 h-8 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg cursor-pointer"
            >✕</button>
          ` : ''}
        </div>

        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
          <div class="min-w-0">
            <span class="font-mono-tech text-[10px] uppercase text-cyan-300">${item.category}</span>
            <h3 class="font-display font-bold text-base text-white truncate">${item.title}</h3>
          </div>
          <button
            onclick="event.preventDefault(); event.stopPropagation(); triggerDownload('${item.id}')"
            title="Quick Download"
            class="shrink-0 w-9 h-9 rounded-full btn-cyber text-white flex items-center justify-center shadow-lg cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </button>
        </div>
      </a>

      <div class="px-3.5 py-2.5 flex items-center justify-between border-t border-white/[0.06] bg-black/30">
        <div class="flex items-center gap-1.5">
          ${colors.map(c => `<span class="w-2.5 h-2.5 rounded-full border border-white/20" style="background:${c}"></span>`).join('')}
        </div>
        <span class="font-mono-tech text-[11px] text-slate-400">↓ ${(item.downloads || 0).toLocaleString()}</span>
      </div>
    </article>
  `;
}

// Download Helper
async function triggerDownload(id) {
  const item = allWallpapers.find(w => String(w.id) === String(id));
  if (!item) return;

  item.downloads = (item.downloads || 0) + 1;
  if (!String(item.id).startsWith('demo-')) {
    sb.rpc('increment_downloads', { row_id: item.id }).then(() => {});
  }

  showToast(`Downloading "${item.title}"...`);
  try {
    const res = await fetch(item.image_url);
    const blob = await res.blob();
    const ext = item.image_url.toLowerCase().includes('.webp') ? 'webp' : 'jpg';
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-walloraa-4k.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(item.image_url, '_blank');
  }
}

// Auth & Upload Studio Functions
function openLoginModal() {
  document.getElementById('loginErrorMsg').classList.add('hidden');
  document.getElementById('loginModal').classList.remove('hidden');
  document.getElementById('loginModal').classList.add('flex');
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('loginModal').classList.remove('flex');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmailInput').value.trim();
  const password = document.getElementById('adminPasswordInput').value;
  const btn = document.getElementById('loginSubmitBtn');
  const errBox = document.getElementById('loginErrorMsg');

  btn.disabled = true;
  btn.textContent = 'Authenticating...';
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false;
  btn.textContent = 'Initialize Studio Session';

  if (error) {
    errBox.textContent = error.message;
    errBox.classList.remove('hidden');
  } else {
    closeLoginModal();
    showToast('Studio session active');
    setTimeout(() => location.reload(), 500);
  }
}

async function handleAdminLogout() {
  await sb.auth.signOut();
  showToast('Signed out');
  setTimeout(() => location.reload(), 400);
}

function openUploadModal() {
  if (!currentUser) return openLoginModal();
  document.getElementById('uploadForm').reset();
  selectedFiles = [];
  document.getElementById('uploadPreviewImg').classList.add('hidden');
  document.getElementById('uploadPlaceholder').classList.remove('hidden');
  document.getElementById('batchCountBadge').classList.add('hidden');
  document.getElementById('uploadModal').classList.remove('hidden');
  document.getElementById('uploadModal').classList.add('flex');
}
function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
  document.getElementById('uploadModal').classList.remove('flex');
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  selectedFiles = files;
  const totalMB = (files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2);
  document.getElementById('selectedFileName').textContent = `${files.length} file(s) • ${totalMB} MB`;

  const badge = document.getElementById('batchCountBadge');
  badge.textContent = `${files.length} files`;
  badge.classList.toggle('hidden', files.length <= 1);

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('uploadPreviewImg');
    img.src = e.target.result;
    img.classList.remove('hidden');
    document.getElementById('uploadPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(files[0]);
  updateLiveCardPreview();
}

function formatTitleFromFileName(name) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim() || 'Walloraa 4K';
}

function updateLiveCardPreview() {
  const typed = document.getElementById('titleInput').value.trim();
  let title = typed || (selectedFiles[0] ? formatTitleFromFileName(selectedFiles[0].name) : 'Auto-Named Artwork');
  document.getElementById('previewTitleText').textContent = title;
  document.getElementById('previewCatText').textContent = document.getElementById('categoryInput').value;
  document.getElementById('previewResBadge').textContent = document.getElementById('resolutionInput').value;
}

// Extracts 3 dominant hex colors & converts to WebP
function processImageInBrowser(file, useWebP = true) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 30;
      sampleCanvas.height = 30;
      const sCtx = sampleCanvas.getContext('2d');
      sCtx.drawImage(img, 0, 0, 30, 30);
      const pts = [[5, 5], [15, 15], [25, 25]];
      const colors = pts.map(([x, y]) => {
        const [r, g, b] = sCtx.getImageData(x, y, 1, 1).data;
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
      });

      if (!useWebP || file.type === 'image/webp') {
        URL.revokeObjectURL(url);
        return resolve({ blob: file, ext: file.name.split('.').pop() || 'webp', contentType: file.type, colors });
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob && blob.size < file.size) {
          resolve({ blob, ext: 'webp', contentType: 'image/webp', colors });
        } else {
          resolve({ blob: file, ext: file.name.split('.').pop() || 'jpg', contentType: file.type, colors });
        }
      }, 'image/webp', 0.92);
    };
    img.src = url;
  });
}

// NEW: UPLOADS DIRECTLY TO CLOUDFLARE R2 + SAVES URL IN SUPABASE DB
async function handlePublishWallpaper(e) {
  e.preventDefault();
  if (!selectedFiles.length) return showToast('Select at least one image');

  const btn = document.getElementById('publishSubmitBtn');
  btn.disabled = true;

  const baseTitle = document.getElementById('titleInput').value.trim();
  const category = document.getElementById('categoryInput').value;
  const resolution = document.getElementById('resolutionInput').value;
  const isFeatured = document.getElementById('featuredInput').checked;
  const useWebP = document.getElementById('webpCompressInput').checked;
  const tagsRaw = document.getElementById('tagsInput').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [category.toLowerCase(), '4k', 'walloraa'];

  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      btn.textContent = `Uploading ${i + 1}/${selectedFiles.length} to R2...`;
      const processed = await processImageInBrowser(selectedFiles[i], useWebP);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${processed.ext}`;

      // 1. Get presigned upload URL from Vercel serverless function
      const presignRes = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: processed.contentType
        })
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get R2 upload URL');
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Upload processed WebP/image directly to Cloudflare R2
      const r2Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': processed.contentType },
        body: processed.blob
      });

      if (!r2Res.ok) {
        throw new Error('Failed uploading image to Cloudflare R2');
      }

      // 3. Save R2 URL and metadata into Supabase Database
      const itemTitle = baseTitle
        ? (selectedFiles.length > 1 ? `${baseTitle} #${i + 1}` : baseTitle)
        : formatTitleFromFileName(selectedFiles[i].name);

      const { error: dbErr } = await sb.from('wallpapers').insert([{
        title: itemTitle,
        category,
        resolution,
        image_url: publicUrl,
        tags,
        featured: isFeatured && i === 0,
        colors: processed.colors
      }]);

      if (dbErr) throw dbErr;
    }

    closeUploadModal();
    showToast(`${selectedFiles.length} wallpaper(s) deployed to R2!`);
    setTimeout(() => location.reload(), 600);
  } catch (err) {
    showToast(`Upload error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Deploy to R2 Cloud';
  }
}

// SMART DELETE: HANDLES BOTH NEW R2 & OLD 300+ SUPABASE STORAGE FILES
async function deleteWallpaper(id, imageUrl) {
  if (!currentUser) return;
  showToast('Deleting...');

  const { error } = await sb.from('wallpapers').delete().eq('id', id);
  if (error) return showToast(error.message);

  if (imageUrl) {
    if (imageUrl.includes('r2.dev') || imageUrl.includes('cdn.walloraa')) {
      await fetch('/api/delete-r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      }).catch(() => {});
    } else if (imageUrl.includes('supabase.co') && imageUrl.includes('/wallpapers/')) {
      const filePath = imageUrl.split('/wallpapers/').pop();
      if (filePath) await sb.storage.from('wallpapers').remove([filePath]);
    }
  }

  showToast('Removed from cloud');
  setTimeout(() => location.reload(), 500);
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.remove('translate-y-24', 'opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3500);
}
