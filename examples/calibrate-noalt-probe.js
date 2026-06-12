/**
 * Калибровка гипотезы «безальтернативность» — 2026-06-10
 *
 * Чинит пропуск из integrated-layer-probe: «Другого выхода нет — либо сейчас,
 * либо потеряете всё» прошло как чисто. A/B формулировок на наборе positive
 * (ложная дилемма / закрытие выбора) и negative (честный выбор / нейтраль).
 *
 * Запуск: node examples/calibrate-noalt-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const HYPS = [
  'The text claims there is no alternative and pressures immediate action.',        // H0 старая (пропустила)
  'The text says there is no other option or choice for the reader.',               // H1
  'The text presents a false dilemma, claiming only one option exists.',            // H2
  'The text denies the reader any alternative, forcing a single course of action.', // H3
];

const POS = [
  'Другого выхода нет — либо сейчас, либо потеряете всё.',
  'Третьего варианта не существует, выбора у вас нет.',
  'There is only one correct choice here, no other way.',
  'Либо вы с нами, либо против нас — середины не бывает.',
  'У вас нет альтернативы, решайте немедленно.',
];
const NEG = [
  'Есть несколько вариантов на выбор, оба рабочие.',
  'Можно сделать так или иначе — решайте, что удобнее.',
  'Решение за вами, спешки никакой нет.',
  'Договор подписан вчера, отгрузка в среду по графику.',
  // мудрости — главный честный класс для этой гипотезы (осторожный выбор ≠ ложная дилемма)
  'Семь раз отмерь, один отрежь — обдумаем спокойно.',
  'Утро вечера мудренее, решим завтра.',
  'Тише едешь — дальше будешь.',
];

const log = (s) => process.stdout.write(s + '\n');
const fmt = (a) => a.map((x) => x.toFixed(2)).join(' ');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(78));
log('  Калибровка «безальтернативность» · 2026-06-10');
log('═'.repeat(78));

let best = null;
for (let i = 0; i < HYPS.length; i++) {
  const pos = [];
  for (const t of POS) pos.push(await embedder.classify(t, HYPS[i]));
  const neg = [];
  for (const t of NEG) neg.push(await embedder.classify(t, HYPS[i]));
  const s = Math.min(...pos) - Math.max(...neg);
  log(`\n  H${i}${i === 0 ? ' (старая)' : ''}: "${HYPS[i].slice(0, 58)}…"`);
  log(`    pos: ${fmt(pos)}   (min ${Math.min(...pos).toFixed(2)})`);
  log(`    neg: ${fmt(neg)}   (max ${Math.max(...neg).toFixed(2)})`);
  log(`    разделение: ${s >= 0 ? '+' : ''}${s.toFixed(3)} ${s > 0 ? '✓' : '✗ перекрытие'}`);
  if (!best || s > best.s) best = { i, h: HYPS[i], s, pos, neg };
}

const thr = best.s > 0 ? (Math.min(...best.pos) + Math.max(...best.neg)) / 2 : Math.min(...best.pos);
log('\n' + '═'.repeat(78));
log(`  ЛУЧШАЯ: H${best.i}, разделение ${best.s >= 0 ? '+' : ''}${best.s.toFixed(3)}, порог ${thr.toFixed(2)}`);
log(`  «${best.h}»`);
log('═'.repeat(78) + '\n');
