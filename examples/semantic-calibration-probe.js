/**
 * Semantic hypothesis calibration — 2026-06-10
 *
 * Чинит 2 слабые гипотезы из asurya-semantic-probe:
 *   - Hiraṇyākṣa «нет источника» провалилась (фейк-Гарвард 0.02)
 *   - Namuci «заимствование достоверности» дала FP на честном тексте
 *
 * Метод: A/B нескольких формулировок гипотезы на наборе positive (должна
 * ловить) и negative (не должна). Метрика = разделение (min(pos) - max(neg)).
 * Лучшая формулировка = максимальное разделение. По данным, не на глаз.
 *
 * Запуск: node examples/semantic-calibration-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const log = (s) => process.stdout.write(s + '\n');

// ── Hiraṇyākṣa: фабрикованная / неверифицируемая авторитетность ──
const HIRANYAKSA = {
  hypotheses: [
    'The text cites research, statistics or authority but gives no verifiable source.', // старая (провал)
    'The text presents a statistic or study as proof but names no source that can be checked.',
    'The text uses vague or fake scientific authority to make a claim sound proven.',
    'The text claims something is scientifically proven but provides no real evidence.',
  ],
  positive: [
    'Исследование Гарварда 2024 года показало рост на 312 процентов — ссылку дать не можем, но цифра проверенная.',
    'Девять из десяти учёных подтверждают это в недавнем мета-обзоре.',
    'Доказано наукой, что наш метод работает в 97 процентах случаев.',
  ],
  negative: [
    'В статье 2019 года в журнале Nature сообщается о росте на 12 процентов, данные открыты.',
    'Точные цифры можно проверить в отчёте Росстата за 2023 год.',
    'Прибор прошёл клинические испытания, протокол опубликован в реестре.',
  ],
};

// ── Namuci: полу-правда (верный факт склеен с ложным выводом) ──
const NAMUCI = {
  hypotheses: [
    'The text borrows the credibility of a true fact to support an unrelated unproven claim.', // старая (FP)
    'The text attaches an unproven product claim to a well-known scientific fact to make it seem equally proven.',
    'The text mixes a true statement with an unrelated commercial claim as if both are equally established.',
  ],
  positive: [
    'Вода кипит при ста градусах — и ровно с той же достоверностью доказано, что наш прибор продлевает жизнь клеткам.',
    'Земля вращается вокруг Солнца, и с той же научной строгостью наши капсулы выводят токсины из крови.',
  ],
  negative: [
    'Вода кипит при ста градусах при нормальном атмосферном давлении.',
    'В статье не указан автор, и это снижает её надёжность.',
    'Наш прибор прошёл сертификацию, документы доступны по запросу.',
  ],
};

function sep(pos, neg) { return Math.min(...pos) - Math.max(...neg); }
function fmt(a) { return a.map((x) => x.toFixed(2)).join(' '); }

const embedder = await createEmbedder({ dtype: 'q8' });

async function calibrate(name, block) {
  log('\n' + '═'.repeat(78));
  log(`  ${name} — калибровка формулировки`);
  log('═'.repeat(78));
  let best = null;
  for (let i = 0; i < block.hypotheses.length; i++) {
    const h = block.hypotheses[i];
    const pos = [];
    for (const t of block.positive) pos.push(await embedder.classify(t, h));
    const neg = [];
    for (const t of block.negative) neg.push(await embedder.classify(t, h));
    const s = sep(pos, neg);
    const tag = i === 0 ? '(старая)' : '';
    log(`\n  H${i} ${tag}: "${h.slice(0, 60)}…"`);
    log(`    pos: ${fmt(pos)}   (min ${Math.min(...pos).toFixed(2)})`);
    log(`    neg: ${fmt(neg)}   (max ${Math.max(...neg).toFixed(2)})`);
    log(`    разделение: ${s >= 0 ? '+' : ''}${s.toFixed(3)} ${s > 0 ? '✓ разделяет' : '✗ перекрытие'}`);
    if (!best || s > best.s) best = { i, h, s, pos, neg };
  }
  // рекомендованный порог = середина зазора (если разделяет) или min(pos) иначе
  const thr = best.s > 0
    ? ((Math.min(...best.pos) + Math.max(...best.neg)) / 2)
    : Math.min(...best.pos);
  log(`\n  → ЛУЧШАЯ: H${best.i} (разделение ${best.s >= 0 ? '+' : ''}${best.s.toFixed(3)})`);
  log(`  → Рекомендованный порог: ${thr.toFixed(3)}`);
  return { name, best, thr };
}

const r1 = await calibrate('Hiraṇyākṣa', HIRANYAKSA);
const r2 = await calibrate('Namuci', NAMUCI);

log('\n' + '═'.repeat(78));
log('  ИТОГ КАЛИБРОВКИ');
log('═'.repeat(78));
for (const r of [r1, r2]) {
  log(`  ${r.name}: H${r.best.i}, порог ${r.thr.toFixed(2)}, разделение ${r.best.s >= 0 ? '+' : ''}${r.best.s.toFixed(2)}`);
  log(`    «${r.best.h}»`);
}
log('═'.repeat(78) + '\n');
