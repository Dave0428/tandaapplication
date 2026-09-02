# Ang mga icon at larawan

## Ang totoong sagot muna

Walang traditional na "image assets folder" ang TANDA dahil **wala talagang
larawan sa loob ng app mismo**. Lahat ng nakikita mong 📱 💬 👍 🛡️ 🎲 📖 ay
**emoji** — text character, hindi image file. Nakasulat sila diretso sa
`public/js/tutorials.js` at `public/js/ui.js`. Walang i-do-download, walang
mabubura, gumagana kahit saang wika o sistema.

## Ang mga tunay na image file

Anim na file lang ang totoong larawan sa buong project, at gawa lahat gamit
ang parehong disenyo ng app — teal (`#1D4B45`), marigold (`#E8A33D`), letrang
"T", may malambot na liwanag sa kanang-itaas kagaya ng background ng buong app:

| File | Laki | Para saan |
|---|---|---|
| `public/icon-192.png` | 192×192 | Home screen icon (Android, PWA) |
| `public/icon-512.png` | 512×512 | Play Store listing, mas malaking display |
| `public/icon-512-maskable.png` | 512×512 | Android adaptive icon (walang bilog na sulok, ino-crop ng Android mismo) |
| `public/favicon.ico` | 16+32 | Tab ng browser |
| `public/favicon-32.png` | 32×32 | Backup ng favicon para sa mga browser na hindi kumukuha ng .ico |
| `docs/assets/splash-preview.png` | 1284×2778 | Halimbawa lang ng splash screen — hindi ginagamit ng app, sanggunian lamang |

Naka-link na ang lahat ng ito: nasa `manifest.json` (Add to Home Screen),
nasa `index.html` (favicon), at nasa `sw.js` (offline caching).

## Kung gusto mong palitan ng sarili mong logo

1. Gumawa ng sarili mong `icon-512.png` (parisukat, 512×512 pixels)
2. I-drag lang papalit sa file na parehong pangalan sa `public/`
3. Para sa `icon-192.png`, i-resize lang ang parehong larawan sa 192×192
4. Para sa `icon-512-maskable.png`: **importante** — panatilihin ang laman
   (halimbawa ang letra) sa loob lang ng gitnang 80% ng larawan. Kino-crop ito
   ng Android papuntang bilog o hugis-parisukat na may pabilog na sulok,
   depende sa telepono, kaya kung sumasagi ang laman sa gilid, puwede itong
   maputol.
5. Taasan ang `CACHE` sa `public/sw.js` (kagaya ng ginagawa mo sa bawat
   pagbabago) para makuha ng mga telepono ang bagong icon.

Walang kailangang espesyal na software — kahit Canva o Photoshop, i-export
lang bilang PNG sa tamang laki.
