// Simple Express server to serve static files and proxy Steam API
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const STEAM_API_KEY = process.env.STEAM_API_KEY || '';

// Static files (serve project root)
app.use(express.static(__dirname, { extensions: ['html'] }));

// Proxy: GET /api/steam/owned?steamId=... [&key=...] => Steam API GetOwnedGames
app.get('/api/steam/owned', async (req, res) => {
  try{
    const steamId = String(req.query.steamId || '').trim();
    const key = String(req.query.key || '').trim() || STEAM_API_KEY;
    if(!steamId) return res.status(400).json({ error: 'Missing steamId' });
    if(!key) return res.status(400).json({ error: 'Missing STEAM_API_KEY (env or ?key=...)' });

    const base = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/';
    const params = new URLSearchParams({
      key,
      steamid: steamId,
      include_appinfo: '1',
      include_played_free_games: '1',
      format: 'json'
    });
    const url = `${base}?${params.toString()}`;
    const apiRes = await fetch(url);
    if(!apiRes.ok){
      const text = await apiRes.text();
      return res.status(502).json({ error: 'Steam API error', status: apiRes.status, body: text });
    }
    const data = await apiRes.json();
    res.json(data);
  }catch(err){
    res.status(500).json({ error: 'Proxy error', detail: String(err && err.message || err) });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Glibrary server running at http://localhost:${PORT}`);
});


