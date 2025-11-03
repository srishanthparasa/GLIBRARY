(function(){
  const STORAGE_KEY = 'glibrary_games_v1';
  const STEAM_CFG_KEY = 'glibrary_steam_cfg_v1';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function nowYear(){ return new Date().getFullYear(); }
  function uid(){ return Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4); }

  function getGames(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }catch{ return []; }
  }

  function saveGames(games){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }

  function getSteamCfg(){
    try{
      const raw = localStorage.getItem(STEAM_CFG_KEY);
      if(!raw) return { apiKey:'', steamId:'' };
      const parsed = JSON.parse(raw);
      return { apiKey: parsed.apiKey||'', steamId: parsed.steamId||'' };
    }catch{ return { apiKey:'', steamId:'' }; }
  }
  function saveSteamCfg(cfg){
    localStorage.setItem(STEAM_CFG_KEY, JSON.stringify(cfg));
  }

  function ensureSeed(){
    const existing = getGames();
    if(existing && existing.length) return;
    const seed = [
      {
        id: uid(),
        title: 'Elden Ring',
        genre: 'RPG, Soulslike',
        status: 'Completed',
        platform: 'Steam',
        rating: 9.7,
        note: 'An unforgettable open-world adventure with challenging bosses.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'
      },
      {
        id: uid(),
        title: 'Hades',
        genre: 'Roguelike, Action',
        status: 'Completed',
        platform: 'Steam',
        rating: 9.2,
        note: 'Fast action, great narrative, top-tier soundtrack.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2gvu.jpg'
      },
      {
        id: uid(),
        title: 'Hollow Knight',
        genre: 'Metroidvania, Action',
        status: 'Playing',
        platform: 'Steam',
        rating: 9.0,
        note: 'Beautiful, haunting world. Tight combat and exploration.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg'
      },
      {
        id: uid(),
        title: 'Baldur\'s Gate 3',
        genre: 'RPG, Tactical',
        status: 'Wishlist',
        platform: 'Steam',
        rating: null,
        note: 'Can\'t wait to dive into the full campaign co-op.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6b3z.jpg'
      },
      {
        id: uid(),
        title: 'Cyberpunk 2077',
        genre: 'Action, RPG',
        status: 'Completed',
        platform: 'GOG',
        rating: 8.8,
        note: 'Post-2.0 update is excellent. Loved Phantom Liberty.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5xvn.jpg'
      },
      {
        id: uid(),
        title: 'DOOM Eternal',
        genre: 'FPS, Action',
        status: 'Playing',
        platform: 'Steam',
        rating: 8.9,
        note: 'Relentless combat loop, feels amazing on PC.',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7k.jpg'
      }
    ];
    saveGames(seed);
  }

  function collectFilters(){
    const search = ($('#searchInput')?.value || '').trim().toLowerCase();
    const genre = $('#genreFilter')?.value || '';
    const status = $('#statusFilter')?.value || '';
    const platform = $('#platformFilter')?.value || '';
    return { search, genre, status, platform };
  }

  function uniqueSorted(values){
    return Array.from(new Set(values.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  }

  function populateDynamicFilterOptions(games){
    const genres = uniqueSorted(games.flatMap(g => (g.genre||'').split(',').map(x=>x.trim()).filter(Boolean)));
    const platforms = uniqueSorted(games.map(g => g.platform).filter(Boolean));

    const genreSel = $('#genreFilter');
    const platformSel = $('#platformFilter');
    if(genreSel && genreSel.options.length <= 1){
      genres.forEach(g => { const o = document.createElement('option'); o.value = g; o.textContent = g; genreSel.appendChild(o); });
    }
    if(platformSel && platformSel.options.length <= 1){
      platforms.forEach(p => { const o = document.createElement('option'); o.value = p; o.textContent = p; platformSel.appendChild(o); });
    }
  }

  function gameCard(game){
    const rating = (game.rating || game.rating === 0) ? `Rating: ${Number(game.rating).toFixed(1)}` : '';
    const note = game.note ? `<p class="note">${escapeHtml(game.note)}</p>` : '';
    const imgSrc = resolveImageUrl(game);
    return `
      <article class="card game-card" data-id="${game.id}">
        <div class="card-actions"><button class="icon-btn delete-btn" data-id="${game.id}" title="Delete" aria-label="Delete">🗑</button></div>
        <div class="game-cover">
          <img loading="lazy" alt="${escapeHtml(game.title)} cover" src="${escapeAttr(imgSrc)}" onerror="this.onerror=null;this.src='${escapeAttr(placeholderFor(game.title))}'">
        </div>
        <div class="game-body">
          <h3 class="game-title">${escapeHtml(game.title)}</h3>
          <div class="badges">
            ${badge(game.genre)}
            <span class="badge accent">${escapeHtml(game.status)}</span>
            <span class="badge">${escapeHtml(game.platform)}</span>
            ${rating ? `<span class="badge">${rating}</span>` : ''}
          </div>
          ${note}
        </div>
      </article>
    `;
  }

  function badge(text){
    if(!text) return '';
    return `<span class="badge">${escapeHtml(text)}</span>`;
  }

  function placeholderFor(title){
    const t = encodeURIComponent(title||'Game');
    return `https://placehold.co/600x338/0a0f14/94a3b8?text=${t}`;
  }

  function resolveImageUrl(game){
    const raw = (game.image || '').trim();
    if(!raw) return placeholderFor(game.title);
    // If user pasted a Steam store page URL, convert to known cover URL
    try{
      const u = new URL(raw);
      const host = u.hostname.toLowerCase();
      if(host.includes('store.steampowered.com')){
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('app');
        const appid = idx >= 0 ? parts[idx+1] : '';
        if(appid && /^\d+$/.test(appid)){
          return steamCoverUrl(appid);
        }
      }
    }catch{}
    return raw;
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
  }
  function escapeAttr(str){
    return String(str).replace(/"/g,'&quot;');
  }

  function filterGames(games, {search, genre, status, platform}){
    return games.filter(g => {
      if(search){
        const hay = `${g.title} ${g.genre} ${g.status} ${g.platform} ${g.note||''}`.toLowerCase();
        if(!hay.includes(search)) return false;
      }
      if(genre){
        const gs = (g.genre||'').toLowerCase();
        if(!gs.split(',').map(x=>x.trim()).some(x=>x===genre.toLowerCase())) return false;
      }
      if(status && g.status !== status) return false;
      if(platform && g.platform !== platform) return false;
      return true;
    });
  }

  function renderGrid(){
    const mount = $('#gameGrid');
    if(!mount) return;
    const games = getGames();
    populateDynamicFilterOptions(games);
    const filters = collectFilters();
    const visible = filterGames(games, filters);
    mount.innerHTML = visible.map(gameCard).join('');
  }

  function onControlsChange(){ renderGrid(); }

  function wireControls(){
    ['#searchInput','#genreFilter','#statusFilter','#platformFilter']
      .forEach(sel => {
        const el = $(sel);
        if(!el) return;
        const evt = sel === '#searchInput' ? 'input' : 'change';
        el.addEventListener(evt, onControlsChange);
      });
    const grid = $('#gameGrid');
    if(grid){
      grid.addEventListener('click', (e)=>{
        const btn = e.target.closest('.delete-btn');
        if(!btn) return;
        const id = btn.getAttribute('data-id');
        if(!id) return;
        if(!confirm('Delete this game from your library?')) return;
        const games = getGames().filter(g => g.id !== id);
        saveGames(games);
        renderGrid();
      });
    }
  }

  function handleAddForm(){
    const form = $('#addGameForm');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = $('#title').value.trim();
      const genre = $('#genre').value.trim();
      const status = $('#status').value;
      const platform = $('#platform').value.trim();
      const ratingRaw = $('#rating').value;
      const note = $('#note').value.trim();
      const image = $('#image').value.trim();

      if(!title || !genre || !status || !platform){
        alert('Please fill Title, Genre, Status, and Platform.');
        return;
      }

      const rating = ratingRaw === '' ? null : Number(ratingRaw);
      const newGame = { id: uid(), title, genre, status, platform, rating, note, image };
      const games = getGames();
      games.unshift(newGame);
      saveGames(games);
      window.location.href = './';
    });
  }

  // Steam Import
  function wireSteamModal(){
    const openBtn = $('#openSteamImport');
    const modal = $('#steamModal');
    const closeBtn = $('#closeSteamModal');
    const saveBtn = $('#saveSteamCfg');
    const runBtn = $('#runSteamImport');
    const apiKeyInput = $('#steamApiKey');
    const steamIdInput = $('#steamId64');
    const errBox = $('#steamError');
    if(!openBtn || !modal) return;

    function open(){
      const cfg = getSteamCfg();
      if(apiKeyInput) apiKeyInput.value = cfg.apiKey;
      if(steamIdInput) steamIdInput.value = cfg.steamId;
      errBox?.classList.add('hidden');
      modal.classList.remove('hidden');
    }
    function close(){ modal.classList.add('hidden'); }

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });

    saveBtn?.addEventListener('click', ()=>{
      const apiKey = apiKeyInput?.value.trim() || '';
      const steamId = steamIdInput?.value.trim() || '';
      saveSteamCfg({ apiKey, steamId });
      errBox.textContent = 'Saved locally.';
      errBox.classList.remove('hidden');
    });

    runBtn?.addEventListener('click', async ()=>{
      const apiKey = apiKeyInput?.value.trim();
      const steamId = steamIdInput?.value.trim();
      if(!apiKey || !steamId){
        errBox.textContent = 'Enter your Steam API key and SteamID64.';
        errBox.classList.remove('hidden');
        return;
      }
      saveSteamCfg({ apiKey, steamId });
      errBox.textContent = 'Fetching your Steam library...';
      errBox.classList.remove('hidden');
      try{
        const imported = await fetchSteamOwnedGames({ apiKey, steamId });
        if(!imported.length){
          errBox.textContent = 'No games returned. Ensure your profile/game details are public.';
          return;
        }
        const games = getGames();
        // Avoid duplicates by title + platform Steam
        const existingKeys = new Set(games.map(g=>`${g.title}__${g.platform}`));
        let added = 0;
        imported.forEach(g=>{
          const key = `${g.title}__${g.platform}`;
          if(existingKeys.has(key)) return;
          games.push(g);
          existingKeys.add(key);
          added++;
        });
        saveGames(games);
        renderGrid();
        errBox.textContent = `Imported ${added} game(s).`;
      }catch(err){
        errBox.textContent = String(err.message || err);
      }
    });
  }

  async function fetchSteamOwnedGames({ apiKey, steamId }){
    const qs = new URLSearchParams({ steamId });
    if(apiKey) qs.set('key', apiKey);
    const url = `/api/steam/owned?${qs.toString()}`;
    const res = await fetch(url);
    if(!res.ok){
      let detail = '';
      try{ const j = await res.json(); detail = j.error || JSON.stringify(j); }catch{ detail = await res.text(); }
      throw new Error(`Steam API error: ${res.status} ${detail}`);
    }
    const data = await res.json();
    const games = data?.response?.games || [];
    // Map to our model; we default genre unknown, platform Steam, status Wishlist.
    return games.map(item => ({
      id: uid(),
      title: item.name || `App ${item.appid}`,
      genre: '',
      status: 'Wishlist',
      platform: 'Steam',
      rating: null,
      note: '',
      image: steamCoverUrl(item.appid)
    }));
  }

  function steamCoverUrl(appid){
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;
  }

  function setYear(){ const y = $('#year'); if(y) y.textContent = nowYear(); }

  function init(){
    ensureSeed();
    setYear();
    wireControls();
    renderGrid();
    handleAddForm();
    wireSteamModal();
  }

  document.addEventListener('DOMContentLoaded', init);
})();


