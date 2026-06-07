import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPack,
  stackPacks,
  validatePack,
  runPack,
} from '../src/packs/index.js';
import { newsPack } from '../src/packs/news.js';

// ─────────────────────────────────────────────
// validatePack
// ─────────────────────────────────────────────

test('validatePack: newsPack is well-formed', () => {
  assert.equal(validatePack(newsPack), true);
});

// ─────────────────────────────────────────────
// runPack — clickbait family → satya
// ─────────────────────────────────────────────

test('runPack: catches "shocking secret" → satya', () => {
  const r = runPack(newsPack, 'The shocking secret behind their success.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('shocking_secret_en')));
});

test('runPack: catches RU "шокирующая правда" → satya', () => {
  const r = runPack(newsPack, 'Шокирующая правда о новой реформе.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('shocking_secret_ru')));
});

test('runPack: catches "secret nobody knows" → satya', () => {
  const r = runPack(newsPack, 'The shocking secret nobody knows — what they don\'t want you to see, exposed!');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('secret_nobody_knows_en')));
});

test('runPack: catches "they don\'t want you to know" → satya', () => {
  const r = runPack(newsPack, 'This is what they don\'t want you to know about the deal.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('they_dont_want_en')));
});

test('runPack: catches RU "скрывают от народа" → satya', () => {
  const r = runPack(newsPack, 'Это скрывают от народа уже много лет.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('they_dont_want_ru')));
});

test('runPack: catches "you won\'t believe" → satya', () => {
  const r = runPack(newsPack, 'You won\'t believe what happened next at the meeting.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('you_wont_believe_en')));
});

test('runPack: catches RU "вы не поверите" → satya', () => {
  const r = runPack(newsPack, 'Вы не поверите, что произошло на заседании.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('you_wont_believe_ru')));
});

test('runPack: catches "о чём молчат СМИ" → satya', () => {
  const r = runPack(newsPack, 'Раскрыто, то о чём молчат СМИ.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('media_silence_ru')));
});

test('runPack: catches EN media-silence frame → satya', () => {
  const r = runPack(newsPack, 'Here is what the mainstream media won\'t tell you about it.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('media_silence_en')));
});

test('runPack: catches "doctors hate this" → satya', () => {
  const r = runPack(newsPack, 'Doctors hate this one weird trick for losing weight.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('experts_hate_en')));
});

test('runPack: catches RU "эксперты ненавидят" → satya', () => {
  const r = runPack(newsPack, 'Эксперты ненавидят это простое решение.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('experts_hate_ru')));
});

test('runPack: catches "exposed!" with bang → satya', () => {
  const r = runPack(newsPack, 'The truth, finally exposed!');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('exposed_bang_en')));
});

test('runPack: plain "exposed in court documents" does NOT fire exposed_bang', () => {
  const r = runPack(newsPack, 'The fraud was exposed in court documents filed Tuesday.');
  assert.equal(
    r.packViolations.filter(v => v.source.includes('exposed_bang_en')).length,
    0,
    'exposed without bang should be neutral'
  );
});

test('runPack: catches "this will change everything" → satya', () => {
  const r = runPack(newsPack, 'This new discovery will change everything we know about physics.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('change_everything_en')));
});

test('runPack: catches RU "это изменит мир" → satya', () => {
  const r = runPack(newsPack, 'Это изменит мир в ближайшие годы.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('change_everything_ru')));
});

// ─────────────────────────────────────────────
// runPack — anonymous attribution → asteya
// ─────────────────────────────────────────────

test('runPack: catches "sources say" without name → asteya', () => {
  const r = runPack(newsPack, 'Sources say the deal is collapsing this week.');
  assert.ok(r.packViolations.some(v => v.rule === 'asteya' && v.source.includes('sources_say_en')));
});

test('runPack: "sources say" WITH named outlet does NOT fire', () => {
  const r = runPack(
    newsPack,
    'Sources say, according to Jane Smith of the New York Times, the deal is finalised.'
  );
  assert.equal(
    r.packViolations.filter(v => v.source.includes('sources_say_en')).length,
    0,
    'named-outlet attribution should suppress sources_say'
  );
});

test('runPack: catches RU "инсайдеры сообщают" → asteya', () => {
  const r = runPack(newsPack, 'Инсайдеры сообщают о готовящейся отставке министра.');
  assert.ok(r.packViolations.some(v => v.rule === 'asteya' && v.source.includes('sources_say_ru')));
});

test('runPack: catches "according to reports" without source → asteya', () => {
  const r = runPack(newsPack, 'According to reports, the company will fold next quarter.');
  assert.ok(r.packViolations.some(v => v.rule === 'asteya' && v.source.includes('according_to_reports_en')));
});

test('runPack: catches RU "по данным анонимных источников" → asteya', () => {
  const r = runPack(newsPack, 'По данным анонимных источников, готовится новый закон.');
  assert.ok(r.packViolations.some(v => v.rule === 'asteya' && v.source.includes('data_says_ru')));
});

// ─────────────────────────────────────────────
// runPack — panic + before-deletion
// ─────────────────────────────────────────────

test('runPack: catches "panic spreads" → ahimsa', () => {
  const r = runPack(newsPack, 'Panic spreads across markets after the announcement.');
  assert.ok(r.packViolations.some(v => v.rule === 'ahimsa' && v.source.includes('panic_frame_en')));
});

test('runPack: catches RU "паника охватила" → ahimsa', () => {
  const r = runPack(newsPack, 'Паника охватила инвесторов на открытии торгов.');
  assert.ok(r.packViolations.some(v => v.rule === 'ahimsa' && v.source.includes('panic_frame_ru')));
});

test('runPack: catches "before it\'s deleted" → indriya_nigraha', () => {
  const r = runPack(newsPack, 'Watch this before it\'s deleted from YouTube!');
  assert.ok(r.packViolations.some(v => v.rule === 'indriya_nigraha' && v.source.includes('before_deleted_en')));
});

test('runPack: catches RU "пока не удалили" → indriya_nigraha', () => {
  const r = runPack(newsPack, 'Смотри пока не удалили, это правда о выборах.');
  assert.ok(r.packViolations.some(v => v.rule === 'indriya_nigraha' && v.source.includes('before_deleted_ru')));
});

// ─────────────────────────────────────────────
// runPack — clean / negative-control passes
// ─────────────────────────────────────────────

test('runPack: clean news lede with named source passes', () => {
  const r = runPack(
    newsPack,
    'Reuters reported on Tuesday that the central bank raised rates by 25 basis points, citing Governor Lagarde\'s prepared statement.'
  );
  assert.equal(r.packViolations.length, 0, `expected 0 violations, got: ${JSON.stringify(r.packViolations)}`);
});

test('runPack: hedged analytical paragraph passes', () => {
  const r = runPack(
    newsPack,
    'According to a Bloomberg analysis published last week, several factors may explain the slowdown, though analysts caution that the data is preliminary.'
  );
  assert.equal(r.packViolations.length, 0, `expected 0 violations, got: ${JSON.stringify(r.packViolations)}`);
});

test('runPack: clean RU news with attribution passes', () => {
  const r = runPack(
    newsPack,
    'По сообщению ТАСС, председатель совета директоров Иван Петров подтвердил перенос заседания на следующую неделю.'
  );
  assert.equal(r.packViolations.length, 0, `expected 0 violations, got: ${JSON.stringify(r.packViolations)}`);
});

test('runPack: non-news marketing dashboard text bypasses pack', () => {
  const r = runPack(
    newsPack,
    'The marketing dashboard renders weekly reports and supports custom date ranges.'
  );
  assert.equal(r.packViolations.length, 0);
});

// ─────────────────────────────────────────────
// applyPack — REGRESSION: solo-clickbait fixtures from REAL-WORLD-DOMAIN-TESTS
// ─────────────────────────────────────────────

test('applyPack: REGRESSION — EN solo-clickbait stack now blocked', () => {
  const inspectNews = applyPack(newsPack);
  const r = inspectNews(
    'The shocking secret nobody knows — what they don\'t want you to see, exposed!',
    { urgency: 0.3, paused: true }
  );
  assert.equal(r.passes, false, 'solo-clickbait stack must now block under news pack');
  assert.ok(r.packViolations.length >= 2,
    `expected ≥2 pack violations on stacked clickbait, got ${r.packViolations.length}`);
});

test('applyPack: REGRESSION — RU solo-clickbait stack now blocked', () => {
  const inspectNews = applyPack(newsPack);
  const r = inspectNews(
    'Шок! Раскрыто, то о чём молчат СМИ — секрет, который скрывают от народа.',
    { urgency: 0.3, paused: true }
  );
  assert.equal(r.passes, false, 'RU solo-clickbait stack must now block under news pack');
  assert.ok(r.packViolations.length >= 2,
    `expected ≥2 pack violations on stacked clickbait, got ${r.packViolations.length}`);
});

test('applyPack: REGRESSION — mixed-script bypass also caught after normalization', () => {
  // Cyrillic homoglyphs for Latin letters in "The shocking secret nobody knows"
  // (т=Cyrillic Т, е=Cyrillic е, etc.)
  const inspectNews = applyPack(newsPack);
  const r = inspectNews(
    'Тhe shocking sеcret nobody knows — exposеd!',
    { urgency: 0.3, paused: true }
  );
  assert.equal(r.passes, false, 'homoglyph bypass must be defeated by normalize.js');
  assert.ok(r.packViolations.length >= 1);
});

// ─────────────────────────────────────────────
// applyPack — clean text path
// ─────────────────────────────────────────────

test('applyPack: clean attributed news passes end-to-end', () => {
  const inspectNews = applyPack(newsPack);
  const r = inspectNews(
    'Reuters reported on Tuesday that the central bank raised rates by 25 basis points.',
    { urgency: 0.2, paused: true }
  );
  assert.equal(r.passes, true);
  assert.equal(r.packViolations.length, 0);
  assert.equal(r.pack.id, 'news');
});

test('applyPack: pack-violations route through correct mahā-vrata rules', () => {
  const inspectNews = applyPack(newsPack);
  const r = inspectNews(
    'You won\'t believe what insiders are saying — share this before it\'s deleted!',
    { urgency: 0.95, paused: false }
  );
  const rules = new Set(r.packViolations.map(v => v.rule));
  assert.ok(rules.has('satya'),           'you-won\'t-believe should route through satya');
  assert.ok(rules.has('asteya'),          'insiders-say should route through asteya');
  assert.ok(rules.has('indriya_nigraha'), 'before-deleted should route through indriya_nigraha');
});

// ─────────────────────────────────────────────
// stackPacks — composition with other packs
// ─────────────────────────────────────────────

test('stackPacks: news stacks with itself produces double violations on hits', async () => {
  const inspectStack = stackPacks([newsPack, newsPack]);
  const r = inspectStack(
    'You won\'t believe this shocking secret.',
    { urgency: 0.2, paused: true }
  );
  // Each pack independently catches you_wont_believe_en + shocking_secret_en
  const youWontBelieve = r.packViolations.filter(v => v.source.includes('you_wont_believe_en'));
  assert.equal(youWontBelieve.length, 2);
  assert.equal(r.packs.length, 2);
});

test('stackPacks: news + healthcare composition catches medical clickbait', async () => {
  const { healthcarePack } = await import('../src/packs/healthcare.js');
  const inspectStack = stackPacks([newsPack, healthcarePack]);
  const r = inspectStack(
    'Doctors hate this one trick. You definitely have early diabetes — consult a doctor immediately.',
    { urgency: 0.4, paused: true }
  );
  const sources = r.packViolations.map(v => v.source);
  assert.ok(sources.some(s => s.startsWith('news/')),       'news pack should catch experts-hate clickbait');
  assert.ok(sources.some(s => s.startsWith('healthcare/')), 'healthcare pack should catch self-dx claim');
});

// ─────────────────────────────────────────────
// Withheld-resolution / curiosity-gap (EN) — Arthaśāstra investigative protocol:
// the payoff is referenced via a placeholder/reaction but withheld from the
// headline (forces the click). Targets living FN #259/#262/#264/#282.
// ─────────────────────────────────────────────

test('curiosity-gap: reaction-effect withheld ("Has X losing their minds") → satya', () => {
  const r = runPack(newsPack, "Lupita Nyong'o Has Elon Musk And MAGA Absolutely Losing Their Minds");
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('reaction_effect_withheld_en')));
});

test('curiosity-gap: "people are talking about these N" → satya', () => {
  const r = runPack(newsPack, "People Are Talking About These 15 Current Events That Aren't Reaching US Headlines");
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('drama_reaction_en')));
});

test('curiosity-gap: "internet cannot stop talking about X take" → satya', () => {
  const r = runPack(newsPack, "The Internet Cannot Stop Talking About Donald Trump's Chinese Restaurant Take");
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('drama_reaction_en')));
});

test('curiosity-gap: sensational placeholder + reveal verb ("Disturbing Boast Revealed") → satya', () => {
  const r = runPack(newsPack, 'Epstein Survivor Breaks Down As Damning Courtroom Scrutiny Emerges Over Disturbing Boast Revealed In Testimony');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('curiosity_reveal_en')));
});

// Negative controls — must NOT fire (self-contained / factual; relabeled pass).
test('curiosity-gap: self-contained headline (resolution present) is NOT caught', () => {
  const r = runPack(newsPack, 'French President Got Slapped By Wife In Infamous Moment Caught On Camera After She Saw Steamy Texts To Actress');
  assert.ok(!r.packViolations.some(v => v.source.includes('reaction_effect_withheld_en') || v.source.includes('curiosity_reveal_en')));
});

test('curiosity-gap: backed amplifier (TUI flight, concrete act stated) is NOT caught by new rules', () => {
  const r = runPack(newsPack, 'TUI Flight Descends Into Chaos After Drunken Passenger Punches And Bites Flight Attendant During Wild Rampage');
  assert.ok(!r.packViolations.some(v => v.source.includes('reaction_effect_withheld_en') || v.source.includes('curiosity_reveal_en') || v.source.includes('drama_reaction_en')));
});

test('curiosity-gap: factual named-source reveal ("NTSB reveals cause") is NOT caught', () => {
  const r = runPack(newsPack, 'NTSB reveals cause of 2022 Boeing 737 crash in final report');
  assert.ok(!r.packViolations.some(v => v.source.includes('curiosity_reveal_en')));
});
