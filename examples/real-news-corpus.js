/**
 * Real-news corpus test for pantheon-guard v0.4.0-pre.2
 *
 * 40 actual headlines pulled from Lenta + Kommersant + RIA + KP on 2026-05-05.
 * Labeled by content semantics (not regex-aware). Guard's verdict compared
 * against the human label.
 *
 * Goal: see how guard performs on REAL production content in news sector,
 * not synthetic regex-tests.
 */

import { inspect } from '../src/index.js';

const CORPUS = [
  // Lenta.ru — mix of mainstream + tabloid leanings
  { src: 'lenta', label: 'Iran/US Hormuz — mainstream geopolitics',
    text: 'Операцию США в Ормузском проливе назвали попыткой взять Иран «на слабо»',
    expected: 'pass' },
  { src: 'lenta', label: 'Anti-aging miracle — health clickbait pattern',
    text: 'Найдено природное средство для замедления старения организма',
    expected: 'catch' },
  { src: 'lenta', label: 'Boots/sock styling — tabloid lifestyle clickbait',
    text: 'Девушка показала способ носить сапоги и озадачила пользователей сети',
    expected: 'catch' },
  { src: 'lenta', label: 'Drone threat headline — emotionally charged news',
    text: '«Украинские дроны могут прилететь». Зеленский пригрозил ударом по параду Победы в Москве. В России ему дали жесткий ответ',
    expected: 'pass' },
  { src: 'lenta', label: 'US strike on Iran — mainstream news',
    text: 'Армия США получила новый приказ об ударах по Ирану',
    expected: 'pass' },
  { src: 'lenta', label: 'CSKA coach pick — sports news',
    text: 'Назван главный претендент на пост тренера ЦСКА',
    expected: 'pass' },
  { src: 'lenta', label: 'Singer eats snake-venom cream — pure tabloid clickbait',
    text: 'Российский певец съел крем со змеиным ядом и испугался',
    expected: 'catch' },
  { src: 'lenta', label: 'Hermitage statement — cultural news',
    text: 'Глава Эрмитажа высказалась о запрете на выезд из России сотрудников музея',
    expected: 'pass' },
  { src: 'lenta', label: 'Armenia–UK partnership — diplomatic news',
    text: 'Армения подписала декларацию о стратегическом партнерстве с Великобританией',
    expected: 'pass' },
  { src: 'lenta', label: 'Zelensky/Georgia meeting — diplomatic news',
    text: 'Зеленский впервые за пять лет встретился с премьером Грузии',
    expected: 'pass' },

  // Kommersant — quality business news, expected mostly mainstream
  { src: 'kom', label: 'Singer obituary',
    text: 'Умер бывший солист группы «Земляне» Юрий Жучков. Бывший солист рок-группы «Земляне» Юрий Жучков умер в возрасте 67 лет',
    expected: 'pass' },
  { src: 'kom', label: 'LDPR official sentencing',
    text: 'Бывшему помощнику Жириновского запросили восемь лет за мошенничество. Гособвинение попросило приговорить к восьми годам колонии одного из бывших руководителей ЛДПР',
    expected: 'pass' },
  { src: 'kom', label: 'G20 sherpa change',
    text: 'Путин сменил шерпу России в G20. Шерпой России в G20 стал начальник экспертного управления президента Денис Агафонов',
    expected: 'pass' },
  { src: 'kom', label: 'Mordovia governor support',
    text: 'Путин поддержал переизбрание Здунова на пост главы Мордовии. Президент России встретился с главой Мордовии и поддержал его планы участвовать в выборах',
    expected: 'pass' },
  { src: 'kom', label: 'US political-violence insurance',
    text: 'FT: компании США стали активнее покупать страховки от политического насилия. Американские корпорации начали больше интересоваться страховками на случай актов политического насилия',
    expected: 'pass' },
  { src: 'kom', label: 'Tanker captain arrest',
    text: 'В Швеции арестован капитан танкера Jin Hui, подозреваемого в перевозке российской нефти. Власти Швеции арестовали капитана танкера, перехваченного в Балтийском море',
    expected: 'pass' },
  { src: 'kom', label: 'Robotics startup valuation',
    text: 'Мировой лидер по производству роботизированных рук стремится к оценке в $6 млрд. Китайский стартап Linkerbot стремится достичь оценки бизнеса в $6 млрд',
    expected: 'pass' },
  { src: 'kom', label: 'Rosfinmonitoring extension',
    text: 'Путин продлил на год срок госслужбы главе Росфинмониторинга. Срок госслужбы директора Росфинмониторинга продлен до 17 июня 2027 года',
    expected: 'pass' },
  { src: 'kom', label: 'IOC esports commission',
    text: 'МОК приостановил деятельность комиссии по киберспорту. Международный олимпийский комитет планирует приостановить деятельность комиссии по киберспорту',
    expected: 'pass' },
  { src: 'kom', label: 'Drones shot down',
    text: 'На подлете к Москве сбиты еще три беспилотника. Силы ПВО уничтожили еще три беспилотника, летевших в сторону Москвы',
    expected: 'pass' },

  // RIA.ru — state news, expected mainstream
  { src: 'ria', label: 'REC export mission to HK',
    text: 'РЭЦ приглашает российских экспортеров на бизнес-миссию в Гонконг',
    expected: 'pass' },
  { src: 'ria', label: 'Volgograd flight restrictions',
    text: 'В аэропорту Волгограда ввели ограничения на полеты',
    expected: 'pass' },
  { src: 'ria', label: 'Drones over Smolensk',
    text: 'Над Смоленской областью сбили восемь украинских беспилотников',
    expected: 'pass' },
  { src: 'ria', label: 'Berlin USSR-symbol ban',
    text: 'В Берлине введут запрет на символику СССР и России на военных мемориалах',
    expected: 'pass' },
  { src: 'ria', label: 'Dagestan governor results',
    text: 'Меликов рассказал об итогах работы на посту главы Дагестана',
    expected: 'pass' },
  { src: 'ria', label: 'SVO map daily',
    text: 'Карта спецоперации Вооруженных сил России на Украине на 04.05.2026',
    expected: 'pass' },
  { src: 'ria', label: 'KHL playoff stream',
    text: '"Авангард" – "Локомотив": смотреть онлайн плей-офф КХЛ 4 мая',
    expected: 'pass' },
  { src: 'ria', label: 'Musk vs EC',
    text: 'Маск подал в суд на Еврокомиссию за преследование X',
    expected: 'pass' },
  { src: 'ria', label: 'Putin actress title',
    text: 'Путин присвоил Анне Банщиковой звание заслуженной артистки России',
    expected: 'pass' },
  { src: 'ria', label: 'Belarus PM meeting',
    text: 'Турчин и Мишустин обсудили реализацию совместных проектов',
    expected: 'pass' },

  // KP.ru — tabloid-leaning, expected mix
  { src: 'kp', label: 'TV-host widow drama — tabloid lifestyle',
    text: 'Пять лет на Новодевичьем кладбище без памятника: Молодая вдова получила квартиру диктора Игоря Кириллова и забросила могилу мужа. Могила диктора Игоря Кириллова заброшена',
    expected: 'catch' },
  { src: 'kp', label: 'Military commentary on AFU strikes',
    text: '«Очевидная попытка испортить майские праздники»: военэксперт объяснил очередные атаки ВСУ. Военэксперт Дрозденко: ВСУ пытаются поднять напряженность в РФ к Дню Победы',
    expected: 'pass' },
  { src: 'kp', label: 'Pashinyan diplomatic — opinion piece',
    text: 'Если «друг» оказался вдруг … Николом. Пашинян созвал в Ереван всех врагов России, которые вместе с ним стали обсуждать, что они должны предпринять против нашей страны',
    expected: 'catch' },
  { src: 'kp', label: 'Sensationalist Ukraine-cannibal metaphor',
    text: 'Пить украинскую кровь: Европа и Зеленский придумали план, как прожить без США. Обозреватель Умеренков сравнил Украину с людоедом',
    expected: 'catch' },
  { src: 'kp', label: 'Bank deposit rates — financial news',
    text: 'Ставки по депозитам упали: какие проценты теперь банки дают вкладчикам. KP.RU: стали известны проценты по вкладам, которые сейчас дают российские банки',
    expected: 'pass' },
  { src: 'kp', label: 'Victory Day commentary',
    text: 'Онищенко: Наш Парад Победы охладит перегревшиеся головы реваншистов всех мастей. Академик РАН, Президент Землячества донбассовцев Москвы, Герой Труда ДНР Геннадий Онищенко',
    expected: 'pass' },
  { src: 'kp', label: 'Hantavirus cruise — clickbait genre framing',
    text: 'Триллер на круизном лайнере: тело жертвы хантавируса доставили на остров, где умер Наполеон. Участников круиза после трех смертей от вируса отказались выпускать в Кабо-Верде',
    expected: 'catch' },
  { src: 'kp', label: 'May vacation timing — practical news',
    text: 'В мае выгоднее трудиться, чем отдыхать: когда россиянам стоит уходить в отпуск. Минтруд напомнил, когда россиянам должны начислять отпускные',
    expected: 'pass' },
  { src: 'kp', label: 'Combat report — quote-as-headline',
    text: '«Боевики просто оружие бросали и убегали. Но встречались и упоротые». Сложные укрепрайоны очистили от ВСУ подразделения группировок войск «Север» и «Центр»',
    expected: 'pass' },
  { src: 'kp', label: 'Tourism PR-piece',
    text: 'Путешествие к себе. Участники туристического проекта «Своих не бросаем!» открыли юбилейный сезон поездок по стране',
    expected: 'pass' },
];

