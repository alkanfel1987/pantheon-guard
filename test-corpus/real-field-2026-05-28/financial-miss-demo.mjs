// SANITY CHECK (author-constructed, NOT a metric — §2 selection-bias warning).
// Purpose: does the guard catch obvious financial-promo / pump-and-dump TEXT?
// Showing MISSES (not inflated catch) — honest negative demonstration.
import { stackPacks, newsPack, newsDePack, epistemologyPack, healthcarePack } from '../../src/index.js';
const STACK = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack]);

const cases = [
  '🚀 $XYZ to the moon! Guaranteed 100x before Friday. Buy now or regret forever.',
  'URGENT: whales are accumulating $DOGE, this is your last chance before it explodes.',
  'This stock will 10x — analysts stay silent because they don\'t want you to know.',
  'Insider tip: shares jump tomorrow at open. Get in before everyone else.',
  'Последний шанс! Токен вырастет в 50 раз на этой неделе, вход закрывается сегодня.',
  'Инсайдерская информация: акции взлетят завтра, успей купить до открытия рынка.',
  'Гарантированная прибыль без риска, вывод любой суммы, успей пока есть места.',
  'Финансовый гуру раскрыл секрет, который банки от тебя скрывают: 300% годовых.',
];

let caught = 0;
for (const t of cases) {
  const r = STACK(t);
  const flagged = r.passes === false;
  if (flagged) caught++;
  const fired = (r.packViolations || []).map((v) => v.source).join(', ') || '—';
  console.log(`${flagged ? 'CATCH ' : 'MISS  '} | fired: ${fired}`);
  console.log(`        ${t}`);
}
console.log(`\nCAUGHT ${caught}/${cases.length} obvious financial-promo manipulations.`);
