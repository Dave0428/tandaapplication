/* ---------- tutorials ---------- */
var CATS = [
  {id:'phone', label:'catPhone', icon:'📱'},
  {id:'fb',    label:'catFB',    icon:'👍'},
  {id:'msg',   label:'catMsg',   icon:'💬'},
  {id:'safe',  label:'catSafe',  icon:'🛡️'}
];

var TUT = [
/* ---------------- PHONE BASICS ---------------- */
{id:'call', cat:'phone', icon:'📞',
 title:['Make a phone call','Tumawag sa telepono'],
 sub:['Dial a number and talk','I-dial ang numero at makipag-usap'],
 steps:[
  ['Find the green Phone app on your home screen and tap it once.','Hanapin ang berdeng Phone app sa home screen at pindutin ito nang isang beses.'],
  ['Tap "Keypad" at the bottom to show the number buttons.','Pindutin ang "Keypad" sa ibaba para lumabas ang mga numero.'],
  ['Type the number slowly. Read it on the screen to be sure it is right.','Dahan-dahang i-type ang numero. Basahin ito sa screen para siguradong tama.'],
  ['Tap the big green call button.','Pindutin ang malaking berdeng call button.'],
  ['Put the phone near your ear and speak in a normal voice.','Ilapit ang telepono sa tainga at magsalita nang normal.'],
  ['When you are finished, tap the red button to end the call.','Kapag tapos na, pindutin ang pulang button para tapusin ang tawag.']],
 tip:['If you cannot hear well, press the volume button on the side upward while you are on the call.','Kung hindi mo marinig nang maayos, pindutin pataas ang volume button sa gilid habang tumatawag.']},

{id:'contact', cat:'phone', icon:'👤',
 title:['Save a phone number','I-save ang numero'],
 sub:['So you never have to remember it','Para hindi mo na kailangang isaulo'],
 steps:[
  ['Open the Phone app and tap "Contacts".','Buksan ang Phone app at pindutin ang "Contacts".'],
  ['Tap the plus sign (+) to add a new person.','Pindutin ang plus sign (+) para magdagdag ng bagong tao.'],
  ['Type the name, for example "Anak Maria".','I-type ang pangalan, halimbawa "Anak Maria".'],
  ['Tap the number box and type the mobile number.','Pindutin ang kahon ng numero at i-type ang cellphone number.'],
  ['Tap "Save" at the top.','Pindutin ang "Save" sa itaas.'],
  ['Next time, just tap the name in Contacts to call.','Sa susunod, pindutin na lang ang pangalan sa Contacts para tumawag.']],
 tip:['Add the words "Anak", "Apo" or "Doktor" before the name so it is easy to find.','Idagdag ang salitang "Anak", "Apo" o "Doktor" bago ang pangalan para madaling hanapin.']},

{id:'text', cat:'phone', icon:'✉️',
 title:['Send a text message','Magpadala ng text'],
 sub:['Write and send an SMS','Sumulat at magpadala ng SMS'],
 steps:[
  ['Open the Messages app. Its icon looks like a speech bubble.','Buksan ang Messages app. Parang bubble ng usapan ang icon nito.'],
  ['Tap the pencil or plus sign to start a new message.','Pindutin ang lapis o plus sign para magsimula ng bagong mensahe.'],
  ['Type the name of the person, then tap it when it appears.','I-type ang pangalan ng tao, pindutin ito kapag lumabas.'],
  ['Tap the empty box at the bottom and type your message.','Pindutin ang walang laman na kahon sa ibaba at i-type ang mensahe mo.'],
  ['Read your message once before sending.','Basahin muna ang mensahe bago ipadala.'],
  ['Tap the arrow or the word "Send".','Pindutin ang arrow o ang salitang "Send".']],
 tip:['If a letter is wrong, tap the small x or backspace key to erase one letter at a time.','Kung mali ang letra, pindutin ang maliit na x o backspace para burahin isa-isa.']},

{id:'photo', cat:'phone', icon:'📷',
 title:['Take a photo','Kumuha ng litrato'],
 sub:['Use the camera and find your pictures','Gamitin ang camera at hanapin ang litrato'],
 steps:[
  ['Open the Camera app.','Buksan ang Camera app.'],
  ['Hold the phone with both hands so it does not shake.','Hawakan ang telepono gamit ang dalawang kamay para hindi gumalaw.'],
  ['Point it at what you want. Everything you see on the screen will be in the photo.','Itutok sa gusto mong kunan. Ang nakikita sa screen ang lalabas sa litrato.'],
  ['Tap the screen on the face to make it clear.','Pindutin ang screen sa mukha para luminaw.'],
  ['Press the big round button once.','Pindutin ang malaking bilog na button nang isang beses.'],
  ['Your photo is saved in the Gallery or Photos app.','Naka-save ang litrato mo sa Gallery o Photos app.']],
 tip:['Stand with the light behind you, not in front, so faces are not dark.','Tumayo na nasa likod mo ang ilaw, hindi sa harap, para hindi madilim ang mukha.']},

{id:'wifi', cat:'phone', icon:'📶',
 title:['Connect to Wi-Fi','Kumonekta sa Wi-Fi'],
 sub:['Use internet without spending data','Gumamit ng internet nang hindi nauubos ang data'],
 steps:[
  ['Open Settings. The icon looks like a gear.','Buksan ang Settings. Parang gear ang icon.'],
  ['Tap "Wi-Fi". On some phones tap "Connections" first.','Pindutin ang "Wi-Fi". Sa ibang telepono, pindutin muna ang "Connections".'],
  ['Turn the switch on. A list of names will appear.','I-on ang switch. Lalabas ang listahan ng mga pangalan.'],
  ['Tap the name of your own Wi-Fi at home.','Pindutin ang pangalan ng sarili mong Wi-Fi sa bahay.'],
  ['Type the password exactly. Big and small letters are different.','I-type nang eksakto ang password. Iba ang malaki sa maliit na letra.'],
  ['Tap "Connect". A small Wi-Fi sign appears at the top of the screen.','Pindutin ang "Connect". Lalabas ang maliit na Wi-Fi sign sa itaas ng screen.']],
 tip:['Do not connect to free Wi-Fi in public places when you use banking or GCash.','Huwag kumonekta sa libreng Wi-Fi sa labas kapag gumagamit ng banking o GCash.']},

{id:'bigtext', cat:'phone', icon:'🔠',
 title:['Make the letters bigger','Palakihin ang mga letra'],
 sub:['Easier reading for your eyes','Mas madaling basahin para sa mata mo'],
 steps:[
  ['Open Settings.','Buksan ang Settings.'],
  ['Tap "Display" or "Display and brightness".','Pindutin ang "Display" o "Display and brightness".'],
  ['Tap "Font size" or "Text size".','Pindutin ang "Font size" o "Text size".'],
  ['Drag the small circle to the right to make letters bigger.','Hilahin pakanan ang maliit na bilog para lumaki ang letra.'],
  ['You can also turn on "Bold text" to make letters darker.','Puwede rin i-on ang "Bold text" para tumingkad ang letra.'],
  ['Tap the back arrow. Your choice is saved by itself.','Pindutin ang back arrow. Kusang naka-save ang pinili mo.']],
 tip:['In this app you can also change the text size in "Me".','Dito sa app na ito, puwede mo ring baguhin ang laki ng letra sa "Ako".']},

{id:'alarm', cat:'phone', icon:'⏰',
 title:['Set a medicine reminder','Magtakda ng paalala sa gamot'],
 sub:['The phone will remind you every day','Paaalalahanan ka ng telepono araw-araw'],
 steps:[
  ['Open the Clock app.','Buksan ang Clock app.'],
  ['Tap the "Alarm" tab.','Pindutin ang "Alarm" tab.'],
  ['Tap the plus sign (+).','Pindutin ang plus sign (+).'],
  ['Set the hour and minute. Check if it says AM (morning) or PM (afternoon).','Itakda ang oras at minuto. Tingnan kung AM (umaga) o PM (hapon).'],
  ['Choose the days you need it, or choose every day.','Piliin ang mga araw na kailangan, o piliin ang araw-araw.'],
  ['Give it a name like "Gamot sa puso".','Bigyan ng pangalan tulad ng "Gamot sa puso".'],
  ['Tap "Save".','Pindutin ang "Save".']],
 tip:['Put the medicine beside the phone charger so you see both together.','Ilagay ang gamot sa tabi ng charger para magkasama silang makita.']},

{id:'volume', cat:'phone', icon:'🔊',
 title:['Control the sound','Ayusin ang tunog'],
 sub:['Ringing, calls, and videos','Ring, tawag, at video'],
 steps:[
  ['Find the two long buttons on the side of the phone.','Hanapin ang dalawang mahabang button sa gilid ng telepono.'],
  ['Press the upper one for louder, the lower one for softer.','Pindutin ang itaas para lakasan, ang ibaba para hinaan.'],
  ['A small bar appears on the screen while you press.','May lalabas na maliit na bar sa screen habang pinipindot.'],
  ['Tap the small arrow beside that bar to see separate controls for ringing and for videos.','Pindutin ang maliit na arrow sa tabi ng bar para makita ang hiwalay na kontrol ng ring at ng video.'],
  ['To make a call louder, press volume up while you are already talking.','Para lakasan ang tawag, pindutin ang volume up habang kausap mo na ang tao.']],
 tip:['If the phone does not ring, check that it is not on silent or vibrate.','Kung hindi tumutunog ang telepono, tingnan kung naka-silent o vibrate ito.']},

{id:'battery', cat:'phone', icon:'🔋',
 title:['Charging and battery','Pag-charge at baterya'],
 sub:['Keep your phone alive all day','Para buong araw may baterya'],
 steps:[
  ['The number at the top right shows how much battery is left.','Ang numero sa kanang itaas ang nagsasabi kung gaano pa karaming baterya.'],
  ['When it reaches 20, it is time to charge.','Kapag umabot sa 20, oras na para mag-charge.'],
  ['Push the small end of the cable into the hole at the bottom of the phone.','Isaksak ang maliit na dulo ng cable sa butas sa ilalim ng telepono.'],
  ['Do not force it. If it does not fit, turn it the other way.','Huwag pilitin. Kung hindi pumapasok, baliktarin ito.'],
  ['You may use the phone while charging, but let it rest if it feels hot.','Puwedeng gamitin habang naka-charge, pero ipahinga kung uminit ito.'],
  ['Lower the screen brightness to make the battery last longer.','Hinaan ang liwanag ng screen para tumagal ang baterya.']],
 tip:['Leaving it charging overnight is fine on new phones, but unplug it if the case feels very hot.','Ayos lang mag-charge magdamag sa bagong telepono, pero tanggalin kung sobrang init ng case.']},

/* ---------------- FACEBOOK ---------------- */
{id:'fb-login', cat:'fb', icon:'🔑',
 title:['Open and sign in to Facebook','Buksan at mag-sign in sa Facebook'],
 sub:['The blue app with the letter f','Ang asul na app na may letrang f'],
 steps:[
  ['Look for the blue icon with a white letter "f".','Hanapin ang asul na icon na may puting letrang "f".'],
  ['If it is not on your phone, open Play Store or App Store, search "Facebook", then tap Install.','Kung wala ito sa telepono mo, buksan ang Play Store o App Store, hanapin ang "Facebook", pindutin ang Install.'],
  ['Tap the app to open it.','Pindutin ang app para buksan.'],
  ['Type the email address or mobile number you used before.','I-type ang email o cellphone number na ginamit mo dati.'],
  ['Type your password. Tap the eye icon to check what you typed.','I-type ang password mo. Pindutin ang mata na icon para makita ang tinype mo.'],
  ['Tap "Log In". Only tap "Save password" if the phone is your own.','Pindutin ang "Log In". Pindutin lang ang "Save password" kung sarili mong telepono ito.']],
 tip:['Write your password in a notebook kept at home, never in a message to another person.','Isulat ang password sa notebook na nasa bahay, huwag sa mensahe sa ibang tao.']},

{id:'fb-feed', cat:'fb', icon:'📰',
 title:['Read the News Feed','Basahin ang News Feed'],
 sub:['See what family and friends posted','Tingnan ang mga post ng pamilya at kaibigan'],
 steps:[
  ['The house icon at the top is Home. It shows posts from your friends.','Ang bahay na icon sa itaas ay Home. Dito nakikita ang mga post ng kaibigan mo.'],
  ['Slide your finger up the screen to see more posts.','I-slide pataas ang daliri mo sa screen para makakita pa ng mga post.'],
  ['To get new posts, slide down from the very top and let go.','Para sa bagong post, i-slide pababa mula sa pinakataas at bitawan.'],
  ['Tap a photo once to see it bigger. Tap the back arrow to return.','Pindutin ang litrato para lumaki. Pindutin ang back arrow para bumalik.'],
  ['Tap a person\u2019s name to open their profile and see all their posts.','Pindutin ang pangalan ng tao para makita ang profile at lahat ng post niya.']],
 tip:['Not everything you read here is true. Check with family before you believe or share news.','Hindi lahat ng nababasa dito ay totoo. Magtanong muna sa pamilya bago maniwala o mag-share.']},

{id:'fb-react', cat:'fb', icon:'👍',
 title:['Like and comment','Mag-like at mag-comment'],
 sub:['Tell them you saw their post','Ipaalam na nakita mo ang post nila'],
 steps:[
  ['Under every post there are three words: Like, Comment, Share.','Sa ilalim ng bawat post may tatlong salita: Like, Comment, Share.'],
  ['Tap "Like" once. The thumb turns blue. Tap again to remove it.','Pindutin ang "Like" nang isang beses. Magiging asul ang hinlalaki. Pindutin ulit para alisin.'],
  ['Press and hold "Like" to choose Love, Haha, or other feelings.','Pindutin nang matagal ang "Like" para pumili ng Love, Haha, o ibang damdamin.'],
  ['Tap "Comment" to write. A box opens at the bottom.','Pindutin ang "Comment" para sumulat. May bubukas na kahon sa ibaba.'],
  ['Type your message, then tap the arrow to send it.','I-type ang mensahe, pindutin ang arrow para ipadala.'],
  ['Everyone who sees the post can read your comment, so keep it kind.','Nababasa ng lahat ang comment mo, kaya panatilihing mabait ito.']],
 tip:['If you comment by mistake, press and hold your comment, then tap Delete.','Kung nagkamali ka ng comment, pindutin nang matagal ang comment mo, tapos pindutin ang Delete.']},

{id:'fb-post', cat:'fb', icon:'🖼️',
 title:['Post a photo or message','Mag-post ng litrato o mensahe'],
 sub:['Share with your family','Ibahagi sa pamilya mo'],
 steps:[
  ['At the top of Home, tap the box that says "What\u2019s on your mind?".','Sa taas ng Home, pindutin ang kahon na "What\u2019s on your mind?".'],
  ['Type what you want to say.','I-type ang gusto mong sabihin.'],
  ['To add a picture, tap "Photo/Video" at the bottom.','Para magdagdag ng litrato, pindutin ang "Photo/Video" sa ibaba.'],
  ['Tap the photos you want, then tap "Done".','Pindutin ang mga litratong gusto mo, tapos pindutin ang "Done".'],
  ['Tap the small button under your name to choose who can see it. Choose "Friends".','Pindutin ang maliit na button sa ilalim ng pangalan mo para piliin kung sino ang makakakita. Piliin ang "Friends".'],
  ['Tap "Post" at the top right.','Pindutin ang "Post" sa kanang itaas.']],
 tip:['Do not post your home address, your ID, or photos of documents.','Huwag i-post ang address ng bahay, ID, o litrato ng mga dokumento.']},

{id:'fb-friend', cat:'fb', icon:'🤝',
 title:['Friend requests','Mga friend request'],
 sub:['Accept only people you know','Tanggapin lang ang kilala mo'],
 steps:[
  ['Tap the menu button (three lines), then tap "Friends".','Pindutin ang menu (tatlong linya), tapos pindutin ang "Friends".'],
  ['Tap "Requests" to see people who want to be your friend.','Pindutin ang "Requests" para makita ang gustong maging kaibigan mo.'],
  ['Look at the name and photo. Ask yourself: do I really know this person?','Tingnan ang pangalan at litrato. Tanungin ang sarili: kilala ko ba talaga ito?'],
  ['Tap "Confirm" only if you know them. If not, tap "Delete".','Pindutin ang "Confirm" kung kilala mo. Kung hindi, pindutin ang "Delete".'],
  ['To find someone yourself, tap the magnifying glass, type the name, then tap "Add Friend".','Para maghanap ka mismo, pindutin ang magnifying glass, i-type ang pangalan, tapos "Add Friend".']],
 tip:['A stranger who suddenly calls you "Mommy" or "Daddy" and asks for money is a scammer.','Ang estrangherong biglang tatawag sa iyong "Mommy" o "Daddy" at hihingi ng pera ay scammer.']},

/* ---------------- MESSENGER ---------------- */
{id:'msg-send', cat:'msg', icon:'💬',
 title:['Send a message in Messenger','Magpadala ng mensahe sa Messenger'],
 sub:['Free chat with family','Libreng usapan sa pamilya'],
 steps:[
  ['Open Messenger. The icon is a blue bubble with a lightning shape.','Buksan ang Messenger. Asul na bubble na may kidlat ang icon.'],
  ['You will see a list of names. This is "Chats".','May listahan ng mga pangalan. Ito ang "Chats".'],
  ['Tap the name of the person you want to talk to.','Pindutin ang pangalan ng gusto mong kausapin.'],
  ['Tap the box at the bottom that says "Aa" and type your message.','Pindutin ang kahon sa ibaba na may "Aa" at i-type ang mensahe.'],
  ['Tap the blue arrow to send.','Pindutin ang asul na arrow para ipadala.'],
  ['A small circle photo under your message means they already read it.','Ang maliit na bilog na litrato sa ilalim ng mensahe ay ibig sabihin nabasa na nila.']],
 tip:['Messenger uses internet, not load. Connect to Wi-Fi first if you can.','Internet ang gamit ng Messenger, hindi load. Kumonekta muna sa Wi-Fi kung kaya.']},

{id:'msg-voice', cat:'msg', icon:'🎤',
 title:['Send a voice message','Magpadala ng boses'],
 sub:['Speak instead of typing','Magsalita imbes na mag-type'],
 steps:[
  ['Open the chat with the person.','Buksan ang chat ng taong kakausapin mo.'],
  ['Look for the microphone icon beside the message box.','Hanapin ang mikropono na icon sa tabi ng kahon ng mensahe.'],
  ['Press it and hold your finger down. Do not let go yet.','Pindutin ito at hawakan nang nakadiin. Huwag munang bitawan.'],
  ['Speak clearly while you are holding it.','Magsalita nang malinaw habang hawak mo.'],
  ['Let go of your finger. The message is sent right away.','Bitawan ang daliri. Agad itong maipapadala.'],
  ['To cancel, slide your finger away before letting go.','Para kanselahin, i-slide palayo ang daliri bago bumitaw.']],
 tip:['This is the easiest way to send a message when typing is hard.','Ito ang pinakamadaling paraan kapag mahirap mag-type.']},

{id:'msg-photo', cat:'msg', icon:'📤',
 title:['Send a photo in Messenger','Magpadala ng litrato sa Messenger'],
 sub:['Share pictures with family','Ibahagi ang litrato sa pamilya'],
 steps:[
  ['Open the chat with the person.','Buksan ang chat ng tao.'],
  ['Tap the small picture icon beside the message box.','Pindutin ang maliit na litrato na icon sa tabi ng kahon.'],
  ['If the phone asks for permission to see your photos, tap "Allow".','Kung hihingi ng pahintulot ang telepono, pindutin ang "Allow".'],
  ['Tap the photos you want to send. A check mark appears on each one.','Pindutin ang mga litratong ipapadala. May check mark na lalabas sa bawat isa.'],
  ['Tap the blue arrow to send them.','Pindutin ang asul na arrow para ipadala.']],
 tip:['Sending many photos uses a lot of data. Use Wi-Fi when you can.','Malaki ang gamit na data kapag maraming litrato. Gumamit ng Wi-Fi kung puwede.']},

{id:'msg-video', cat:'msg', icon:'📹',
 title:['Make a video call','Mag-video call'],
 sub:['See your family while you talk','Makita ang pamilya habang nag-uusap'],
 steps:[
  ['Open the chat with the person you want to see.','Buksan ang chat ng taong gusto mong makita.'],
  ['Tap the video camera icon at the top right of the screen.','Pindutin ang video camera na icon sa kanang itaas ng screen.'],
  ['Wait for them to answer. You will hear a ringing sound.','Hintayin silang sumagot. May maririnig kang ring.'],
  ['Hold the phone at the level of your face, in a bright place.','Itaas ang telepono sa antas ng mukha mo, sa maliwanag na lugar.'],
  ['Tap the screen once to see the buttons: microphone, camera, and end call.','Pindutin ang screen para makita ang mga button: mikropono, camera, at end call.'],
  ['Tap the red button when you want to finish.','Pindutin ang pulang button kapag tapos na kayo.']],
 tip:['If they cannot hear you, check that the microphone button is not crossed out.','Kung hindi ka nila marinig, tingnan kung hindi naka-ekis ang mikropono button.']},

{id:'msg-group', cat:'msg', icon:'👨‍👩‍👧',
 title:['Make a family group chat','Gumawa ng group chat ng pamilya'],
 sub:['Talk to everyone at once','Kausapin lahat nang sabay'],
 steps:[
  ['In Messenger, tap the pencil icon at the top right.','Sa Messenger, pindutin ang lapis na icon sa kanang itaas.'],
  ['Tap "Create a new group".','Pindutin ang "Create a new group".'],
  ['Tap the names of the people you want to add.','Pindutin ang pangalan ng mga taong isasama mo.'],
  ['Tap "Next" or "Create".','Pindutin ang "Next" o "Create".'],
  ['Give the group a name, like "Pamilya".','Bigyan ng pangalan ang grupo, tulad ng "Pamilya".'],
  ['Everything you send there is seen by everyone in the group.','Lahat ng ipadala mo doon ay nakikita ng buong grupo.']],
 tip:['Remember that a group chat is not private. Send personal matters one to one.','Tandaan, hindi pribado ang group chat. Sa isahang chat ipadala ang personal na usapin.']},

/* ---------------- SAFETY ---------------- */
{id:'safe-otp', cat:'safe', icon:'🔒',
 title:['Never share your code or password','Huwag ibigay ang code o password'],
 sub:['The number one rule','Ang pinakaunang tuntunin'],
 steps:[
  ['An OTP is the six-digit code sent to you by text.','Ang OTP ay ang anim na numerong code na ipinapadala sa iyo sa text.'],
  ['Your bank, GCash, and Facebook will never ask you for it.','Hindi kailanman hihingiin ito ng bangko, GCash, o Facebook.'],
  ['If a caller asks for the code, put the phone down at once.','Kung may tumawag na humihingi ng code, ibaba agad ang telepono.'],
  ['Never type your password inside a message or a comment.','Huwag i-type ang password sa mensahe o comment.'],
  ['Tell a family member the same day it happens.','Sabihin sa kapamilya sa mismong araw na nangyari.']],
 tip:['Real staff never rush you. Being rushed is the biggest warning sign.','Hindi ka minamadali ng totoong empleyado. Ang pagmamadali ang pinakamalaking babala.'],
 warn:true},

{id:'safe-scam', cat:'safe', icon:'⚠️',
 title:['Spot a scam message','Kilalanin ang scam'],
 sub:['Know the warning signs','Alamin ang mga senyales'],
 steps:[
  ['You won a prize in a raffle you never joined.','Nanalo ka raw sa raffle na hindi mo naman sinalihan.'],
  ['The message says your account will close today unless you act now.','Sinasabi na masasara ang account mo ngayong araw kung hindi ka kikilos agad.'],
  ['There is a link that looks almost like a real company name.','May link na halos kamukha ng pangalan ng totoong kompanya.'],
  ['Do not tap the link and do not reply. Replying tells them your number is active.','Huwag pindutin ang link at huwag sumagot. Ang pagsagot ay senyas na aktibo ang numero mo.'],
  ['Take a screenshot, show a family member, then delete and block.','Kumuha ng screenshot, ipakita sa kapamilya, tapos i-delete at i-block.']],
 tip:['If you are unsure, call the company yourself using the number printed on your card or bill.','Kung hindi ka sigurado, ikaw ang tumawag sa kompanya gamit ang numerong nakasulat sa card o bill mo.'],
 warn:true},

{id:'safe-block', cat:'safe', icon:'🚫',
 title:['Block and report someone','I-block at i-report ang tao'],
 sub:['Stop unwanted messages','Itigil ang hindi kanais-nais na mensahe'],
 steps:[
  ['Open the chat or the profile of that person.','Buksan ang chat o profile ng taong iyon.'],
  ['Tap their name at the top of the screen.','Pindutin ang pangalan nila sa itaas ng screen.'],
  ['Slide down to the bottom of the list.','Mag-slide pababa sa dulo ng listahan.'],
  ['Tap "Block", then tap it again to confirm.','Pindutin ang "Block", tapos pindutin ulit para kumpirmahin.'],
  ['Tap "Report" and choose "Scam or fraud" to help other people too.','Pindutin ang "Report" at piliin ang "Scam or fraud" para matulungan din ang iba.']],
 tip:['Blocking is quiet. The person is not told that you blocked them.','Tahimik ang pag-block. Hindi sila sinasabihan na na-block mo sila.']},

{id:'safe-privacy', cat:'safe', icon:'👁️',
 title:['Choose who sees your posts','Piliin kung sino ang nakakakita'],
 sub:['Keep your Facebook private','Panatilihing pribado ang Facebook mo'],
 steps:[
  ['Tap the menu (three lines), then "Settings & privacy", then "Settings".','Pindutin ang menu (tatlong linya), tapos "Settings & privacy", tapos "Settings".'],
  ['Look for "Audience and visibility", then tap "Posts".','Hanapin ang "Audience and visibility", tapos pindutin ang "Posts".'],
  ['Set "Who can see your future posts" to "Friends".','Itakda ang "Who can see your future posts" sa "Friends".'],
  ['Go back and turn on "Profile lock" if your phone shows it.','Bumalik at i-on ang "Profile lock" kung makikita mo ito.'],
  ['Never post your full birthday, address, or a photo of your ID.','Huwag i-post ang buong kaarawan, address, o litrato ng ID mo.']],
 tip:['Check this once a year, or after someone helps you with your phone.','Tingnan ito minsan sa isang taon, o pagkatapos may tumulong sa iyo sa telepono.']}
];

function tutsIn(cat){ return TUT.filter(function(x){ return x.cat === cat; }); }
function tutById(id){ for(var i=0;i<TUT.length;i++) if(TUT[i].id===id) return TUT[i]; return null; }
function doneCount(){ var n=0; for(var k in S.data.done) if(S.data.done[k]) n++; return n; }
