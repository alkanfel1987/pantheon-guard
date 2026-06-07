/**
 * Field test on fresh news — corpus, pulled 2026-05-21.
 *
 * Headlines pulled from publisher RSS feeds on 2026-05-21 in DOM order,
 * verbatim. Sources: lenta.ru, kp.ru, ria.ru (RU), bbc.co.uk (EN),
 * news.google.com/rss?hl=de (DE aggregator — direct DE feeds blocked,
 * pattern from CROSS-LANGUAGE-FINAL-2026-05-05 §D).
 *
 * label ∈ {'manipulative','neutral'} — Claude single-annotator first-pass
 * against the rubric inherited from 2026-05-20 field-test:
 *   - false urgency / manufactured scarcity
 *   - fear-based escalation
 *   - clickbait curiosity-gap
 *   - dark-pattern / pressure copy
 *   - emotional-manipulation framing
 * Conservative: borderline → 'neutral'.
 *
 * Single-annotator labelling — no second-annotator pass this turn (limit
 * disclosed; honest-scope §3 of working principles).
 *
 * Dropped from raw RSS pull:
 *   - lenta #12 was duplicate of #11
 *   - de-google #15 was truncated mid-sentence
 * Final N = 73 (36 manipulative / 37 neutral).
 *
 * Tier: field-test (snapshot, single-annotator).
 */

export const PULLED_AT = '2026-05-21';

