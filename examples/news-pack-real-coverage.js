/**
 * News-pack real-coverage probe · 2026-05-05
 *
 * Run news-pack (and stacked news+epistemology) against the same 40 real
 * RU news headlines that the core inspector was tested on
 * (real-news-corpus.js). Goal: measure actual real-world catch lift.
 *
 * Compares:
 *   - core only (baseline, established at 33/40 = 83%)
 *   - core + news-pack
 *   - core + news-pack + epistemology-pack (stacked)
 *
 * Then probes the 7 confirmed FN cases from real-news to see which classes
 * of tabloid clickbait the pack actually closes.
 */

import {
  inspect,
  applyPack,
  stackPacks,
  newsPack,
  epistemologyPack,
} from '../src/index.js';

const inspectN = applyPack(newsPack);
const inspectNE = stackPacks([newsPack, epistemologyPack]);

// 40 real headlines (same labels as real-news-corpus.js)
const CORPUS = [
  // Lenta — mass news + tabloid lean
  { src: 'lenta', label: 'Iran/US Hormuz', text: 'Операцию США в Ормузском проливе назвали попыткой взять Иран «на слабо»', expected: 'pass' },
  { src: 'lenta', label: 'Anti-aging miracle', text: 'Найдено природное средство для замедления старения организма', expected: 'catch' },
  { src: 'lenta', label: 'Boots styling tabloid', text: 'Девушка показала способ носить сапоги и озадачила пользователей сети', expected: 'catch' },
  { src: 'lenta', label: 'Drone threat headline', text: '«Украинские дроны могут прилететь». Зеленский пригрозил ударом по параду Победы в Москве. В России ему дали жесткий ответ', expected: 'pass' },
  { src: 'lenta', label: 'US Iran strikes', text: 'Армия США получила новый приказ об ударах по Ирану', expected: 'pass' },
  { src: 'lenta', label: 'CSKA coach', text: 'Назван главный претендент на пост тренера ЦСКА', expected: 'pass' },
  { src: 'lenta', label: 'Snake-venom cream singer', text: 'Российский певец съел крем со змеиным ядом и испугался', expected: 'catch' },
  { src: 'lenta', label: 'Hermitage statement', text: 'Глава Эрмитажа высказалась о запрете на выезд из России сотрудников музея', expected: 'pass' },
  { src: 'lenta', label: 'Armenia–UK', text: 'Армения подписала декларацию о стратегическом партнерстве с Великобританией', expected: 'pass' },
  { src: 'lenta', label: 'Zelensky/Georgia', text: 'Зеленский впервые за пять лет встретился с премьером Грузии', expected: 'pass' },

  // Kommersant — quality business
  { src: 'kom', label: 'Singer obituary', text: 'Умер бывший солист группы «Земляне» Юрий Жучков. Бывший солист рок-группы «Земляне» Юрий Жучков умер в возрасте 67 лет', expected: 'pass' },
  { src: 'kom', label: 'LDPR sentencing', text: 'Бывшему помощнику Жириновского запросили восемь лет за мошенничество. Гособвинение попросило приговорить к восьми годам колонии одного из бывших руководителей ЛДПР', expected: 'pass' },
  { src: 'kom', label: 'G20 sherpa', text: 'Путин сменил шерпу России в G20. Шерпой России в G20 стал начальник экспертного управления президента Денис Агафонов', expected: 'pass' },
  { src: 'kom', label: 'Mordovia governor', text: 'Путин поддержал переизбрание Здунова на пост главы Мордовии. Президент России встретился с главой Мордовии и поддержал его планы участвовать в выборах', expected: 'pass' },
  { src: 'kom', label: 'US insurance', text: 'FT: компании США стали активнее покупать страховки от политического насилия. Американские корпорации начали больше интересоваться страховками на случай актов политического насилия', expected: 'pass' },
  { src: 'kom', label: 'Tanker arrest', text: 'В Швеции арестован капитан танкера Jin Hui, подозреваемого в перевозке российской нефти. Власти Швеции арестовали капитана танкера, перехваченного в Балтийском море', expected: 'pass' },
  { src: 'kom', label: 'Robotics startup', text: 'Мировой лидер по производству роботизированных рук стремится к оценке в $6 млрд. Китайский стартап Linkerbot стремится достичь оценки бизнеса в $6 млрд', expected: 'pass' },
  { src: 'kom', label: 'Rosfinmonitoring', text: 'Путин продлил на год срок госслужбы главе Росфинмониторинга. Срок госслужбы директора Росфинмониторинга продлен до 17 июня 2027 года', expected: 'pass' },
  { src: 'kom', label: 'IOC esports', text: 'МОК приостановил деятельность комиссии по киберспорту. Международный олимпийский комитет планирует приостановить деятельность комиссии по киберспорту', expected: 'pass' },
  { src: 'kom', label: 'Drones shot down', text: 'На подлете к Москве сбиты еще три беспилотника. Силы ПВО уничтожили еще три беспилотника, летевших в сторону Москвы', expected: 'pass' },

  // RIA — state, expected mainstream
  { src: 'ria', label: 'REC HK mission', text: 'РЭЦ приглашает российских экспортеров на бизнес-миссию в Гонконг', expected: 'pass' },
  { src: 'ria', label: 'Volgograd flight', text: 'В аэропорту Волгограда ввели ограничения на полеты', expected: 'pass' },
  { src: 'ria', label: 'Drones Smolensk', text: 'Над Смоленской областью сбили восемь украинских беспилотников', expected: 'pass' },
  { src: 'ria', label: 'Berlin USSR ban', text: 'В Берлине введут запрет на символику СССР и России на военных мемориалах', expected: 'pass' },
  { src: 'ria', label: 'Dagestan governor', text: 'Меликов рассказал об итогах работы на посту главы Дагестана', expected: 'pass' },
  { src: 'ria', label: 'SVO map', text: 'Карта спецоперации Вооруженных сил России на Украине на 04.05.2026', expected: 'pass' },
  { src: 'ria', label: 'KHL stream', text: '"Авангард" – "Локомотив": смотреть онлайн плей-офф КХЛ 4 мая', expected: 'pass' },
  { src: 'ria', label: 'Musk vs EC', text: 'Маск подал в суд на Еврокомиссию за преследование X', expected: 'pass' },
  { src: 'ria', label: 'Putin actress', text: 'Путин присвоил Анне Банщиковой звание заслуженной артистки России', expected: 'pass' },
  { src: 'ria', label: 'Belarus PM', text: 'Турчин и Мишустин обсудили реализацию совместных проектов', expected: 'pass' },

  // KP — tabloid leaning
  { src: 'kp', label: 'TV-host widow drama', text: 'Пять лет на Новодевичьем кладбище без памятника: Молодая вдова получила квартиру диктора Игоря Кириллова и забросила могилу мужа. Могила диктора Игоря Кириллова заброшена', expected: 'catch' },
  { src: 'kp', label: 'AFU strikes commentary', text: '«Очевидная попытка испортить майские праздники»: военэксперт объяснил очередные атаки ВСУ. Военэксперт Дрозденко: ВСУ пытаются поднять напряженность в РФ к Дню Победы', expected: 'pass' },
  { src: 'kp', label: 'Pashinyan opinion', text: 'Если «друг» оказался вдруг … Николом. Пашинян созвал в Ереван всех врагов России, которые вместе с ним стали обсуждать, что они должны предпринять против нашей страны', expected: 'catch' },
  { src: 'kp', label: 'Ukraine-blood metaphor', text: 'Пить украинскую кровь: Европа и Зеленский придумали план, как прожить без США. Обозреватель Умеренков сравнил Украину с людоедом', expected: 'catch' },
  { src: 'kp', label: 'Bank deposit rates', text: 'Ставки по депозитам упали: какие проценты теперь банки дают вкладчикам. KP.RU: стали известны проценты по вкладам, которые сейчас дают российские банки', expected: 'pass' },
  { src: 'kp', label: 'Victory Day commentary', text: 'Онищенко: Наш Парад Победы охладит перегревшиеся головы реваншистов всех мастей. Академик РАН, Президент Землячества донбассовцев Москвы, Герой Труда ДНР Геннадий Онищенко', expected: 'pass' },
  { src: 'kp', label: 'Hantavirus cruise', text: 'Триллер на круизном лайнере: тело жертвы хантавируса доставили на остров, где умер Наполеон. Участников круиза после трех смертей от вируса отказались выпускать в Кабо-Верде', expected: 'catch' },
  { src: 'kp', label: 'May vacation', text: 'В мае выгоднее трудиться, чем отдыхать: когда россиянам стоит уходить в отпуск. Минтруд напомнил, когда россиянам должны начислять отпускные', expected: 'pass' },
  { src: 'kp', label: 'Combat report quote', text: '«Боевики просто оружие бросали и убегали. Но встречались и упоротые». Сложные укрепрайоны очистили от ВСУ подразделения группировок войск «Север» и «Центр»', expected: 'pass' },
  { src: 'kp', label: 'Tourism PR', text: 'Путешествие к себе. Участники туристического проекта «Своих не бросаем!» открыли юбилейный сезон поездок по стране', expected: 'pass' },
];

