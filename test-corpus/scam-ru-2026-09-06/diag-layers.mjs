/**
 * Диагностика: почему ни один слой не дал сигнала на 100 текстах.
 * Исключения НЕ глотаются — печатаются. Проверка: на заведомо манипулятивном тексте
 * хотя бы один слой обязан сработать; если нет — печатается ПРОВАЛ.
 */
const ROOT = 'file:///C:/ProjectS/pantheon-guard/dist';
const s = await import(`${ROOT}/index.mjs`);
const e = await import(`${ROOT}/experimental.mjs`);

const text = 'Срочно! Ваша карта заблокирована, осталось 15 минут. Переведите деньги на резервный счёт, иначе потеряете всё. Никому не говорите.';
console.log('текст:', text.slice(0, 60) + '…\n');

const probe = (name, fn) => {
  try {
    const r = fn();
    console.log(`${name.padEnd(22)} →`, JSON.stringify(r)?.slice(0, 220));
  } catch (err) {
    console.log(`${name.padEnd(22)} ✗ ОШИБКА: ${err.message.split('\n')[0]}`);
  }
};

probe('inspect', () => { const r = s.inspect(text); return { passes: r.passes, keys: Object.keys(r) }; });
probe('extractActions', () => s.extractActions(text));
probe('assessActionRequest', () => s.assessActionRequest({ text, actions: s.extractActions(text) }));
probe('applyPack(news)', () => { const r = s.applyPack(s.newsPack)(text); return { passes: r.passes, unmet: r.unmetRequirements?.length, keys: Object.keys(r) }; });
probe('detectAntahksura', () => e.detectAntahksura({ text, actionSignals: ['transfer'], harmSignal: true }));
probe('detectInfocyganstvo', () => e.detectInfocyganstvo(text));
probe('explainIdioms', () => e.explainIdioms(text).length);
probe('hasDistress', () => e.hasDistress(text));

console.log('\n=== что вообще экспортируется ===');
console.log('stable:', Object.keys(s).filter(k => /inspect|extract|assess|applyPack|Pack$/.test(k)).join(', '));
console.log('experimental:', Object.keys(e).join(', '));
