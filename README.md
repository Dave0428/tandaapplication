# TANDA

Games and simple phone guides for Filipino seniors. Tagalog and English, every
guide read aloud, and an AI helper that answers in plain words.

---

> **Bago ang lahat: basahin ang `SIMULAN-DITO.md`.** Doon nakasulat nang
> hakbang-hakbang, sa Taglish, kung paano ito buksan at patakbuhin sa VS Code
> nang halos walang ita-type.

## Run it on your computer

You need [Node.js 18 or newer](https://nodejs.org). Check with `node -v`.

```bash
# 1. install the server's libraries
cd server
npm install

# 2. make your settings file
cp .env.example .env
# open .env and put a long random string in JWT_SECRET

# 3. start
npm start
```

Open <http://localhost:3000>. The database file `server/tanda.db` is created
the first time you run it.

**Just want to look at the app?** Open `public/index.html` directly in Chrome.
Everything works except accounts and the AI helper, both of which need the server.

---

## What is where

```
tanda/
├── public/                 the app itself — this is what runs on the phone
│   ├── index.html          loads every file below, in order
│   ├── css/styles.css      all styling and the light/dark colours
│   ├── js/
│   │   ├── api.js          talks to your server (login, progress)
│   │   ├── state.js        the saved data and the streak counter
│   │   ├── i18n.js         every English and Tagalog interface word
│   │   ├── tutorials.js    all 23 guides ← edit here to add a guide
│   │   ├── voice.js        read-aloud, voice picking, failure detection
│   │   ├── ai.js           picks the AI engine (Claude artifact, or your server)
│   │   ├── ai-glue.js      the instructions given to the AI
│   │   ├── ui.js           every screen
│   │   ├── games.js        the five games
│   │   ├── events.js       what happens when something is tapped
│   │   └── boot.js         starts everything
│   ├── manifest.json       makes it installable on a phone home screen
│   └── sw.js               offline caching ← bump CACHE when you ship
├── server/
│   ├── server.js           routes and static files
│   ├── db.js               database connection + migration runner
│   ├── migrations/         .sql files, run in order, never edited once shipped
│   └── routes/             auth.js, progress.js, ai.js
├── SIMULAN-DITO.md         basahin ito muna (Taglish)
├── public/admin.html       admin dashboard — edit/monitor users, export CSV
├── tanda.code-workspace    i-double click ito para buksan sa VS Code
├── .vscode/                mga ready na task: Terminal → Run Task
├── capacitor.config.json   settings for the Android/iOS wrapper
├── package.json            Capacitor commands: npm run android:apk
├── .github/workflows/      builds the APK for you on GitHub, no Android Studio
├── tools/build-single.js   makes one self-contained dist/tanda.html
└── docs/                   DATABASE.md, UPDATING.md, DEPLOY.md
```

There is no build step and no framework. Edit a file, refresh the browser.
That is deliberate: you can read every line of this app.

---

## Opening it in VS Code

`File → Open Folder…` and choose the `tanda` folder. Two extensions worth having:

- **Live Server** — right-click `public/index.html` → "Open with Live Server" to
  see frontend changes instantly without restarting Node.
- **SQLite Viewer** — click `server/tanda.db` to browse your users and progress.

---

## The API

| Method | Path                 | What it does                          | Needs login |
|--------|----------------------|---------------------------------------|-------------|
| GET    | `/api/health`        | is the server up, is AI configured    | no          |
| GET    | `/api/admin/stats`   | dashboard: totals, per-guide, per-game, all users | admin only |
| GET    | `/api/admin/user/:id`| one person's full history             | admin only  |
| PATCH  | `/api/admin/user/:id`| edit a person's name, lang, or role   | admin only  |
| DELETE | `/api/admin/user/:id`| remove a person and all their data    | admin only  |
| POST   | `/api/auth/register` | make an account                       | no          |
| POST   | `/api/auth/login`    | get a token                           | no          |
| GET    | `/api/progress`      | this person's guides, streak, settings| yes         |
| PUT    | `/api/progress`      | save progress (merges, never replaces)| yes         |
| POST   | `/api/games`         | record one finished game              | yes         |
| POST   | `/api/ask`           | ask the AI helper                     | no          |

Try it without the app:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Lola Rosa","email":"rosa@example.com","password":"tandapassword"}'
```

You get back a token. Use it on the routes that need login:

```bash
curl http://localhost:3000/api/progress -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

---

## How progress syncing works

The phone never waits for the server. It saves to the browser's own storage
first and draws the screen from that. Then:

1. `save()` fires on any change and asks `api.js` to sync.
2. `api.js` waits 2 seconds for the tapping to stop, then sends one request.
3. On sign-in, the server's copy is **merged** with the phone's copy — a guide
   marked done in either place stays done, and the higher streak wins.

This is why a lost signal never loses a lola's progress, and why the same
account works on her phone and her daughter's.

---

## The AI helper

`public/js/ai.js` looks for two possible engines:

1. The Claude **artifact capability**, which only exists when the page is
   published on claude.ai. The viewer's own Claude account pays.
2. **Your server**, `POST /api/ask`, which holds your Anthropic API key.

If neither exists, the AI buttons hide themselves and everything else keeps
working. To turn on option 2, put your key in `server/.env` as
`ANTHROPIC_API_KEY` and restart. Get one at <https://console.anthropic.com>.

**Never put that key in the `public/` folder.** Anything in `public/` is
downloaded to the phone and can be read by anyone.

---

## Read next

- `docs/DATABASE.md` — SQLite now, Postgres when you grow, and how to think about the schema
- `docs/UPDATING.md` — how to patch a running app without breaking anyone's data
- `docs/GOLIVE.md` — pinakamadaling paraan para totoong website siya, libre (Taglish)
- `docs/DEPLOY.md` — putting it online, in more depth
- `docs/ICONS.md` — saan galing ang mga icon, at paano palitan ng sarili mong logo (Taglish)
- `docs/EDITING.md` — saan i-e-edit kapag may pinabago ang prof (Taglish)
- `docs/APK.md` — paano gumawa ng APK para sa Android (Taglish)
- `docs/IOS.md` — paano tumakbo sa iPhone: bakit iba ito sa Android, at ang libreng paraan (Taglish)
- `docs/PLAYSTORE.md` — gawing installable Android app at ilagay sa Play Store (Taglish)
