# Putting TANDA online

## Before anything else

1. Set a real `JWT_SECRET` in `.env`. Generate one:
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   Every token ever issued becomes invalid if you later change it, so pick it once.
2. Confirm `.env` and `*.db` are in `.gitignore`. They are. Keep it that way —
   a leaked API key in a public repository is found by bots within minutes.
3. In `server.js`, replace `app.use(cors())` with your real domain once you have one:
   `app.use(cors({ origin: 'https://tanda.ph' }))`.

---

## Hosting the server

Any host that runs Node works. Two straightforward options:

**Render** (free tier, easiest) — push to GitHub, then New → Web Service, point
it at your repository. Root directory `server`, build command `npm install`,
start command `npm start`. Add `JWT_SECRET` and `ANTHROPIC_API_KEY` under
Environment.

**A VPS** (~$5/month, full control) — DigitalOcean, Hetzner, or a local
provider. Install Node, clone the repository, and run it under a process
manager so it restarts after a crash or reboot:

```bash
npm install -g pm2
cd tanda/server
pm2 start server.js --name tanda
pm2 save && pm2 startup
```

Put Nginx or Caddy in front for HTTPS. Caddy does the certificate for free with
a two-line config.

**Remember the SQLite warning.** Render and similar platforms erase the disk on
each deploy, which deletes `tanda.db` and everyone's account with it. On those,
switch to Postgres first — see `DATABASE.md`. A VPS has a real disk, so SQLite
is fine there.

---

## Making it feel like an installed app

TANDA is already a PWA. On Android, Chrome offers "Add to Home screen" and it
then opens full screen with no browser bar. That is enough for most families
and costs nothing.

You need two icon files in `public/`: `icon-192.png` and `icon-512.png`.
They are listed in `manifest.json` but not included here — make them from your
own logo.

## Getting into the Play Store

If you want a real Play Store listing, wrap the same code with
[Capacitor](https://capacitorjs.com). You do not rewrite anything.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init TANDA ph.tanda.app --web-dir=public
npx cap add android
npx cap sync
npx cap open android      # opens Android Studio, build the release from there
```

Two real benefits for this app specifically:

- **The voice becomes reliable.** Inside a Capacitor app you can use the
  `@capacitor-community/text-to-speech` plugin, which talks to Android's TTS
  engine directly instead of going through the browser. That is the permanent
  fix for the problem you hit.
- Updates to the web files can ship without a Play Store review, using
  Capacitor's live-update options.

You will need a Google Play developer account (a one-time $25) and a privacy
policy URL, since the app collects an email address.

---

## Costs, honestly

| Item | Cost |
|---|---|
| Render free tier | ₱0 (sleeps when idle, slow first load) |
| Small VPS | ~₱300/month |
| Neon/Supabase Postgres free tier | ₱0 |
| Domain name | ~₱600/year |
| Anthropic API | pay per use — a Haiku answer is a fraction of a centavo |
| Play Store developer account | one-time $25 |

You can run this for families and barangay groups at no cost at all. Set a
spending limit in the Anthropic console before you let strangers use the AI
helper.

---

## The one security thing to get right

Your `ANTHROPIC_API_KEY` lives on the server and never anywhere else. The phone
calls `/api/ask`, the server calls Anthropic. If you ever find yourself putting
the key in a file under `public/`, stop — everything in that folder is
downloaded to every phone and readable by anyone who opens it.