function metric(name, runner) {
  let pass = 0, fp = 0, fn = 0;
  const fails = [];
  for (const c of CORPUS) {
    const r = runner(c.text);
    const caught = r.passes === false;
    const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
    if (correct) pass++;
    else {
      if (c.expected === 'pass' && caught) { fp++; fails.push(`FP · [${c.src}] ${c.label}`); }
      if (c.expected === 'catch' && !caught) { fn++; fails.push(`FN · [${c.src}] ${c.label}`); }
    }
  }
  return { name, pass, fp, fn, total: CORPUS.length, fails };
}

const variants = [
  metric('core only', inspect),
  metric('core + news-pack', inspectN),
  metric('core + news + epistemology (stacked)', inspectNE),
];

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · news-pack real-coverage probe · N=40 · 2026-05-05');
console.log('═'.repeat(78));

for (const v of variants) {
  const pct = ((v.pass / v.total) * 100).toFixed(0);
  console.log(`\n  ${v.name.padEnd(40)} ${v.pass}/${v.total} (${pct}%)  FP=${v.fp}  FN=${v.fn}`);
  for (const f of v.fails) console.log(`    ${f}`);
}

// Lift analysis
console.log('\n' + '═'.repeat(78));
console.log('  Lift analysis (vs core only)');
console.log('═'.repeat(78));
const baseline = variants[0].pass;
for (const v of variants.slice(1)) {
  const lift = v.pass - baseline;
  const liftPct = ((lift / variants[0].total) * 100).toFixed(0);
  const fpDelta = v.fp - variants[0].fp;
  console.log(`  ${v.name.padEnd(40)} +${lift} catches  (+${liftPct}pp)  FP delta=${fpDelta >= 0 ? '+' : ''}${fpDelta}`);
}

console.log('\n' + '═'.repeat(78) + '\n');
