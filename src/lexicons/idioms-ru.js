/**
 * pantheon-guard · реестр устойчивых выражений (ru) — SEED
 *
 * Назначение: ОБЪЯСНИМЫЙ слой идиом/пословиц. Лексика возвращается не как
 * детектор «по слову», а как ОБЪЯСНИТЕЛЬ: форма идиомы фиксирована → быстрый
 * лексический матч → раскрытие переносного смысла + прагматической функции.
 *
 * Зачем (замер 2026-06-10, idiom-semantic-probe.js): семантика (NLI) ловит
 * смысл хрестоматийных идиом (7/7), но выдаёт «score 0.63», а не «это идиома
 * X со значением Y». Реестр даёт ВИДИМОСТЬ (какая идиома найдена) +
 * ОБЪЯСНИМОСТЬ (буквальный/переносный смысл) + РАЗЛИЧЕНИЕ (давление vs мудрость).
 * Для редких/региональных идиом, где семантика слепнет, реестр критичен.
 *
 * Статус: SEED (ручной, ~25 записей манипулятивного ядра + контроли-мудрость).
 * Источник правды в перспективе — pantheon-vedic-catalogue/lexicons/idioms-ru.yaml.
 *
 * Поле manipulative:
 *   'yes'     — манипулятивна по умолчанию (давление через идиому)
 *   'context' — зависит от контекста (в продаже = манипуляция, в жизни = норма)
 *   'no'      — анти-манипулятивна (учит осторожности; НЕ флагать как давление)
 *
 * Поле pragmatics — прагматическая функция (совпадает с осями детекции guard):
 *   urgency | scarcity | social-proof | fear | false-care | risk-push | none
 */

