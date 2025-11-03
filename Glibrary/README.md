## Glibrary

Personal, responsive game library (HTML/CSS/JS) with optional Steam import and localStorage persistence.

### Features
- **Responsive UI**: CSS Grid/Flex; mobile → desktop.
- **Dark neon theme**: Glow accents, smooth hovers/focus.
- **Game cards**: Cover, title, genre, status, platform, rating, note.
- **Search & filters**: By text, genre, status, platform.
- **Add game**: Simple form, stored in `localStorage`.
- **Delete game**: Remove any game from your library.
- **Steam import (optional)**: Pull owned games via a tiny Node proxy.

### Tech stack
- Frontend: HTML, CSS, JavaScript (no frameworks)
- Storage: `localStorage`
- Backend (optional): Node.js + Express proxy for Steam API

### Project structure
```text
/
├─ index.html       # Home (search, filters, grid)
├─ add.html         # Add new game form
├─ about.html       # About page
├─ css/
│  └─ styles.css    # Theme, layout, components
├─ js/
│  └─ main.js       # Storage, rendering, filters, Steam import
├─ images/          # (optional) local covers
├─ server.js        # Express static + /api/steam/owned proxy
└─ package.json
```

### Quick start (frontend only)
You can open `index.html` directly in a browser. The app works fully offline (localStorage), minus Steam import.

### Recommended: run with backend (enables Steam import)
Requires Node 18+.

```bash
# From the project root
npm install

# Option A: set Steam key as env var (recommended)
set STEAM_API_KEY=YOUR_STEAM_KEY   # Windows cmd
# $Env:STEAM_API_KEY="YOUR_STEAM_KEY"   # PowerShell
# export STEAM_API_KEY=YOUR_STEAM_KEY    # macOS/Linux

npm start
# Open http://localhost:5173
```

If you do not set the env var, you can paste the key in the Import modal; it will be sent to the backend via query param for that call only.

### Steam import instructions
1. Ensure Steam privacy → Profile → Edit Profile → Privacy Settings → set **Game details: Public**.
2. Get a Steam Web API key at `https://steamcommunity.com/dev/apikey`.
3. Find your SteamID64 at `https://steamid.io/lookup`.
4. Start the server (`npm start`) and open `http://localhost:5173`.
5. Click “Import from Steam”, enter your key and SteamID64, then Fetch & Import.

Troubleshooting:
- If import fails, open `http://localhost:5173/api/steam/owned?steamId=YOUR_ID` (or add `&key=YOUR_KEY` if no env var). The JSON error details will help diagnose.
- Common blockers: private game details, wrong SteamID64 (must be 17 digits), invalid key.

### Adding games manually
1. Open the site and click “Add Game”.
2. Fill Title, Genre, Status, Platform, optional Rating/Note, and an Image URL.
   - You can paste a Steam store page URL; the app auto-converts it to a cover.
   - If an image fails, a placeholder is shown.

### Keyboard and accessibility notes
- Logical heading order, focus outlines, large hit targets.
- Filters and search are labeled; dynamically rendered grid uses `aria-live` for updates.

### Customization
- Colors and radii are defined in `:root` CSS vars in `css/styles.css`.
- Change grid breakpoints by editing `.game-grid` media queries.
- Dropdown option colors (opened list) are set to red/white via `select option` rules.

### Deploy
- Static hosting works for frontend-only. For Steam import, deploy the Node server as well.
- Any Node host will work (Render, Railway, Fly.io, VPS, etc.). Set `STEAM_API_KEY` in the environment.

### Screenshots / GIFs
Add assets to the `images/` folder and reference them here.

Home (filters + grid):

![Home](images/screenshot-home.png)

Add Game form:

![Add](images/screenshot-add.png)

Steam import modal (optional):

![Steam Import](images/screenshot-steam.png)

Optional short tour (GIF):

![Demo](images/demo.gif)

Tips to capture:
- Use 1440×900 or 1280×720 for consistent sizing.
- For GIFs, try ScreenToGif (Windows) or gifski.

### Known issues
- If Steam “Game details” are private, import returns an empty list.
- Some Steam apps do not have a `library_600x900_2x.jpg`; the app falls back to a placeholder.
- Native `<select>` styling varies by OS/browser; option colors are forced red/white, but some UAs may partially ignore it.
- Opening the site via `file://` won’t allow Steam imports; use `npm start` so the backend proxy is available.

### License
MIT


