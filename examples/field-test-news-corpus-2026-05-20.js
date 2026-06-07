/**
 * Field test on fresh news — corpus, pulled 2026-05-20.
 * Pre-registration: docs/FIELD-TEST-NEWS-PREREG-2026-05-20.md
 *
 * Headlines pulled in DOM order from publisher front pages on 2026-05-20,
 * verbatim. Same publisher set as 1b's fresh-probe (regression-test on
 * familiar domain). label ∈ {'manipulative','neutral'} — Claude single-
 * annotator first-pass against the 1b rubric:
 *   - false urgency / manufactured scarcity
 *   - fear-based escalation
 *   - clickbait curiosity-gap
 *   - dark-pattern / pressure copy
 *   - emotional-manipulation framing
 * Conservative: borderline → 'neutral'.
 *
 * User is offline; no human adjudication pass this turn. Disclosed limit.
 *
 * Tier: field-test (snapshot, single-annotator label, second-annotator
 * tagging — Phase 5).
 */

export const PULLED_AT = '2026-05-20';

export const CORPUS = [
  // ── RU · lenta.ru ──
  { id: 'ru-lenta-01', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `«Это заговор против США». Кого в Белом доме назвали террористами, кому Америка грозит вторжением и в чем обвиняют Россию?` },
  { id: 'ru-lenta-02', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `В Великобритании разгорелся скандал из-за украинского флага` },
  { id: 'ru-lenta-03', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Медведев предложил использовать устав НАТО против Украины` },
  { id: 'ru-lenta-04', lang: 'ru', source: 'lenta.ru', label: 'neutral', borderline: true,
    text: `В России назвали последствия отказа США от моратория на ядерные испытания` },
  { id: 'ru-lenta-05', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Захарова рассказала о расходовании Украиной помощи Запада` },
  { id: 'ru-lenta-06', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Британия запретила импорт российского урана` },
  { id: 'ru-lenta-07', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Охранники Пашиняна силой увели с митинга критиковавшего его пенсионера` },
  { id: 'ru-lenta-08', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Появились кадры последствий мощного удара баллистическими ракетами по Днепропетровску` },
  { id: 'ru-lenta-09', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Мужчинам подсказали способ оценить состояние здоровья по сперме` },
  { id: 'ru-lenta-10', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Жена Джастина Бибера снялась в откровенных образах для Victoria's Secret` },
  { id: 'ru-lenta-11', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Федор Бондарчук и Паулина Андреева развелись` },
  { id: 'ru-lenta-12', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Одесситка попыталась прорваться в ТЦК ради спасения парня` },

  // ── RU · kp.ru ──
  { id: 'ru-kp-01', lang: 'ru', source: 'kp.ru', label: 'neutral', borderline: true,
    text: `Новый мир, русский газ. Как проходит визит Владимира Путина в Китай` },
  { id: 'ru-kp-02', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `«Схема Долиной» по-прежнему актуальна: количество пострадавших исчисляется уже тысячами` },
  { id: 'ru-kp-03', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Закат империи Зеленского: Как 12 друзей выковали и привели к краху диктатуру на Украине` },
  { id: 'ru-kp-04', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Самый разыскиваемый убийца России стал известным писателем и умер` },
  { id: 'ru-kp-05', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `«Выпил воды, очнулся в рабстве»: Российский шеф-повар рассказал о скам-центре` },
  { id: 'ru-kp-06', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Регина Тодоренко и Влад Топалов: Несмотря на размолвки, всегда побеждает любовь` },
  { id: 'ru-kp-07', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Летал и танцевал без ног: из-за слабого здоровья легендарного Алексея Маресьева` },
  { id: 'ru-kp-08', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Российский козырь: Что такое газопровод «Сила Сибири-2»` },
  { id: 'ru-kp-09', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Счастье Агаты Муцениеце и Петра Дранги: Назвали дочку красивым именем` },
  { id: 'ru-kp-10', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Мировой ажиотаж вокруг редкоземельных металлов: какие суперспособности их превратили` },
  { id: 'ru-kp-11', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Похищенная в Мексике юная россиянка исчезла после совершеннолетия` },
  { id: 'ru-kp-12', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Жуков, Басков, Лепс, Кадышева и Куртукова: Составлен список самых востребованных звезд` },

  // ── RU · ria.ru ──
  { id: 'ru-ria-01', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Путин встретится с Си Цзиньпином` },
  { id: 'ru-ria-02', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Россия будет решать вопрос о поставках газа в Европу в индивидуальном порядке` },
  { id: 'ru-ria-03', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Сенат дал зеленый свет проекту, ограничивающему полномочия Трампа в отношении Ирана` },
  { id: 'ru-ria-04', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Эстония решила переложить на Россию ответственность за украинский БПЛА` },
  { id: 'ru-ria-05', lang: 'ru', source: 'ria.ru', label: 'neutral', borderline: true,
    text: `Трамп допустил новую атаку США на Иран в пятницу` },
  { id: 'ru-ria-06', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Прототип двухместного Су-57 совершил испытательный полет` },
  { id: 'ru-ria-07', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Участник 'Времени героев' стал зампредом правительства Ивановской области` },
  { id: 'ru-ria-08', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Охрана Пашиняна вытолкала с митинга деда погибшего военного` },
  { id: 'ru-ria-09', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Иран пригрозил США открыть новые фронты в случае повторения агрессии` },
  { id: 'ru-ria-10', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Дмитриев создал аккаунт в китайской соцсети WeChat` },
  { id: 'ru-ria-11', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Трамп высказался насчет слухов о словах Си Цзиньпина про Россию и Украину` },
  { id: 'ru-ria-12', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Россия стоит на пороге новой революции — цифровой` },

  // ── EN · buzzfeed.com ──
  { id: 'en-buzzfeed-01', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `32 Telltale Signs We're Headed For A Recession, According To Gen X` },
  { id: 'en-buzzfeed-02', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `Zohran Mamdani Just Gave Democrats A 9-Word Catchphrase That People Say Will Win Them Elections` },
  { id: 'en-buzzfeed-03', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `30 Absolutely Perfect Photos Taken At Just The Right Second That Are Still The Funniest Things I've Ever Seen No Matter What` },
  { id: 'en-buzzfeed-04', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `Mindy Kaling Explained Why She Won't Reveal The Identity Of Her Children's Father Just Yet` },
  { id: 'en-buzzfeed-05', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `"No Justification": Harry Styles Is Being Called Out By His Dedicated Fans Who Have Been Left Seriously Disappointed By His "Shameless" Tour — Here's Why They're So Mad` },
  { id: 'en-buzzfeed-06', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `"Raise Your Sons Better": 37 Brutal, Brutal, Brutal Political Tweets Of The Week` },
  { id: 'en-buzzfeed-07', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `45 Things That Aren't Fancy, But Just Plain Work` },
  { id: 'en-buzzfeed-08', lang: 'en', source: 'buzzfeed.com', label: 'manipulative',
    text: `If You've Got Body-Related Problems You'd Rather Not Share With The Class, You Can Just Quietly Add These 35 Products To Cart` },
  { id: 'en-buzzfeed-09', lang: 'en', source: 'buzzfeed.com', label: 'neutral',
    text: `me playing today's "Soup of the Day" game` },

  // ── EN · boredpanda.com ──
  { id: 'en-boredpanda-01', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `115 Times Designers Clearly Forgot Things Need To Be Cleaned` },
  { id: 'en-boredpanda-02', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `70 Randomly Funny Memes To Fix Your Mood` },
  { id: 'en-boredpanda-03', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `New Study Sheds Light On Body Types Preferred By Men And Women Looking For Romantic Partner` },
  { id: 'en-boredpanda-04', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `The Disturbing Real Story Of Utah Siblings Who Barricaded Themselves In A Bedroom For 54 Days To Avoid Father` },
  { id: 'en-boredpanda-05', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `Meghan Markle Faces Backlash After Sharing Intimate Wedding Pics Fans Weren't Expecting, Despite Past Remarks` },
  { id: 'en-boredpanda-06', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `"No Parent Should Ever Have To See This": Mom Hides Camera In Autistic Son's Hair And Now People Want His Teacher Fired` },
  { id: 'en-boredpanda-07', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `Without A Word, Woman Abandoned Her Family, Then A Series Of Haunting Messages Revealed Her Indescribable Fate` },
  { id: 'en-boredpanda-08', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `'Game Of Thrones' Star Opens Up About Brutal Body Shaming That "Completely Destroyed" Her` },
  { id: 'en-boredpanda-09', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `New Theory Emerges After Ex-Military Diver Reveals Horrors Maldives Tourists Endured In Cave's Third Chamber` },
  { id: 'en-boredpanda-10', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `58 Innocent-Looking Photos That Hide Sinister Secrets` },
  { id: 'en-boredpanda-11', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `"Can You Win This Celebrity Spelling Bee?": Try To Get All 18 Names Right` },
  { id: 'en-boredpanda-12', lang: 'en', source: 'boredpanda.com', label: 'manipulative',
    text: `81 Times People Ended Up With Creepy Classmates And Had To Experience The Weirdest Things` },

  // ── EN · axios.com ──
  { id: 'en-axios-01', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `DOJ settlement ends pending tax investigations into Trump` },
  { id: 'en-axios-02', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `SEC announces new rules to 'make IPOs great again'` },
  { id: 'en-axios-03', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `Trump held meeting on Iran war plans after pausing attack` },
  { id: 'en-axios-04', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `Google unveils broad new push to put AI everywhere` },
  { id: 'en-axios-05', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `The new college graduation ritual: booing AI` },
  { id: 'en-axios-06', lang: 'en', source: 'axios.com', label: 'manipulative',
    text: `Exclusive: Clean energy deals on track for 'biggest year ever'` },
  { id: 'en-axios-07', lang: 'en', source: 'axios.com', label: 'neutral', borderline: true,
    text: `Trump delivers 11th-hour endorsement to Paxton in Texas Senate runoff` },
  { id: 'en-axios-08', lang: 'en', source: 'axios.com', label: 'manipulative',
    text: `Why health officials are worried about containing the Ebola outbreak` },
  { id: 'en-axios-09', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `Home Depot bets on pros for growth` },
  { id: 'en-axios-10', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `Exclusive: Senator requests classified briefing on CISA credentials leak` },
  { id: 'en-axios-11', lang: 'en', source: 'axios.com', label: 'neutral',
    text: `San Diego mosque shooting victims praised for 'heroic' actions` },
  { id: 'en-axios-12', lang: 'en', source: 'axios.com', label: 'manipulative',
    text: `AI hacking era could hit hardest at state and local level` },

  // ── DE · t-online.de ──
  { id: 'de-tonline-01', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Wer so schläft, schädigt Herz und Hirn` },
  { id: 'de-tonline-02', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Das ist der Mann, der Man City übernehmen soll` },
  { id: 'de-tonline-03', lang: 'de', source: 't-online.de', label: 'neutral',
    text: `Dobrindts Pläne für den Zivilschutz` },
  { id: 'de-tonline-04', lang: 'de', source: 't-online.de', label: 'neutral',
    text: `Ukraine zeigt neue Präzisionsbombe` },
  { id: 'de-tonline-05', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `In diesen Ländern lebt es sich weltweit am besten` },
  { id: 'de-tonline-06', lang: 'de', source: 't-online.de', label: 'neutral',
    text: `City patzt erneut - Arsenal ist englischer Meister` },
  { id: 'de-tonline-07', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `"Immer wieder sonntags"-Aus: Mross rechnet mit ARD ab` },
  { id: 'de-tonline-08', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Plötzlich Wahl-Krimi in Texas – Trump gibt Entscheidung bekannt` },
  { id: 'de-tonline-09', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Umfrage zeigt: Jetzt verliert Trump sogar immer mehr Republikaner` },
  { id: 'de-tonline-10', lang: 'de', source: 't-online.de', label: 'neutral',
    text: `Kreml droht baltischen Staaten mit Vergeltung` },
  { id: 'de-tonline-11', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Mit ihm hat es immer richtig Bock gemacht` },
  { id: 'de-tonline-12', lang: 'de', source: 't-online.de', label: 'manipulative',
    text: `Mutter verlässt plötzlich Klinik mit Baby – und taucht in Ungarn auf` },

  // ── DE · web.de ──
  { id: 'de-webde-01', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Iran zeigt sich bereit für militärische Eskalation` },
  { id: 'de-webde-02', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Estlands Verteidigungsminister: Nato-Kampfjets schießen Drohne ab` },
  { id: 'de-webde-03', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Anklage gegen Tengelmann-Chef Christian Haub erhoben` },
  { id: 'de-webde-04', lang: 'de', source: 'web.de', label: 'manipulative',
    text: `Wettlauf gegen die Zeit - Per Hand nach Vermissten gesucht` },
  { id: 'de-webde-05', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Uwe Herrmann ist an seltenem Hautkrebs erkrankt` },
  { id: 'de-webde-06', lang: 'de', source: 'web.de', label: 'manipulative',
    text: `Der Graf trifft die Scorpions "mitten ins Herz"` },
  { id: 'de-webde-07', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Bushido gibt Update zur Operation` },
  { id: 'de-webde-08', lang: 'de', source: 'web.de', label: 'manipulative',
    text: `RTL-Hofdame lästert über Konkurrentin` },
  { id: 'de-webde-09', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Dänemark will Buckelwal doch obduzieren` },
  { id: 'de-webde-10', lang: 'de', source: 'web.de', label: 'manipulative',
    text: `Frau Fischer, wann sollte man wegen Vergesslichkeit zum Arzt?` },
  { id: 'de-webde-11', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Charles und Camilla trommeln in Belfast` },
  { id: 'de-webde-12', lang: 'de', source: 'web.de', label: 'neutral',
    text: `Medien: Nagelsmann nimmt El Mala mit zur WM` },
];

// Summary (Claude single-annotator first-pass):
//   total: 93 items (RU 36 / EN 33 / DE 24)
//   manipulative: 54 (58%) — HIGHER than 1b's 39%; either sample skew or
//     more inclusive labeling than 1b user-adjudicated. Disclosed in prereg.
//   per-language manipulative: RU 19/36 (53%) · EN 23/33 (70%, dominated by
//     BuzzFeed+BoredPanda which are by-genre clickbait) · DE 12/24 (50%)
//   borderline-marked-neutral: 3 (ru-lenta-04, ru-kp-01, ru-ria-05, en-axios-07)
