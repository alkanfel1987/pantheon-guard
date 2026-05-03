import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LAYERS, GUNAS } from '../src/constants.js';
import { wrapAgent } from '../src/wrap-agent.js';

const validAgent = {
  name: 'Варуна',
  svadharma: {
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'комплаенс, правовые риски, аудит',
    svabhava: 'объективный страж',
  },
};

const cleanAction = {
  text: 'Спокойный правовой алерт с источником',
  urgency: 0.3,
  paused: true,
  sources: ['pravo.gov.ru'],
  currentGuna: 'Саттва',
  intrinsicValue: true,
  danaType: 'abhaya',
  targetLayer: LAYERS.ADITYA,
  targetKarma: 'правовые риски',
};

test('wrapAgent: missing agent throws', () => {
  assert.throws(() => wrapAgent(), TypeError);
  assert.throws(() => wrapAgent(null), TypeError);
});

test('wrapAgent: agent without svadharma throws', () => {
  assert.throws(() => wrapAgent({ name: 'X' }), TypeError);
});

test('wrapAgent: clean action is allowed and executor runs', async () => {
  let calls = 0;
  const safe = wrapAgent(validAgent);
  const r = await safe.act(cleanAction, async (a) => {
    calls += 1;
    return `executed:${a.text}`;
  });
  assert.equal(r.allowed, true);
  assert.equal(calls, 1);
  assert.equal(r.output, 'executed:Спокойный правовой алерт с источником');
});

test('wrapAgent: Mahavrata violation blocks before executor', async () => {
  let calls = 0;
  const safe = wrapAgent(validAgent);
  const r = await safe.act(
    {
      ...cleanAction,
      urgency: 0.95, paused: false,
      contains: { falseUrgency: true, fearBased: true },
    },
    async () => { calls += 1; return 'should-not-run'; }
  );
  assert.equal(r.allowed, false);
  assert.equal(calls, 0);
  assert.match(r.reason, /ahimsa|indriya/);
  assert.equal(r.result.failedStep, 'mahavrata');
});

test('wrapAgent: Svadharma violation blocks with descriptive reason', async () => {
  const safe = wrapAgent(validAgent);
  const r = await safe.act(
    { ...cleanAction, targetLayer: LAYERS.KRIYA },
    async () => 'should-not-run'
  );
  assert.equal(r.allowed, false);
  assert.match(r.reason, /Svadharma/);
});

test('wrapAgent: missing executor throws when action passes', async () => {
  const safe = wrapAgent(validAgent);
  await assert.rejects(
    () => safe.act(cleanAction, undefined),
    TypeError
  );
});

test('wrapAgent: result object always carries the underlying check details', async () => {
  const safe = wrapAgent(validAgent);
  const ok = await safe.act(cleanAction, async () => 'x');
  assert.ok(ok.result, 'result present on allowed path');
  assert.equal(ok.result.passes, true);

  const blocked = await safe.act(
    { ...cleanAction, urgency: 0.95, paused: false, contains: { falseUrgency: true } },
    async () => 'x'
  );
  assert.ok(blocked.result, 'result present on blocked path');
  assert.equal(blocked.result.passes, false);
});
