# Gawing tunay na website ang TANDA

Ngayon totoong website na siya — may sariling link (`https://...`), may login,
may progress sync, may admin dashboard. Ganito kadali ilunsad, libre.

---

## Ang pinakamadaling paraan — Render, 10 minuto

**1. I-push sa GitHub** (kung hindi mo pa nagagawa)

```bash
cd tanda
git init
git add .
git commit -m "TANDA — unang bersyon"
git branch -M main
git remote add origin https://github.com/PANGALANMO/tanda.git
git push -u origin main
```

**2. Pumunta sa render.com**, mag-sign in gamit ang GitHub account mo.

**3. Pindutin ang New → Blueprint.** Piliin ang repository na `tanda`.

Babasahin ni Render ang `server/render.yaml` at kusang gagawin ang lahat —
hindi mo na kailangang mag-set up nang manu-mano.

**4. Bago i-deploy, punan ang dalawang setting** sa Environment tab:

- `JWT_SECRET` — kahit anong mahabang random na letra. Halimbawa:
  `tandathesis2026kjh3498sdkjfh2938ksjdhf`
- `ADMIN_EMAIL` — ang email na gagamitin mong pang-admin (halimbawa,
  ang sarili mong email). Puwede mo itong laktawan muna at ibalik pagkatapos.

**5. Pindutin ang Deploy.** Maghintay ng 2-3 minuto. May lalabas na URL tulad
ng `https://tanda-xxxx.onrender.com` — ito na ang totoong link ng app mo.

---

## Pagkatapos ng unang deploy

**Gawing admin ang sarili mo:**

1. Buksan ang link, mag-**register** gamit ang email na inilagay mo sa
   `ADMIN_EMAIL`.
2. Sa Render dashboard, pindutin ang **Manual Deploy → Restart Service**
   (kailangan lang i-restart, hindi kailangang baguhin ang code).
3. Buksan ang `https://tanda-xxxx.onrender.com/admin.html`, mag-sign in gamit
   ang parehong account. Dapat nakikita mo na ang dashboard.

**I-on ang AI helper (opsyonal):**

Sa Environment tab, idagdag ang `ANTHROPIC_API_KEY` mula sa
console.anthropic.com. Mag-a-auto restart si Render.

---

## Ang babala tungkol sa SQLite dito

Mahalagang malaman mo ito. Sa Render, **nabubura ang disk tuwing may bagong
deploy** — ibig sabihin, kapag nag-`git push` ka ulit ng bagong bersyon,
mawawala ang `tanda.db` kasama ang lahat ng account at progreso.

Para sa isang thesis demo, kadalasan ayos lang ito:
- Bago mag-demo, i-populate mo ang datos (mag-register ng ilang test account)
- **I-export mo muna ang CSV** sa admin dashboard bago ka mag-deploy ng bago
- Huwag mag-push ng bagong code sa araw mismo ng defense mo

Kapag gusto mong permanente talaga ang datos kahit mag-deploy nang paulit-ulit,
lumipat sa Postgres — libre rin ang **Neon** (neon.tech) o **Supabase**.
Basahin ang `docs/DATABASE.md`, seksyong "Moving to Postgres". Isang hapon
lang ang trabaho, at mas mainam gawin ito habang maaga pa.

---

## Ibang libreng paraan (kung ayaw mo ng Render)

| Serbisyo | Bagay dito | Hindi bagay |
|---|---|---|
| **Railway** | Kagaya ng Render, mas mabilis ang cold start | Limitado ang libreng oras kada buwan |
| **Fly.io** | May permanenteng disk (volume) — hindi nawawala ang SQLite | Medyo mas teknikal ang setup |
| **Cyclic / Glitic** | Simple rin | Pabago-bago ang libreng tier nila |

Kung gusto mong hindi na mag-alala tungkol sa nabubura na disk, **Fly.io** ang
pinaka-diretsong sagot habang SQLite pa rin ang gamit mo.

---

## Pagkonekta ng sarili mong domain (opsyonal)

Kung bibili ka ng domain (halimbawa `tanda.ph`, mga ₱600/taon sa Namecheap o
sa isang lokal na registrar):

1. Sa Render dashboard ng service mo, **Settings → Custom Domain**
2. Idagdag ang domain mo
3. Kokopyahin ka ni Render ng DNS record na ilalagay mo sa registrar
4. Maghintay ng ilang oras — awtomatiko nang naka-HTTPS

---

## Pag-update mula ngayon

```bash
git add .
git commit -m "sinong binago"
git push
```

Awtomatikong nade-deploy ni Render tuwing may bagong push sa `main` — hindi mo
na kailangang pindutin ang kahit ano sa dashboard.

**Tandaan:** kapag may binago sa `public/` folder (bagong gabay, bagong
kulay), taasan din ang `CACHE` sa `public/sw.js`, kung hindi ay makikita pa
rin ng mga taong sumubok na dati ang lumang bersyon. Buong detalye nito nasa
`docs/UPDATING.md`.

---

## Buod ng tatlong URL na meron ka na

| Link | Para saan |
|---|---|
| `https://tanda-xxxx.onrender.com` | Ang app mismo — ito ang ibibigay mo sa mga senior |
| `https://tanda-xxxx.onrender.com/admin.html` | Dashboard mo bilang developer |
| `https://tanda-xxxx.onrender.com/api/health` | Mabilisang tsek kung buhay ang server |