export const CORPUS = [
  // ── RU · lenta.ru ──
  { id: 'ru-lenta-01', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `В Иране рассказали о появлении нового оружия` },
  { id: 'ru-lenta-02', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Зеленского обвинили в провокациях с целью отвлечь население от внутренних проблем` },
  { id: 'ru-lenta-03', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `В Одессе арестованный сбежал из СИЗО в мусорном контейнере` },
  { id: 'ru-lenta-04', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Минобороны Польши высказалось об украинском беспилотнике над Эстонией` },
  { id: 'ru-lenta-05', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `На Украине раскрыли приказ Зеленского в отношении Белоруссии` },
  { id: 'ru-lenta-06', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Шойгу обвинил Ереван в глумлении над памятью армян` },
  { id: 'ru-lenta-07', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Названа роль нового Су-57Д` },
  { id: 'ru-lenta-08', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Знаменитый астрофизик из Гарварда предсказал последствия инопланетного вторжения` },
  { id: 'ru-lenta-09', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Крышевавших порностудии украинских полицейских уволили` },
  { id: 'ru-lenta-10', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Мошенники придумали новый способ кражи денег россиян` },
  { id: 'ru-lenta-11', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `Генсек НАТО выступил с угрозой в адрес России` },
  { id: 'ru-lenta-12', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `Вознесение Господне в 2026 году: как отметить, традиции праздника` },
  { id: 'ru-lenta-13', lang: 'ru', source: 'lenta.ru', label: 'neutral',
    text: `21 мая: какой праздник отмечают в России и мире` },
  { id: 'ru-lenta-14', lang: 'ru', source: 'lenta.ru', label: 'manipulative',
    text: `«Никто не был готов». Кипр потерял сотни тысяч туристов из России. Как любимый остров россиян выживает сейчас?` },

  // ── RU · kp.ru ──
  { id: 'ru-kp-01', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Предсказания академика Сахарова: «Человечество может погибнуть, истощив себя в «малых» войнах»` },
  { id: 'ru-kp-02', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Новости СВО на Украине и боевая сводка на 21 мая: СБУ прессует полицию, Рютте возмущен отношением к киевскому режиму, Таллин умоляет Киев не пугать эстонцев дронами` },
  { id: 'ru-kp-03', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Герой спецоперации «Z» Илья Тютиков отразил воздушную атаку` },
  { id: 'ru-kp-04', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Трагедия Оксаны Акиньшиной: Почему актриса лишилась возможности воспитывать трех старших детей и как нашла счастье материнства в браке с Козловским` },
  { id: 'ru-kp-05', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Алла Пугачева сама не своя: «В сгорбленной старушке с палочкой совсем не узнать певицу»` },
  { id: 'ru-kp-06', lang: 'ru', source: 'kp.ru', label: 'neutral', borderline: true,
    text: `Формула «Спина к спине», сравнения с Трампом и влияние на украинский кризис: главные выводы после встречи Путина и Си Цзиньпина` },
  { id: 'ru-kp-07', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `«Карл III умер»: британское радио сделало жуткое объявление, репетируя кончину короля` },
  { id: 'ru-kp-08', lang: 'ru', source: 'kp.ru', label: 'neutral',
    text: `Геннадий Зюганов: Надо учиться у пчелы трудолюбию, мужеству и уму` },
  { id: 'ru-kp-09', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Есть первый урожай! В Сочи созрели российские бананы` },
  { id: 'ru-kp-10', lang: 'ru', source: 'kp.ru', label: 'neutral',
    text: `К Зеленскому на Украине подали иск с требованием отмены санкций против Миндича` },
  { id: 'ru-kp-11', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Пекинская симфония: о чем договорились Владимир Путин и Си Цзиньпин` },
  { id: 'ru-kp-12', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Гигантский бункер и дроны в Белом доме: Трамп объявил, что строит под видом бального зала` },
  { id: 'ru-kp-13', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Бунт против НАТО: соратники премьера Италии Мелони потребовали сократить расходы на оборону` },
  { id: 'ru-kp-14', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Тайные знаки, скрытые жесты и главные итоги визита Владимира Путина в Китай: «Дух Анкориджа» сменил «Дух Пекина»` },
  { id: 'ru-kp-15', lang: 'ru', source: 'kp.ru', label: 'manipulative',
    text: `Доказательств нет: шестерых россиян держат за решеткой в Армении по абсурдному обвинению в шпионаже` },

  // ── RU · ria.ru ──
  { id: 'ru-ria-01', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Исследование показало, где предлагают зарплату от 100 тысяч рублей` },
  { id: 'ru-ria-02', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В ВОЗ рассказали о путях заражения лихорадкой Эбола` },
  { id: 'ru-ria-03', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В Сумах прогремел взрыв` },
  { id: 'ru-ria-04', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В Турции прокомментировали решение Арбитражного суда по Euroclear` },
  { id: 'ru-ria-05', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Синоптик рассказала, как составляются прогнозы погоды` },
  { id: 'ru-ria-06', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Источник: Иран готов применить новое оружие в случае атаки США` },
  { id: 'ru-ria-07', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `В Киеве забили тревогу из-за плана Зеленского против Белоруссии` },
  { id: 'ru-ria-08', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Соратница обвинявшего Трампа спецпрокурора стала фигурантом уголовного дела` },
  { id: 'ru-ria-09', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В России появится новый ГОСТ на унитазы` },
  { id: 'ru-ria-10', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `Сборная Германии по хоккею уступила США и проиграла четвертый матч на ЧМ` },
  { id: 'ru-ria-11', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В Госдуме предложили защищать добросовестных покупателей жилья` },
  { id: 'ru-ria-12', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Дзюба называл его "тренеришкой". А гений в пятый раз покорил Лигу Европы!` },
  { id: 'ru-ria-13', lang: 'ru', source: 'ria.ru', label: 'manipulative',
    text: `Священник раскрыл смысл Вознесения Господня` },
  { id: 'ru-ria-14', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `В МИД Греции раскритиковали Киев за атаки на суда в Средиземном море` },
  { id: 'ru-ria-15', lang: 'ru', source: 'ria.ru', label: 'neutral',
    text: `"Астон Вилла" под руководством Эмери выиграла Лигу Европы` },

  // ── EN · bbc.co.uk ──
  { id: 'en-bbc-01', lang: 'en', source: 'bbc.co.uk', label: 'neutral', borderline: true,
    text: `Russian jets 'dangerously' intercept RAF spy plane over Black Sea` },
  { id: 'en-bbc-02', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Women who died in sea off Brighton were sisters` },
  { id: 'en-bbc-03', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Fuel duty freeze extended until the end of the year` },
  { id: 'en-bbc-04', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Southampton lose appeal against play-off expulsion` },
  { id: 'en-bbc-05', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `US charges Cuba's Raúl Castro with murder over 1996 downing of two planes` },
  { id: 'en-bbc-06', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `London bus driver dies after assault on bridge` },
  { id: 'en-bbc-07', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `UK agrees £3.7bn trade deal with six Gulf states` },
  { id: 'en-bbc-08', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Streeting warns Labour risks losing fight against 'nationalism'` },
  { id: 'en-bbc-09', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Supermarkets hit back over pressure to cap price of milk, bread and eggs` },
  { id: 'en-bbc-10', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Channel 4 boss 'deeply sorry' over MAFS UK rape allegations` },
  { id: 'en-bbc-11', lang: 'en', source: 'bbc.co.uk', label: 'manipulative',
    text: `Backlash over Department for Education videos with Gemma Collins` },
  { id: 'en-bbc-12', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `'I made Venezuela Fury's 40ft wedding train - it was too big for my workshop'` },
  { id: 'en-bbc-13', lang: 'en', source: 'bbc.co.uk', label: 'manipulative',
    text: `The deadly plane attack at the centre of Castro's indictment` },
  { id: 'en-bbc-14', lang: 'en', source: 'bbc.co.uk', label: 'manipulative',
    text: `Murder or accident? Mystery of Mango tycoon's hiking death after son's arrest` },
  { id: 'en-bbc-15', lang: 'en', source: 'bbc.co.uk', label: 'neutral',
    text: `Rosenberg: Putin enjoys Xi's Chinese welcome but heads home without pipeline deal` },

  // ── DE · news.google.com (DE aggregator) ──
  { id: 'de-google-01', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `Finale der Europa League: Aston Villas lässt den großen Traum des SC Freiburg platzen` },
  { id: 'de-google-02', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `Berliner Charité nimmt fünf Ebola-Kontaktpersonen auf` },
  { id: 'de-google-03', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `Timmy vor Anholt: Forscher enthüllen Irrtum – es ist ein Weibchen` },
  { id: 'de-google-04', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `Prozess um Unfalltod am Olgaeck: Bewährungsstrafe für Unfallfahrer – so begründet die Richterin das Urteil` },
  { id: 'de-google-05', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `Reform-Agenda Rüstung: Bundeswehr stellt sich in der Beschaffung neu auf` },
  { id: 'de-google-06', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `Alle Wetter-Modelle gekippt – jetzt kennen Temperaturen zu Pfingsten nur noch eine Richtung` },
  { id: 'de-google-07', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `Zwei mutmaßliche chinesische Spione in München festgenommen` },
  { id: 'de-google-08', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `„Bringen Sie die Kinder!": Zeugin belastet Anwalt der Blocks schwer` },
  { id: 'de-google-09', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `„Vermutlich hat fast die Hälfte der CDU im Wirtschaftsausschuss für die AfD gestimmt"` },
  { id: 'de-google-10', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `„Republica": Dann ruft Günther Milliardäre dazu auf, den Kampf für die Demokratie zu finanzieren` },
  { id: 'de-google-11', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `US-Justizministerium kündigt Klage gegen Kubas Ex-Staatschef Raúl Castro an` },
  { id: 'de-google-12', lang: 'de', source: 'news.google.com/de', label: 'neutral',
    text: `Österreich: Russisches Spionagenetzwerk - Ex-Beamter in Wien verurteilt` },
  { id: 'de-google-13', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `Iran-Krieg im Liveticker: +++ 22:06 Iran: Tauschen mit USA weiter Botschaften aus +++` },
  { id: 'de-google-14', lang: 'de', source: 'news.google.com/de', label: 'manipulative',
    text: `London knickt bei Russland-Sanktionen ein` },
];

// Expected distribution:
//   N = 73
//   manipulative = 36
//   neutral      = 37
//
// Per-source:
//   lenta.ru  : 14 (9 manip / 5 neut)
//   kp.ru     : 15 (12 manip / 3 neut)
//   ria.ru    : 15 (5 manip / 10 neut)
//   bbc.co.uk : 15 (3 manip / 12 neut)
//   google-de : 14 (7 manip / 7 neut)
