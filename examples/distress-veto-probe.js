/**
 * Ahimsa veto: детектор эмоционального дистресса — 2026-06-10
 *
 * Наблюдение пользователя вскрыло системную проблему: крик о помощи
 * («у меня нет выхода, я в отчаянии») задевает гипотезы манипуляции
 * (дефицит 0.55, безальтернативность 0.81) по ФОРМЕ. Флагать страдающего =
 * нарушение ahimsa.
 *
 * Решение: veto-слой. Если текст выражает личный дистресс — подавить флаг
 * манипуляции. Ошибка в безопасную сторону: лучше пропустить манипуляцию,
 * чем обвинить страдающего.
 *
 * Тест: отделяет ли гипотеза дистресса крик о помощи от реальной манипуляции
 * и нейтрали (чтобы veto не глушил настоящую манипуляцию).
 *
 * Запуск: node examples/distress-veto-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const H_DISTRESS = 'The speaker expresses their own emotional distress, despair or hopelessness.';

// дистресс (veto ДОЛЖЕН ловить → подавить флаг)
const DISTRESS = [
  'У меня нет другого выхода, я в полном отчаянии.',
  'Мне кажется, всё потеряло смысл, опускаются руки.',
  'Я больше не могу, мне очень плохо и страшно.',
  'Не вижу выхода из этой ситуации, сил не осталось.',
];
// манипуляция (veto НЕ должен ловить → флаг сохраняется)
const MANIP = [
  'Купите сейчас или потеряете эту возможность навсегда.',
  'Места стремительно заканчиваются, успейте записаться.',
  'Откажитесь от назначений врача и доверьтесь нашему курсу.',
  'Кто не успел, тот опоздал — решайте немедленно.',
];
// нейтраль (veto НЕ должен ловить)
const NEUTRAL = [
  'Договор подписан вчера, отгрузка в среду по графику.',
  'Вода кипит при ста градусах при нормальном давлении.',
];

const log = (s) => process.stdout.write(s + '\n');
const fmt = (a) => a.map((x) => x.toFixed(2)).join(' ');
const embedder = await createEmbedder({ dtype: 'q8' });

async function s(texts) { const o = []; for (const t of texts) o.push(await embedder.classify(t, H_DISTRESS)); return o; }

log('\n' + '═'.repeat(78));
log('  Ahimsa veto: детектор дистресса · 2026-06-10');
log('═'.repeat(78));

const d = await s(DISTRESS), m = await s(MANIP), n = await s(NEUTRAL);
log(`\n  Гипотеза: "${H_DISTRESS}"`);
log(`    дистресс:   ${fmt(d)}   (min ${Math.min(...d).toFixed(2)})`);
log(`    манипуляция: ${fmt(m)}   (max ${Math.max(...m).toFixed(2)})`);
log(`    нейтраль:   ${fmt(n)}   (max ${Math.max(...n).toFixed(2)})`);

const sepM = Math.min(...d) - Math.max(...m);
const sepN = Math.min(...d) - Math.max(...n);
log(`\n    разделение дистресс↔манипуляция: ${sepM >= 0 ? '+' : ''}${sepM.toFixed(3)} ${sepM > 0 ? '✓' : '✗'}`);
log(`    разделение дистресс↔нейтраль:    ${sepN >= 0 ? '+' : ''}${sepN.toFixed(3)} ${sepN > 0 ? '✓' : '✗'}`);

const thr = sepM > 0 ? (Math.min(...d) + Math.max(...m)) / 2 : Math.min(...d);
log('\n' + '═'.repeat(78));
if (sepM > 0.05 && sepN > 0.05) {
  log(`  ✓ Veto РАБОТАЕТ. Порог ${thr.toFixed(2)}: дистресс выше → подавить флаг манипуляции.`);
} else {
  log(`  ✗ Veto через одну NLI слаб (sepM=${sepM.toFixed(2)}). Дистресс требует composite/контекста.`);
}
log('═'.repeat(78) + '\n');
