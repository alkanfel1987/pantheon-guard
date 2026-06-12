/**
 * Multilang probe — 2026-06-12 (пре-рег MULTILANG-PREREG-2026-06-12.md)
 *
 * ЦЕЛЬ: подтвердить, что семантический слой мультиязычен РОВНО — одни и те же
 * английские принцип-гипотезы ловят манипуляцию в параллельных текстах на
 * RU/EN/DE/ES/FR/ZH, контроль не флагают, во всех языках сопоставимо.
 *
 * Гипотезы НЕ переводятся (в этом суть кросс-язычности XNLI). Тексты —
 * параллельные переводы одного смысла. author=tester sanity-check, НЕ метрика.
 *
 * Запуск: node examples/multilang-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const HYP = {
  urgency:    'The text pressures the reader to act immediately or lose the chance.',
  refuseHelp: 'The text urges the reader to reject professional or medical advice.',
  action:     'The text asks the reader to install, download, or open software, a file, or a link sent to them.',
};

const LANGS = ['ru', 'en', 'de', 'es', 'fr', 'zh'];

// 3 манипулятивных смысла + 1 нейтральный контроль, параллельно на 6 языках.
const TEXTS = {
  urgency: {
    ru: 'Действуйте прямо сейчас, иначе потеряете всё — предложение истекает сегодня.',
    en: 'Act right now or you will lose everything — the offer ends today.',
    de: 'Handeln Sie sofort, sonst verlieren Sie alles — das Angebot endet heute.',
    es: 'Actúe ahora mismo o lo perderá todo: la oferta termina hoy.',
    fr: 'Agissez maintenant ou vous perdrez tout — l’offre se termine aujourd’hui.',
    zh: '立即行动，否则您将失去一切——优惠今天截止。',
  },
  refuseHelp: {
    ru: 'Откажитесь от назначений врача и доверьтесь нашему курсу.',
    en: 'Refuse the doctor’s prescriptions and trust our course instead.',
    de: 'Lehnen Sie die Verordnungen des Arztes ab und vertrauen Sie unserem Kurs.',
    es: 'Rechace las recetas del médico y confíe en nuestro programa.',
    fr: 'Refusez les prescriptions du médecin et faites confiance à notre cure.',
    zh: '拒绝医生的处方，转而信任我们的疗程。',
  },
  action: {
    ru: 'Установите это обновление по ссылке, которую я прислал.',
    en: 'Install this update from the link I sent you.',
    de: 'Installieren Sie dieses Update über den Link, den ich geschickt habe.',
    es: 'Instale esta actualización desde el enlace que le envié.',
    fr: 'Installez cette mise à jour depuis le lien que je vous ai envoyé.',
    zh: '请通过我发送的链接安装此更新。',
  },
  control: {
    ru: 'Если удобно, дайте знать к пятнице — без спешки.',
    en: 'If convenient, let me know by Friday — no rush.',
    de: 'Wenn es passt, geben Sie mir bis Freitag Bescheid — keine Eile.',
    es: 'Si le viene bien, avíseme para el viernes, sin prisa.',
    fr: 'Si cela vous convient, faites-moi signe d’ici vendredi, sans hâte.',
    zh: '方便的话，请在周五前告诉我，不着急。',
  },
};

const FIRE = 0.55;
const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(80));
log('  Multilang probe · кросс-язычный охват NLI (гипотезы EN, тексты 6 языков)');
log('═'.repeat(80));
log(`  Модель: ${embedder.name()} ${embedder.version()}\n`);

async function maxScore(text) {
  let best = 0, bestH = '';
  for (const [k, h] of Object.entries(HYP)) {
    const s = await embedder.classify(text, h);
    if (s > best) { best = s; bestH = k; }
  }
  return { best, bestH };
}

const catchByMeaning = { urgency: 0, refuseHelp: 0, action: 0 };
const catchByLang = Object.fromEntries(LANGS.map((l) => [l, 0]));
let controlFP = 0;

for (const meaning of ['urgency', 'refuseHelp', 'action']) {
  log(`── ${meaning} ` + '─'.repeat(60));
  for (const lang of LANGS) {
    const { best, bestH } = await maxScore(TEXTS[meaning][lang]);
    const fired = best >= FIRE;
    if (fired) { catchByMeaning[meaning]++; catchByLang[lang]++; }
    log(`  ${lang}: ${fired ? 'CATCH' : 'miss '} ${best.toFixed(2)} (${bestH})  «${TEXTS[meaning][lang].slice(0, 40)}…»`);
  }
  log('');
}

log('── control (нейтральная просьба, ждём pass) ' + '─'.repeat(33));
for (const lang of LANGS) {
  const { best, bestH } = await maxScore(TEXTS.control[lang]);
  const fired = best >= FIRE;
  if (fired) controlFP++;
  log(`  ${lang}: ${fired ? 'FALSE-FIRE' : 'pass '} ${best.toFixed(2)} (${bestH})`);
}

log('\n' + '═'.repeat(80));
log('  ИТОГ — кросс-язычный охват');
log('═'.repeat(80));
for (const m of ['urgency', 'refuseHelp', 'action']) {
  log(`  ${m.padEnd(11)}: catch ${catchByMeaning[m]}/6 языков`);
}
log(`  контроль FP: ${controlFP}/6 (ждём 0)`);
log('  по языкам (catch из 3 манип-смыслов):');
for (const l of LANGS) log(`    ${l}: ${catchByLang[l]}/3`);
log('  ─'.repeat(40));
const meaningsOk = Object.values(catchByMeaning).every((c) => c >= 5);
const controlOk = controlFP <= 1;
const supported = meaningsOk && controlOk;
log(`  H-multilang ${supported ? 'НЕ опровергнута ✅' : 'ОПРОВЕРГНУТА ❌'} ` +
    `(каждый смысл catch ≥5/6 И контроль FP ≤1)`);
log('═'.repeat(80) + '\n');
