# SIMULAN DITO

Ito lang ang kailangan mong basahin sa simula. Ang ibang docs, kapag kailangan mo na.

---

## Unang beses (isang beses lang ito)

**1. I-install ang Node.js**
Pumunta sa nodejs.org, i-download ang malaking berdeng button (LTS), i-install.
Susunod-sunod lang na "Next". Kailangan lang ito minsan sa buong buhay ng laptop mo.

**2. I-install ang VS Code**
Sa code.visualstudio.com, kung wala ka pa.

**3. I-unzip ang TANDA**
I-right click ang zip → "Extract All". Ilagay sa lugar na madali mong mahanap,
halimbawa sa Documents.

---

## Tuwing bubuksan mo ito

**Double-click ang `tanda.code-workspace`.**

Bubukas ang VS Code na buo na ang project — hindi mo na kailangang maghanap ng
folder. Isang file lang ang pipindutin mo.

---

## Para patakbuhin (walang ita-type)

Sa VS Code, sa itaas na menu: **Terminal → Run Task…**

May lalabas na listahan:

```
1. I-install ang kailangan (isang beses lang)
2. Simulan ang TANDA
3. I-update ang database
```

**Sa unang beses:** pindutin ang **1**, hintayin matapos (mga 1–2 minuto,
nagda-download ito).
Pagkatapos noon, pindutin ang **2**.

**Sa susunod na mga araw:** dumiretso na sa **2**. Puwede mo ring pindutin ang
`Ctrl + Shift + B` — iyon ang shortcut ng "Simulan ang TANDA".

Kapag lumabas ang `running: http://localhost:3000`, buksan mo iyon sa Chrome.
Para itigil, pindutin ang basurahan sa terminal o `Ctrl + C`.

---

## Bago ka mag-run sa unang pagkakataon

May isang bagay lang na ita-type. Sa VS Code, buksan ang folder na `server`,
hanapin ang `.env.example`, i-right click → **Copy**, tapos **Paste** sa
parehong folder. Palitan ang pangalan ng kopya, gawin mong `.env` lang.

Buksan ang `.env` at sa linyang `JWT_SECRET=`, magsulat ka ng kahit anong
mahabang halo-halong letra at numero. Ito ang susi ng login. Halimbawa:

```
JWT_SECRET=tandathesis2026kjh3498sdkjfh2938ksjdhf
```

Isang beses lang ito.

**Kung gusto mong maging admin ka** (para makita ang dashboard sa `/admin.html`):
sa parehong `.env`, sa linyang `ADMIN_EMAIL=`, ilagay ang email na gagamitin mo
sa pag-register. Mag-register ka muna sa app gamit iyon, tapos i-restart ang
server (itigil at patakbuhin ulit ang Task 2). Buksan mo na ang `admin.html`.

---

## Kung gusto mo lang tingnan ang app, walang server

I-right click ang `public/index.html` → **Open with Live Server**.

Agad itong bubukas sa browser. Gagana ang lahat ng gabay, laro, boses, at
Tagalog. Ang login at AI lang ang hindi — kailangan nila ng server.

(Kailangan ng Live Server extension. Kapag binuksan mo ang project, magtatanong
ang VS Code kung i-install ang mga rekomendadong extension — pindutin mo lang
ang **Install**.)

---

## Saan ang mga importanteng file

| Gusto mong baguhin | Buksan |
|---|---|
| Mga gabay at ang Tagalog nito | `public/js/tutorials.js` |
| Kulay at itsura | `public/css/styles.css` |
| Salita sa interface | `public/js/i18n.js` |

Buong listahan: `docs/EDITING.md`

---

## Kapag may error

I-screenshot o kopyahin ang **pulang teksto** sa terminal at itanong mo.
Karamihan ng error sa unang beses ay isa sa mga ito:

- Hindi pa naka-install ang Node.js → balik sa hakbang 1
- Hindi pa ginagawa ang `.env` file → basahin ulit ang seksyon sa itaas
- "running scripts is disabled on this system" → normal na patakaran ng
  Windows PowerShell, hindi bug ng TANDA. Buksan ang PowerShell bilang
  Administrator (i-right click → "Run as administrator"), i-type:
  `Set-ExecutionPolicy RemoteSigned -Scope LocalMachine`, sagutin ng `Y`,
  isara, tapos ulitin ang Task 1 sa VS Code sa bagong terminal.