export const IDIOM_REGISTRY = Object.freeze([
  // ── СРОЧНОСТЬ (false-urgency · indriya-nigraha · Mahiṣa) ──
  { idiom: 'куй железо пока горячо', match: ['куй железо', 'кова(ть|ли) железо пока'],
    literal: 'ковать металл можно только пока он раскалён',
    figurative: 'действуй немедленно, пока есть благоприятный момент',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context',
    note: 'манипулятивна в продаже/давлении («только сегодня»); нейтральна как житейский совет' },
  { idiom: 'лови момент', match: ['лови момент', 'ловите момент'],
    literal: 'хватай мгновение',
    figurative: 'используй возможность сейчас, потом не будет',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },
  { idiom: 'сейчас или никогда', match: ['сейчас или никогда'],
    literal: '—',
    figurative: 'единственный момент для действия, отказ = потеря навсегда',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes',
    note: 'почти всегда давление — искусственное закрытие окна выбора' },
  { idiom: 'дорога ложка к обеду', match: ['дорога ложка к обеду'],
    literal: 'ложка ценна именно во время обеда',
    figurative: 'ценно то, что вовремя; промедлишь — обесценится',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },
  { idiom: 'промедление смерти подобно', match: ['промедление смерти подобно'],
    literal: 'задержка равна гибели',
    figurative: 'любая задержка катастрофична, действуй немедленно',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Rāhu-Ketu', manipulative: 'yes',
    note: 'усиление срочности через страх; почти всегда давление' },
  { idiom: 'не откладывай на завтра', match: ['не откладыва(й|йте) на завтра'],
    literal: '—',
    figurative: 'делай сейчас, отсрочка вредна',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── ДЕФИЦИТ (scarcity · indriya-nigraha · Mahiṣa / Kali-puruṣa) ──
  { idiom: 'кто не успел тот опоздал', match: ['кто не успел', 'кто не успел тот опоздал'],
    literal: '—',
    figurative: 'возможность уже уходит, опоздавшие остаются ни с чем',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'последний вагон уходит', match: ['последний вагон', 'уходящий поезд', 'запрыгнуть в (последний|уходящий)'],
    literal: 'поезд вот-вот отправится',
    figurative: 'последняя возможность присоединиться, потом поздно',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'бери пока дают', match: ['бери пока дают', 'берите пока даю(т|т)'],
    literal: '—',
    figurative: 'хватай сейчас, предложение исчезнет',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'кто первый встал того и тапки', match: ['кто первый встал того и тапки'],
    literal: 'первому достаётся',
    figurative: 'успей раньше других, ресурс ограничен',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Kali-puruṣa', manipulative: 'context' },

  // ── СОЦИАЛЬНОЕ ДАВЛЕНИЕ (social-proof · satya · Namuci) ──
  { idiom: 'все побежали и я побежал', match: ['все побежали', 'все побежали и я'],
    literal: '—',
    figurative: 'делай как все, не задумываясь',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes',
    note: 'часто ироничная самокритика стадности; как призыв — манипулятивна' },
  { idiom: 'не отставай от поезда', match: ['не отстава(й|йте) от поезда'],
    literal: '—',
    figurative: 'все уже движутся, не останься позади',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes' },
  { idiom: 'будь как все', match: ['будь как все', 'будьте как все'],
    literal: '—',
    figurative: 'соответствуй большинству',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── РИСК-ПООЩРЕНИЕ (risk-push · indriya-nigraha · Tāraka) ──
  { idiom: 'кто не рискует тот не пьёт шампанского', match: ['кто не рискует'],
    literal: '—',
    figurative: 'без риска нет награды, рискуй',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context',
    note: 'в инвест/продаже = подталкивание к необдуманному риску; в жизни = смелость' },
  { idiom: 'волков бояться в лес не ходить', match: ['волков бояться'],
    literal: 'боясь волков, не войдёшь в лес',
    figurative: 'не дай страху остановить действие',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },
  { idiom: 'риск благородное дело', match: ['риск благородное дело', 'риск — благородное дело'],
    literal: '—',
    figurative: 'рисковать достойно и правильно',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },

  // ── СТРАХ / УГРОЗА (fear · ahimsa · Rāhu-Ketu) ──
  { idiom: 'промедлишь потеряешь всё', match: ['промедли(шь|те) потеряе'],
    literal: '—',
    figurative: 'задержка = полная потеря',
    pragmatics: 'fear', vrata: 'ahimsa', asura: 'Rāhu-Ketu', manipulative: 'yes' },

  // ── ЛОЖНАЯ ЗАБОТА (false-care · ahimsa · Pūtanā) ──
  { idiom: 'я ж тебе добра желаю', match: ['я (ж|же) тебе добра желаю', 'я тебе только добра'],
    literal: '—',
    figurative: 'довод подаётся как забота, чтобы снять критичность',
    pragmatics: 'false-care', vrata: 'ahimsa', asura: 'Pūtanā', manipulative: 'context',
    note: 'манипулятивна, когда предваряет вредный совет («поэтому откажись от врача»)' },

  // ── АНТИ-МАНИПУЛЯТИВНАЯ МУДРОСТЬ (manipulative:no — НЕ флагать) ──
  { idiom: 'семь раз отмерь один отрежь', match: ['семь раз отмерь'],
    literal: 'тщательно измерь перед тем как резать',
    figurative: 'обдумай несколько раз перед действием',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no',
    note: 'призыв к осторожности — ПРОТИВОПОЛОЖНОСТЬ срочности; контроль различения' },
  { idiom: 'тише едешь дальше будешь', match: ['тише едешь'],
    literal: 'медленная езда — дальше доберёшься',
    figurative: 'неспешность надёжнее спешки',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no' },
  { idiom: 'утро вечера мудренее', match: ['утро вечера мудренее'],
    literal: 'утром виднее, чем вечером',
    figurative: 'отложи решение, обдумай на свежую голову',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no',
    note: 'призыв ОТЛОЖИТЬ — прямая противоположность «сейчас или никогда»' },
  { idiom: 'бесплатный сыр только в мышеловке', match: ['бесплатный сыр'],
    literal: 'даровой сыр лежит в мышеловке',
    figurative: 'у бесплатного есть скрытая цена; будь осторожен',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no',
    note: 'ПРЕДОСТЕРЕЖЕНИЕ от обмана — анти-манипуляция, не флагать' },
  { idiom: 'поспешишь людей насмешишь', match: ['поспешишь людей насмешишь'],
    literal: 'спешка приведёт к смешным ошибкам',
    figurative: 'спешка вредит',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no' },
  { idiom: 'доверяй но проверяй', match: ['доверяй но проверяй'],
    literal: '—',
    figurative: 'доверие должно сопровождаться проверкой',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no' },

  // ══════════════════════════════════════════════════════════════════════
  // СОВРЕМЕННЫЕ УСТОЙЧИВЫЕ ВЫРАЖЕНИЯ (мемы / инфобизнес / hustle-сленг)
  // Добавлено 2026-06-12 по замеру modern-idioms-probe.js.
  // КЛЮЧЕВОЕ (см. MODERN-IDIOMS-PREREG-2026-06-12.md): на этом слое семантика
  // ТЕРЯЕТ РАЗДЕЛИМОСТЬ — manip/ирония/мудрость кучкуются у порога, контроли
  // ложно срабатывают. Реестр здесь нужен не для объяснимости, а для САМОГО
  // РАЗЛИЧЕНИЯ. Поэтому метки расставлены вручную по функции, не по NLI-score.
  // ══════════════════════════════════════════════════════════════════════

  // ── СРОЧНОСТЬ/ДЕФИЦИТ современные (разговорные перефразы — семантика их
  //    берёт хуже канонических идиом, 0.51-0.54 у порога → реестр критичен) ──
  // NB: матчер прогоняет паттерн через ту же нормализацию (срезает regex-
  // метасимволы), поэтому здесь — ПЛОСКИЕ подстроки в нормализованном виде
  // (lowercase, ё→е), несколько вариантов на запись.
  { idiom: 'потом будет только дороже', match: ['потом будет дороже', 'потом будет только дороже', 'завтра будет дороже', 'цены только растут'],
    literal: '—', figurative: 'цена вырастет, покупай немедленно',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes',
    note: 'искусственное закрытие окна цены; почти всегда давление' },
  { idiom: 'бери пока не разобрали', match: ['пока не разобрали', 'пока есть в наличии', 'последние комплект', 'последних комплект'],
    literal: '—', figurative: 'товар заканчивается, хватай сейчас',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },
  { idiom: 'окно возможностей закрывается', match: ['окно возможностей', 'окно закрывается', 'второго шанса не будет'],
    literal: '—', figurative: 'возможность вот-вот исчезнет навсегда',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── FOMO / СОЦ-ДОКАЗАТЕЛЬСТВО современные ──
  { idiom: 'пока ты думаешь другие зарабатывают', match: ['пока ты думаешь', 'другие уже зарабатыва', 'другие зарабатывают'],
    literal: '—', figurative: 'промедление = упущенная выгода, все вокруг уже в деле',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes',
    note: 'FOMO-давление через зависть к успеху других' },
  { idiom: 'все умные люди уже вложились', match: ['все умные', 'умные люди уже', 'умные уже вложил'],
    literal: '—', figurative: 'кто не с нами — глупец, присоединяйся',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes',
    note: 'соц-доказательство + лесть/угроза статусу ("будь умным")' },
  { idiom: 'не будь как все кто упустил', match: ['не будь как все', 'не упусти как остальные'],
    literal: '—', figurative: 'не окажись в числе проигравших, действуй',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── GROWTH-BAIT (инфобизнес: ложное обещание лёгкого роста/богатства).
  //    Семантика ловит как тему, но НЕ отличает манипуляцию от мотивации →
  //    метим вручную. lobha/комфорт-эксплуатация, bait-and-switch. ──
  { idiom: 'пассивный доход на автопилоте', match: ['пассивный доход', 'на автопилоте', 'автопилоте', 'деньги на автопилоте', 'заработок во сне'],
    literal: '—', figurative: 'богатство без усилий и риска',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'yes',
    note: 'обещание дохода без труда/риска — классический инфоцыганский крючок' },
  { idiom: 'сделай икс на вложениях', match: ['сделай икс', 'сделать икс', 'иксы на', 'умножь вложени', 'умножить капитал'],
    literal: 'икс = кратный рост (×2, ×10)',
    figurative: 'многократная прибыль легко и быстро',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context',
    note: 'инвест-жаргон; манипулятивен в обещании гарантированной кратной прибыли' },
  { idiom: 'мышление миллионера', match: ['мышление миллионера', 'мышление бедных', 'мышление богатых', 'мышление бедняка'],
    literal: '—', figurative: 'твоя бедность — в голове, купи "правильное мышление"',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context',
    note: 'перекладывание системных причин на "мышление" — крючок коуч-инфобизнеса' },
  { idiom: 'инвестируй в себя', match: ['инвестируй в себя', 'инвестиция в себя', 'инвестиции в себя', 'вложись в себя'],
    literal: '—', figurative: 'трата на курс подаётся как инвестиция',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context',
    note: 'нейтрально как идея саморазвития; манипулятивно как обёртка для продажи курса' },
  { idiom: 'выйди из зоны комфорта', match: ['зоны комфорта', 'зона комфорта', 'из зоны комфорта'],
    literal: '—', figurative: 'дискомфорт = рост; согласись на то, что не хочешь',
    pragmatics: 'growth-bait', vrata: 'indriya-nigraha', asura: 'Hiraṇyakaśipu', manipulative: 'context',
    note: 'нейтрально как совет; манипулятивно как давление принять невыгодное ("это просто твой страх")' },
  { idiom: 'продай или умри', match: ['продай или умри', 'продавай или умри'],
    literal: '—', figurative: 'нет вариантов кроме агрессивной продажи',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },

  // ── ЛОЖНАЯ ЭКСКЛЮЗИВНОСТЬ (бьёт в тщеславие/принадлежность; mada) ──
  { idiom: 'только для своих', match: ['только для своих', 'не для всех', 'для избранных'],
    literal: '—', figurative: 'ты особенный, попал в круг избранных — соглашайся',
    pragmatics: 'exclusivity', vrata: 'satya', asura: 'Namuci', manipulative: 'context',
    note: 'искусственная эксклюзивность как рычаг тщеславия; нейтрально в реальном закрытом сообществе' },
  { idiom: 'закрытый клуб не для всех', match: ['закрытый клуб', 'закрытого клуба', 'попадают избранные', 'вход только по приглаш'],
    literal: '—', figurative: 'доступ как привилегия для избранных',
    pragmatics: 'exclusivity', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── ЛОЖНАЯ ЗАБОТА современная (Pūtanā) ──
  { idiom: 'я по-человечески тебе говорю', match: ['по-человечески говорю', 'по-человечески тебе говорю', 'как родному', 'я ж тебе не враг', 'забочусь о тебе', 'о тебе забочусь', 'ради твоего блага', 'ради тебя стараюсь', 'только добра желаю', 'тебе только добра'],
    literal: '—', figurative: 'довод подаётся как личная забота, чтобы снять критичность',
    pragmatics: 'false-care', vrata: 'ahimsa', asura: 'Pūtanā', manipulative: 'context',
    note: 'манипулятивно, когда предваряет невыгодное предложение' },

  // ── АНТИ-МАНИПУЛЯТИВНЫЕ современные (ИРОНИЯ над инфобизнесом — manipulative:no!
  //    КРИТИЧНО: семантика принимает иронию ЗА манипуляцию (0.57). Реестр —
  //    единственное, что различает насмешку от рекламы.) ──
  { idiom: 'успешный успех', match: ['успешн(ый|ого) успех'],
    literal: '—', figurative: 'ироничное клеймо пустого коуч-инфобизнеса',
    pragmatics: 'none', vrata: null, asura: null, manipulative: 'no',
    note: 'НАСМЕШКА над инфоцыганами, НЕ манипуляция; семантика ошибочно флагает' },
  { idiom: 'инфоцыган', match: ['инфоцыган', 'инфобизнесмен(ы)?', 'гуру по успеху'],
    literal: '—', figurative: 'разоблачающий ярлык для манипулятивного продавца "успеха"',
    pragmatics: 'none', vrata: null, asura: null, manipulative: 'no',
    note: 'разоблачение манипуляции — анти-маркер, не флагать' },
]);

/**
 * Нормализация для матча: lowercase, ё→е, схлопывание пробелов, срез пунктуации.
 */
function norm(s) {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Находит устойчивые выражения в тексте и возвращает их расшифровки.
 * Это ОБЪЯСНИТЕЛЬ, не вердикт: возвращает что найдено + смысл + функция +
 * манипулятивна ли. Решение о флаге принимает вызывающий слой с учётом контекста.
 *
 * @param {string} text
 * @returns {Array<{idiom, figurative, pragmatics, vrata, asura, manipulative, note?}>}
 */
export function explainIdioms(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of IDIOM_REGISTRY) {
    const hit = entry.match.some((m) => {
      // m может быть простой подстрокой или regex-фрагментом
      try {
        return new RegExp(norm(m).replace(/\\ /g, ' ')).test(n);
      } catch {
        return n.includes(norm(m));
      }
    });
    if (hit) {
      found.push({
        idiom: entry.idiom,
        figurative: entry.figurative,
        pragmatics: entry.pragmatics,
        vrata: entry.vrata,
        asura: entry.asura,
        manipulative: entry.manipulative,
        ...(entry.note ? { note: entry.note } : {}),
      });
    }
  }
  return found;
}

export const IDIOM_STATS = Object.freeze({
  total: IDIOM_REGISTRY.length,
  manipulative_yes: IDIOM_REGISTRY.filter((e) => e.manipulative === 'yes').length,
  manipulative_context: IDIOM_REGISTRY.filter((e) => e.manipulative === 'context').length,
  manipulative_no: IDIOM_REGISTRY.filter((e) => e.manipulative === 'no').length,
});
