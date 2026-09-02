# Shipping a patch

This is the part you asked about: how to change a running app that people are
already using, without losing their data or leaving them on a stale version.

---

## First, put it in git

Do this before anything else. Git is the difference between "I broke it and I
can undo that" and "I broke it".

```bash
cd tanda
git init
git add .
git commit -m "TANDA v1.0.0"
```

Make a free repository on GitHub and push it. Now every change is recoverable
and you can work from two computers.

Work on a branch, not on `main`:

```bash
git checkout -b add-gcash-guide
# ... edit files ...
git add .
git commit -m "Add GCash guide with Tagalog steps"
git checkout main
git merge add-gcash-guide
```

---

## The three kinds of update

### 1. Content only — a new guide, fixed wording, a new game

This is most of your updates, and it is the easy case. Nothing in the database
changes.

To add a guide, open `public/js/tutorials.js` and copy an existing block:

```js
{id:'gcash-send', cat:'phone', icon:'💸',
 title:['Send money on GCash','Magpadala ng pera sa GCash'],
 sub:['Step by step','Hakbang-hakbang'],
 steps:[
  ['Open the GCash app.','Buksan ang GCash app.'],
  ['Tap "Send Money".','Pindutin ang "Send Money".']
 ],
 tip:['Check the number twice before you send.','Tingnan ng dalawang beses ang numero bago magpadala.']},
```

Rules: `id` must be unique and never reused; every text is a pair
`[English, Tagalog]`; `cat` is one of `phone`, `fb`, `msg`, `safe`.

Then bump the cache so phones actually get it — see "The stale phone problem".

### 2. Schema change — the app needs to store something new

**Never edit a migration that has already run.** Files in `server/migrations/`
are history. Add a new numbered file instead:

```sql
-- server/migrations/003_add_reminders.sql
CREATE TABLE IF NOT EXISTS reminders (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label   TEXT NOT NULL,
  hour    INTEGER NOT NULL,
  minute  INTEGER NOT NULL
);
```

Then `npm run migrate`, or just restart the server — `server.js` runs pending
migrations on every boot. The `migrations` table records what has been applied,
so the file runs exactly once no matter how many times you restart.

Adding a column to an existing table follows the same shape:

```sql
-- server/migrations/004_add_phone_number.sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

**Always add, avoid removing.** `ALTER TABLE ... DROP COLUMN` while an old
version of the app is still running in someone's browser will crash it. The
safe order is: add the new column → ship the code that writes it → wait →
only then remove the old one, in a later release.

**Practise on a copy first:**

```bash
cp server/tanda.db server/test.db
SQLITE_PATH=./test.db npm run migrate
```

### 3. Server logic — new route, changed rule

Change the code, restart. The one thing to watch: phones may be running
yesterday's frontend for days. Never change what an existing endpoint
*returns* in a way that breaks the old app. Add a new field instead of
renaming one, or add `/api/v2/progress` and keep the old route alive.

---

## The stale phone problem

`public/sw.js` caches the whole app so it opens with no internet. That is also
why a phone can keep showing the old version after you deploy.

**Every time you change anything in `public/`, edit one line:**

```js
var CACHE = 'tanda-v2';   // was tanda-v1
```

That string is the whole update mechanism. When it changes, the service worker
downloads the new files, deletes the old cache, and the next time the app is
opened the person is on the new version.

Forgetting this is the single most common "but I fixed that already" bug.

---

## Release checklist

```
[ ] Tested with the server off (does it still open and read guides aloud?)
[ ] Tested with a fresh account and an existing one
[ ] New migration file added, if the schema changed
[ ] Ran the migration against a copy of the real database
[ ] Bumped CACHE in public/sw.js
[ ] Bumped "version" in server/package.json
[ ] git commit and git tag, e.g. git tag v1.1.0
[ ] Backed up the database before deploying
```

Version numbers, by convention: `1.1.0` adds a feature, `1.0.1` fixes a bug,
`2.0.0` breaks something old on purpose.

---

## When a release goes wrong

```bash
git log --oneline          # find the last good commit
git revert HEAD            # undo the newest commit, keeping the history
git push
```

Redeploy. If the bad release included a migration, remember that reverting the
*code* does not undo a *schema change* — that is why migrations should only add
things. An extra unused table hurts nobody; a dropped column loses data forever.
