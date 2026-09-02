# Saan ko ba i-e-edit ito?

Cheat sheet para kapag may pinabago ang prof mo. Walang compiled o minified na
bahagi ang TANDA — plain text lahat. Buksan sa VS Code, palitan, i-save,
i-refresh ang browser. Wala kang hihintaying mag-build.

**Bago lahat:** `git commit` muna bago magbago ng malaki. Para kapag mas maganda
pala ang luma, `git checkout .` lang at bumalik ang dati.

---

## Mabilisang talahanayan

| Sasabihin ng prof | Buksan mo |
|---|---|
| "Dagdagan mo ng gabay" | `public/js/tutorials.js` |
| "Palitan mo ang kulay / itsura" | `public/css/styles.css` |
| "Mali ang salin sa Tagalog" | `public/js/tutorials.js` o `public/js/i18n.js` |
| "Dagdagan mo ng laro" | `public/js/games.js` + `public/js/events.js` |
| "Palitan ang pangalan ng app" | `public/index.html`, `public/manifest.json`, `capacitor.config.json` |
| "Dagdagan ang itatanong sa registration" | `server/migrations/003_....sql` + `server/routes/auth.js` |
| "Palitan ang sinasabi ng AI" | `public/js/ai-glue.js` |
| "Ilagay mo ang logo namin" | `public/icon-192.png`, `public/icon-512.png` |
| "Ipakita mo ang datos ng mga user" | bagong route sa `server/routes/` |

---

## 1. Bagong gabay

Buksan ang `public/js/tutorials.js`. Kopyahin ang alinmang block, palitan ang laman:

```js
{id:'gcash-send', cat:'phone', icon:'💸',
 title:['Send money on GCash','Magpadala ng pera sa GCash'],
 sub:['Step by step','Hakbang-hakbang'],
 steps:[
  ['Open the GCash app.','Buksan ang GCash app.'],
  ['Tap "Send Money".','Pindutin ang "Send Money".'],
  ['Type the number of the receiver.','I-type ang numero ng padadalhan.']
 ],
 tip:['Check the number twice.','Tingnan ng dalawang beses ang numero.']},
```

Tandaan:
- Laging **pares** ang teksto: `[Ingles, Tagalog]`
- Ang `id` ay hindi dapat maulit at hindi na dapat palitan (dito nakakabit ang
  progreso ng mga user)
- Ang `cat` ay isa sa: `phone`, `fb`, `msg`, `safe`
- Kusa nang gagana ang boses at ang AI sa bagong gabay — walang idadagdag

**Bagong kategorya?** Sa itaas ng parehong file, dagdagan ang `CATS`, tapos
lagyan ng katumbas na salita sa `i18n.js`.

---

## 2. Kulay at itsura

Nasa itaas ng `public/css/styles.css`, nasa `:root`:

```css
--bg:#FBF3E6;         /* background */
--marigold:#E8A33D;   /* dilaw na accent */
--teal:#1D4B45;       /* madilim na berde, ang mga button */
--terracotta:#D9614F; /* pula, para sa babala */
```

Isang linya lang ang palitan at buong app ang magbabago. May sariling set ang
dark mode sa ibaba ng parehong file.

**Laki ng letra:** hanapin ang `font-size` sa `body`. Pero tandaan, may slider
na ang user sa "Ako" — huwag mong tanggalin iyon, accessibility feature iyon
para sa mga senior, at malamang itanong iyan ng panel mo.

---

## 3. Salita sa interface

`public/js/i18n.js`. Dalawang malaking listahan: `en` at `tl`. Magkatabi ang
bawat susi:

```js
en:{ listen:'Listen to all steps', ... }
tl:{ listen:'Pakinggan lahat ng hakbang', ... }
```

Kapag nagdagdag ka sa `en`, magdagdag ka rin sa `tl`. Kung makakalimutan mo,
Ingles ang lalabas — hindi mag-crash, pero pansinin agad ng prof mo.

---

## 4. Bagong tanong sa registration

Halimbawa, hinihingi ng prof na may **age** at **barangay**.

**Una, ang database.** Bagong file, `server/migrations/003_add_profile.sql`:

```sql
ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users ADD COLUMN barangay TEXT;
```

Huwag i-edit ang `001` o `002` — kasaysayan na iyon. Restart lang ang server at
kusang tatakbo ang bago.

**Pangalawa, ang server.** Sa `server/routes/auth.js`, sa `/register`:

```js
const age = Number(req.body.age) || null;
const barangay = String(req.body.barangay || '').slice(0, 60);
// idagdag sa INSERT
```

**Pangatlo, ang app.** Sa `public/js/ui.js`, hanapin ang `viewAccount()` at
dagdagan ng input. Tapos sa `public/js/events.js`, sa `authgo`, isama ito sa
ipinapadala.

Tatlong file — palaging ganito ang sunod-sunod kapag may bagong datos:
**database → server → app.**

---

## 5. Datos para sa thesis mo

Malamang itatanong ito ng panel: "Paano mo malalaman kung natututo sila?"

Nasa database mo na ang sagot. Buksan ang `server/tanda.db` gamit ang SQLite
Viewer extension sa VS Code, o patakbuhin ito:

```sql
-- ilang gabay ang natapos ng bawat tao
SELECT u.email, COUNT(t.tutorial_id) AS natapos
FROM users u LEFT JOIN tutorial_progress t ON t.user_id = u.id
GROUP BY u.id ORDER BY natapos DESC;

-- aling gabay ang pinakamadalas tapusin
SELECT tutorial_id, COUNT(*) AS bilang
FROM tutorial_progress GROUP BY tutorial_id ORDER BY bilang DESC;

-- score sa mga laro sa paglipas ng panahon
SELECT game, AVG(score) AS average, COUNT(*) AS laro
FROM game_results GROUP BY game;
```

Ito ang magiging **Results chapter** mo. Puwede mong i-export sa CSV mula sa
SQLite Viewer at ilagay sa Excel para gawing graph.

---

## Pagkatapos mag-edit

**Sa browser lang:** i-refresh. Kung luma pa rin, `Ctrl+Shift+R` (hard refresh),
o taasan ang `CACHE` sa `public/sw.js`.

**Para sa APK:** `npx cap sync android`, tapos build ulit. Kung GitHub Actions
ang gamit mo, `git push` lang at kusang gagawa ng bagong APK.

**Kung may nasira:**

```bash
git status            # ano ang nabago
git checkout .        # ibalik lahat sa huling commit
git log --oneline     # kasaysayan ng mga commit
```

Ito ang dahilan kung bakit `git commit` bago ang malaking pagbabago. Isang
utos at ligtas ka na.
