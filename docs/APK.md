# Paano makakuha ng APK (Android)

**Para lang ito sa Android.** Kung iPhone/iOS ang kailangan mo, ibang landas iyon dahil ibang patakaran ang Apple — basahin ang `docs/IOS.md`.

Ang APK ay ang installer file ng Android. Ito ang ipapadala mo kay Lola sa
Messenger, tapos pipindutin niya at ma-i-install na ang TANDA — parang totoong
app, may icon, may boses, at gumagana kahit walang internet.

Tatlong paraan. Piliin mo ang bagay sa sitwasyon mo.

---

## Paraan A — Ipagawa sa GitHub (walang ida-download sa computer mo)

Ito ang pinakamadali kung mabagal ang internet mo o luma ang computer.
Walang Android Studio, walang Java, walang 1GB na download. Ang GitHub ang
gagawa ng APK para sa iyo, libre.

**1. Gumawa ng GitHub account** sa github.com kung wala ka pa.

**2. I-upload ang project.** Sa computer mo:

```bash
cd tanda
git init
git add .
git commit -m "TANDA v1"
git branch -M main
git remote add origin https://github.com/PANGALANMO/tanda.git
git push -u origin main
```

(Gumawa muna ng bagong repository sa GitHub para makuha ang link na iyan.)

**3. Patakbuhin ang build.** Sa GitHub page ng project mo:
- Pindutin ang tab na **Actions**
- Sa kaliwa, piliin ang **Build Android APK**
- Pindutin ang **Run workflow**

**4. Kunin ang APK.** Maghintay ng mga 5 minuto. Kapag may berdeng check na,
pindutin ang run, tapos mag-scroll pababa. May **tanda-apk** doon — i-download.
Nasa loob ng zip ang `app-debug.apk`.

**5. I-install sa telepono.** Ipadala ang APK sa Messenger o kopyahin sa
telepono. Pindutin ito. Sasabihin ng Android na "hindi pinapayagan ang
pag-install mula sa source na ito" — pindutin ang **Settings** sa mismong
mensahe, tapos i-on ang **Allow from this source**. Isang beses lang ito.

Tapos na. May TANDA app na si Lola, at gumagana na ang boses.

---

## Paraan B — Sa sarili mong computer (Android Studio)

Piliin ito kung gusto mong makita agad ang mga pagbabago habang ginagawa mo.

**Kailangan:** Android Studio (libre sa developer.android.com/studio, mga 1GB).

```bash
cd tanda
npm install
npx cap add android
npx cap sync android
npx cap open android      # bubukas ang Android Studio
```

Sa Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
Kapag tapos, may lalabas na maliit na mensahe sa ibaba na may link na
**locate** — doon ang APK mo.

Kung nakasaksak ang telepono mo at naka-on ang USB debugging, puwede mo na
lang pindutin ang berdeng **Run** at diretso itong mag-i-install.

---

## Paraan C — PWABuilder (kung naka-online na ang TANDA)

Kung na-deploy mo na ang server (tingnan ang `DEPLOY.md`) at may HTTPS link ka
na, pumunta sa **pwabuilder.com**, ipasok ang link, at gagawa ito ng Android
package para sa iyo. Walang ii-install.

Isang babala lang: ang gawa nito ay isang "trusted web activity" — browser pa
rin ang loob nito, kaya **maaaring hindi pa rin tumunog ang boses**. Ang
Paraan A at B ang tunay na native app.

---

## Alin ang APK na puwedeng ilagay sa Play Store?

Ang `app-debug.apk` ay para sa pagsubok lang — hindi ito tatanggapin ng Play
Store, at ayaw din nitong mag-update sa ibabaw ng ibang bersyon.

Para sa Play Store kailangan ng **signed release AAB**. Nasa `PLAYSTORE.md` ang
buong hakbang, pero ito ang mahalaga: gagawa ka ng **keystore** file, at kapag
nawala iyon o ang password nito, hindi mo na kailanman maa-update ang app mo.
I-backup mo sa dalawang lugar.

---

## Tuwing may babaguhin ka

Pagkatapos mong i-edit ang kahit ano sa `public/`:

**Paraan A:** `git add . && git commit -m "bagong gabay" && git push`
Kusang gagawa ulit ng bagong APK ang GitHub.

**Paraan B:** `npx cap sync android` tapos build ulit.

Kapag ilalabas sa Play Store, taasan din ang `versionCode` sa
`android/app/build.gradle` (`1` → `2`). Ayaw ng Google ng parehong numero.

---

## Kung may mali

**"cap: command not found"** — hindi tumakbo ang `npm install`, o hindi ka nasa
`tanda` folder.

**"SDK location not found"** — nangyayari lang sa Paraan B. Buksan muna ang
Android Studio nang isang beses at hayaan mong i-download nito ang SDK.

**Nag-fail ang GitHub Actions** — pindutin ang pulang X, basahin ang huling
pulang linya. Madalas ito ay hindi tugmang bersyon sa `package.json`. I-paste
mo sa akin ang error.

**Walang boses pa rin sa APK** — tingnan kung nasa `package.json` ang
`@capacitor-community/text-to-speech`, at kung tumakbo ang `npx cap sync`
pagkatapos i-install. Sa telepono, dapat may naka-install na Filipino voice
(Settings → Accessibility → Text-to-speech).