function run(c) {
  const r = inspect(c.text);
  const caught = r.passes === false;
  const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
  return { caught, correct, r };
}

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · REAL news corpus · Lenta+Kommersant · 2026-05-05');
console.log('═'.repeat(78));

let total = 0, ok = 0, fp = 0, fn = 0;
const bySrc = {};

for (const c of CORPUS) {
  const { caught, correct, r } = run(c);
  total++;
  if (correct) ok++;
  else {
    if (c.expected === 'pass' && caught) fp++;
    if (c.expected === 'catch' && !caught) fn++;
  }
  bySrc[c.src] ??= { total: 0, ok: 0, fp: 0, fn: 0 };
  bySrc[c.src].total++;
  if (correct) bySrc[c.src].ok++;
  else {
    if (c.expected === 'pass' && caught) bySrc[c.src].fp++;
    if (c.expected === 'catch' && !caught) bySrc[c.src].fn++;
  }

  const mark = correct ? '✓' : '✗';
  const verdict = caught ? 'CAUGHT' : 'pass';
  console.log(`\n[${c.src}] ${mark} ${c.label}`);
  console.log(`  text: ${c.text.slice(0, 90)}${c.text.length > 90 ? '…' : ''}`);
  console.log(`  expected: ${c.expected.toUpperCase().padEnd(6)}  got: ${verdict}`);
  const ev = Object.entries(r.evidence || {}).filter(([_, a]) => a && a.length).map(([k, a]) => `${k}=${a.length}`).join(' ');
  if (ev) console.log(`  evidence-counts: ${ev}`);
}

console.log('\n' + '═'.repeat(78));
console.log('  Source summary');
console.log('═'.repeat(78));
for (const [k, s] of Object.entries(bySrc)) {
  const pct = ((s.ok / s.total) * 100).toFixed(0);
  console.log(`  ${k.padEnd(8)} ${s.ok}/${s.total} (${pct}%)  FP=${s.fp}  FN=${s.fn}`);
}
console.log(`\n  OVERALL  ${ok}/${total} (${((ok/total)*100).toFixed(0)}%)  FP=${fp}  FN=${fn}`);
console.log('═'.repeat(78) + '\n');
