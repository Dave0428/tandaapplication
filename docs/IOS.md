# TANDA sa iPhone (iOS)

Basahin muna ito bago ka mag-asa ng katulad ng ginawa natin sa Android. Ang
Android at ang iOS ay **hindi pareho ang landas**, at hindi patakaran ni
TANDA ang dahilan — patakaran ito ni Apple, at wala tayong magagawa dito.

---

## Ang tatlong bagay na hindi mo mararaan

**1. Kailangan mo ng Mac.** Hindi maaaring gumawa ng iOS app gamit ang Windows
o Linux lang. Ang Xcode — ang tool na gumagawa ng iOS app — ay tumatakbo lang
sa macOS. Kung wala kang Mac, kailangan mong humiram (halimbawa sa computer
lab ng school mo) o gumamit ng cloud Mac service.

**2. Walang "APK" sa iOS.** Ang katumbas nito ay tinatawag na **IPA**, pero
hindi mo ito basta maipapadala sa Messenger at maiinstall. Bawat IPA ay
**naka-sign** — kailangang pirmahan gamit ang Apple ID bago ito tumakbo sa
kahit anong iPhone. Walang paraan para lampasan ito.

**3. Dalawang antas ng Apple ID:**

| | Libreng Apple ID | Apple Developer Program ($99/taon) |
|---|---|---|
| Puwedeng i-install sa | Sarili mong iPhone lang | Kahit kaninong iPhone |
| Tagal bago mag-expire | 7 araw, tapos i-reinstall ulit | 1 taon |
| Kailangan ng Mac tuwing i-reinstall | Oo | Hindi, kapag TestFlight na |
| Sapat ba para sa thesis defense | **Oo, sapat na** | Kailangan kung public release talaga |

Para sa thesis, ang libreng Apple ID ay sapat na. Ipapakita mo sa panel sa
sarili mong iPhone, buhay ang app, gumagana ang boses — iyon na ang kailangan.

---

## Paraan A — Libreng Apple ID, sa sarili mong iPhone (ito ang gagawin ng karamihan)

**Kailangan:** Mac na may Xcode (libre sa App Store), sariling iPhone, cable.

```bash
cd tanda
npm install
npx cap add ios
npx cap sync ios
npx cap open ios      # bubukas ang Xcode
```

Sa Xcode:

1. Isaksak ang iPhone sa Mac gamit ang cable
2. Sa itaas, piliin ang pangalan ng iPhone mo bilang target (kapalit ng
   Simulator)
3. Sa kaliwang panel, piliin ang "App" tapos ang tab na **Signing & Capabilities**
4. Sa **Team**, pumili ng **Add an Account…**, mag-sign in gamit ang sarili
   mong Apple ID (ang parehong ginagamit mo sa iPhone) — libre ito
5. Pindutin ang berdeng **▶ Run** button sa itaas

Sa iPhone mo, unang beses, kakailanganin mong pumunta sa **Settings → General
→ VPN & Device Management** at pagkatiwalaan ang developer profile mo. Isang
beses lang ito kada linggo.

**Pagkatapos ng 7 araw**, mag-e-expire ang app. Ibalik lang sa Xcode at
pindutin ulit ang Run — kailangan mong may Mac ka noon.

---

## Paraan B — GitHub Actions (Simulator lang, para tingnan lang kung buo)

Kasama na sa project mo ang `.github/workflows/ios.yml`. Ito ay
**hindi gumagawa ng maiinstall na file** — ang trabaho lang nito ay siguraduhing
walang error ang iOS na bahagi ng app tuwing may bagong push. Kapag pula ang
lumabas doon, alam mong may sirang bahagi bago ka pa magpunta sa Mac.

Patakbuhin: Actions tab → **Build iOS (Simulator lang)** → Run workflow.

---

## Paraan C — TestFlight, kung kailangan mong ipa-test sa iba (may bayad)

Kung kailangan mong ipa-test ng maraming senior sa kani-kanilang iPhone,
kailangan mo na ng **Apple Developer Program**, $99/taon:

1. Mag-enroll sa developer.apple.com/programs (kailangan ng credit card o
   GCash na naka-link sa international card)
2. Sa Xcode, **Product → Archive**, tapos i-upload sa **App Store Connect**
3. Doon, gawin itong **TestFlight** build
4. Ipadala ang link sa TestFlight app ng mga tester mo — awtomatiko na nilang
   ma-i-install, walang expiry na 7 araw

Ito na rin ang parehong daan papunta sa totoong paglalabas sa App Store.

---

## Bakit gumagana pa rin ang boses dito

Kagaya ng Android, gumagamit ang `voice.js` ng `Capacitor.Plugins.TextToSpeech`
kapag nakita nitong nasa loob ito ng totoong app — Android man o iOS. Ibig
sabihin, **kapareho ang code**, kapareho ang gabay, kapareho ang laro. Ang
Xcode lang ang naiiba dahil sa patakaran ni Apple, hindi ang TANDA mismo.

---

## Ang payo ko

Kung ang layunin mo ay **thesis defense**: Paraan A lang, sa sarili mong
iPhone, gamit ang libreng Apple ID. Sapat na iyon, at walang gagastusin.

Kung ang layunin ay **totoong ilabas sa publiko sa parehong Play Store at App
Store**: Android muna (mas mura, mas mabilis), tapos $99 na Apple account
kapag handa ka nang mag-invest sa iOS.

Huwag mong subukang lampasan ang pag-sign — hindi ito bug na aayusin ng
karagdagang code. Patakaran ito ni Apple para sa lahat ng developer sa buong
mundo, hindi lang sa atin.
