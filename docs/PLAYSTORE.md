# Paano ilagay ang TANDA sa Play Store

Tatlong paraan. Simulan sa una, kahit hindi ka pa handa sa Play Store.

---

## Paraan 1 — "Add to Home Screen" (libre, 5 minuto)

Handa na ang TANDA dito. May `manifest.json` na siya, kaya kapag binuksan sa
Chrome, may lalabas na **"Add to Home screen"**. Pagkatapos, may icon na siya sa
telepono ni Lola at bubukas nang full screen — walang address bar, mukhang app.

Kailangan mo lang ng dalawang larawan sa `public/`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Para sa pamilya at barangay, madalas ito na lang ang kailangan. Walang bayad,
walang review, at instant ang update.

---

## Paraan 2 — Gawing tunay na Android app (APK) gamit ang Capacitor

Hindi mo isusulat muli ang code. Bina-balot lang ng Capacitor ang `public/`
folder mo sa loob ng tunay na Android app.

### Ano ang kailangan mo
- Node.js (meron ka na)
- **Android Studio** — libre sa developer.android.com/studio. Malaki ito (mga 1GB),
  pero dito ginagawa ang APK.
- Java JDK 17 — kasama na sa Android Studio.

### Mga hakbang

```bash
cd tanda                # sa root ng project, hindi sa server

npm init -y             # kung wala pang package.json sa root
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor-community/text-to-speech

npx cap init TANDA ph.tanda.app --web-dir=public
npx cap add android
npx cap sync
npx cap open android    # bubukas ang Android Studio
```

Ang `ph.tanda.app` ay ang **package name**. Ito ay pangalan mo habambuhay sa
Play Store — hindi na ito mapapalitan pagkatapos mailabas. Gumamit ng sarili
mong domain style, halimbawa `ph.gov.barangay.tanda` o `com.pangalanmo.tanda`.

### Dito bumabalik ang boses

Kapag Capacitor app na, hindi na browser ang nagbabasa. Ang `voice.js` ay
awtomatikong lilipat sa native na text-to-speech ng Android. **Ito ang tunay na
solusyon sa problema ng boses** — walang WebView na haharang, at gagana ang
Filipino voice na naka-install na sa telepono mo.

### Pag-test sa sarili mong telepono

1. Sa telepono: Settings → About phone → pindutin ang "Build number" ng 7 beses.
   Bubukas ang Developer options.
2. Developer options → i-on ang **USB debugging**.
3. Isaksak sa computer, tapos sa Android Studio pindutin ang berdeng **Run**.

Mailalagay ang TANDA sa telepono mo. Subukan ang boses dito.

---

## Paraan 3 — Ilabas sa Play Store

### Bago ka mag-upload, kailangan mo ng:

1. **Google Play Developer account** — bayad na $25 (mga ₱1,400), isang beses lang.
   Pumunta sa play.google.com/console.
2. **Naka-host na server** — kung gagamitin ang login at AI. Basahin ang
   `DEPLOY.md`. Kung wala nito, tanggalin mo muna ang login sa app — gagana pa
   rin ang lahat ng gabay, laro, at boses nang offline.
3. **Privacy policy** na may sariling link. Kailangan ito dahil humihingi ka ng
   email address. Puwedeng simpleng page lang na nagsasabi kung ano ang
   kinokolekta mo at bakit.
4. **Mga larawan**: app icon 512x512, feature graphic 1024x500, at 2 hanggang 8
   screenshot ng app.

### Paggawa ng release file

Kailangan ng Play Store ng **AAB** (Android App Bundle), hindi APK.

Sa Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.

Gagawa ka ng **keystore** — ito ang digital na pirma mo. Isang bagay ang
tandaan: **kapag nawala ang keystore file at password nito, hindi mo na
kailanman maa-update ang app mo sa Play Store.** Kailangang gumawa ka ng bagong
listing. I-backup mo ito sa dalawang lugar.

### Ang bagong patakaran na madalas ikagulat

Kung personal account ang ginawa mo (hindi company), hinihingi ng Google na
**mag-closed test ka muna kasama ang 12 hanggang 20 tester sa loob ng 14 na
araw** bago ka payagang ilabas sa publiko. Nagbabago ito paminsan-minsan, kaya
tingnan sa Play Console ang eksaktong bilang ngayon.

Sa iyong kaso, hindi ito masama: ipa-test mo sa 12 kapamilya at kapitbahay na
senior. Sila mismo ang magsasabi kung malinaw ba ang mga gabay.

### Ang mismong pag-upload

Play Console → Create app → punan ang store listing → i-upload ang AAB sa
Internal testing muna → tapos Closed testing → tapos Production.

Ang unang review ay mga ilang araw. Ang mga susunod, mas mabilis.

---

## Paano mag-update pagkatapos

**Kapag content lang ang binago** (bagong gabay, tamang salita):

```bash
npx cap sync            # kokopyahin ang bagong public/ sa Android project
```
Tapos gumawa ng bagong AAB. Taasan ang `versionCode` sa
`android/app/build.gradle` — halimbawa `1` → `2`. Hindi tatanggapin ng Google
ang pareho ang versionCode.

**Kapag server lang ang binago** — walang gagawin sa app. Diretso lang ang
telepono sa bagong server.

Basahin ang `UPDATING.md` para sa buong checklist.

---

## Ang totoong payo

Huwag munang dumeretso sa Play Store. Ganito ang mungkahi ko:

1. **Ngayong linggo** — Paraan 1. Ipa-"Add to Home screen" kay Lola. Panoorin
   mo siyang gamitin ito. Dito mo makikita kung ano ang malabo sa mga gabay.
2. **Sa susunod na buwan** — Paraan 2. Gawing APK, ipadala sa 5 kapamilya.
   Dito na gagana nang maayos ang boses.
3. **Kapag maganda na ang app** — saka Paraan 3.

Mas mahalaga ang totoong feedback ni Lola kaysa sa mabilis na paglabas sa
Play Store.
