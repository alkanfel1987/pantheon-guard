// Tests for src/compliance/eu-article50.js
//
// EU AI Act Article 50 — обязательная маркировка AI-контента в зонах
// общественного интереса. В силе с 02.08.2026.
//
// HONEST FRAMING: unit-уровень, synthetic corpus, паттерны проверяются изолированно.
// Эти тесты — sanity / regression guard, не accuracy claim.
// Author = test-author. Real-corpus probe pending.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  detectLabel,
  classifyPublicInterest,
  checkAttribution,
  assessComplianceRisk,
  checkCompliance,
} from '../src/compliance/eu-article50.js';

// ─────────────────────────────────────────────
// M1: detectLabel — детектор AI-раскрытия + позиция
// ─────────────────────────────────────────────

test('M1: label found in headline → position = title', () => {
  const r = detectLabel('AI-generated analysis of the market', '');
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'title');
  assert.ok(r.matchedPattern, 'matchedPattern must not be null');
});

test('M1: label found in title of body (RU) → position = title', () => {
  const r = detectLabel('Сгенерировано AI: обзор рынка за июль', '');
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'title');
});

test('M1: label at top of body (first 20%) → position = top_of_body', () => {
  // 50-char prefix, затем метка, total ~120 char — метка в первых 20%
  const prefix = 'Эта статья была подготовлена с использованием AI. ';
  const body = prefix + 'A'.repeat(200);
  const r = detectLabel('Новости рынка', body);
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'top_of_body');
});

test('M1: label buried deep in body (>20%) → position = buried', () => {
  const padding = 'X'.repeat(500);
  const body = padding + ' Этот текст был написан при помощи ИИ. Продолжение...';
  const r = detectLabel('Заголовок', body);
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'buried');
});

test('M1: no label at all → position = missing', () => {
  const r = detectLabel('Новости дня', 'Компания объявила о результатах квартала.');
  assert.equal(r.labelFound, false);
  assert.equal(r.labelPosition, 'missing');
  assert.equal(r.matchedPattern, null);
});

test('M1: DE label (KI-erstellt) fires in headline', () => {
  const r = detectLabel('KI-erstellt: Marktbericht Q3', '');
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'title');
});

test('M1: FR label (généré par IA) fires in body top', () => {
  const body = 'Cet article a été généré par IA. ' + 'Z'.repeat(300);
  const r = detectLabel('Rapport hebdomadaire', body);
  assert.equal(r.labelFound, true);
  assert.equal(r.labelPosition, 'top_of_body');
});

// ─────────────────────────────────────────────
// M2: classifyPublicInterest — домены
// ─────────────────────────────────────────────

test('M2: elections domain fires on RU keyword', () => {
  const r = classifyPublicInterest('Итоги выборов', 'Явка составила 68%, кандидаты оспаривают результаты.');
  assert.equal(r.isPublicInterest, true);
  assert.ok(r.domains.includes('elections'));
});

test('M2: finance domain fires on EN keywords', () => {
  const r = classifyPublicInterest('Stock market rally', 'Investors saw strong dividend returns on bond portfolios.');
  assert.equal(r.isPublicInterest, true);
  assert.ok(r.domains.includes('finance'));
});

test('M2: health domain fires on mixed', () => {
  const r = classifyPublicInterest('', 'Patient received diagnosis and started vaccine treatment.');
  assert.equal(r.isPublicInterest, true);
  assert.ok(r.domains.includes('health'));
});

test('M2: legal domain fires on RU', () => {
  const r = classifyPublicInterest('Суд вынес приговор', 'Прокурор потребовал ареста фигурантов дела.');
  assert.ok(r.domains.includes('legal'));
});

test('M2: science domain fires on EN climate keywords', () => {
  const r = classifyPublicInterest('', 'Scientists warn about rising emissions and global warming.');
  assert.ok(r.domains.includes('science'));
});

test('M2: multiple domains detected simultaneously', () => {
  const text = 'Election results show impact on stock market investment.';
  const r = classifyPublicInterest(text, '');
  assert.ok(r.domains.includes('elections'), 'elections expected');
  assert.ok(r.domains.includes('finance'), 'finance expected');
  assert.ok(r.domains.length >= 2);
});

test('M2: neutral text → isPublicInterest = false, domains = []', () => {
  const r = classifyPublicInterest('Рецепт борща на 4 порции', 'Нарежьте свёклу и морковь кубиками.');
  assert.equal(r.isPublicInterest, false);
  assert.deepEqual(r.domains, []);
});

// ─────────────────────────────────────────────
// M3: checkAttribution — редакционная атрибуция
// ─────────────────────────────────────────────

test('M3: "by Author" attribution detected', () => {
  const r = checkAttribution('Market Review', 'Analysis by John Smith, senior correspondent.');
  assert.equal(r.hasAttribution, true);
});

test('M3: RU "автор:" attribution detected', () => {
  const r = checkAttribution('', 'Автор: Иван Петров, специальный корреспондент.');
  assert.equal(r.hasAttribution, true);
});

test('M3: press release marker detected', () => {
  const r = checkAttribution('', 'Пресс-служба компании сообщает о результатах.');
  assert.equal(r.hasAttribution, true);
});

test('M3: editorial team attribution detected (EN)', () => {
  const r = checkAttribution('', 'Prepared by our editorial team.');
  assert.equal(r.hasAttribution, true);
});

test('M3: plain AI-generated text without attribution → false', () => {
  const r = checkAttribution('Market outlook', 'The stock market showed strong performance this week.');
  assert.equal(r.hasAttribution, false);
});

// ─────────────────────────────────────────────
// M4: assessComplianceRisk — матрица риска
// ─────────────────────────────────────────────

test('M4: LOW — not public interest', () => {
  const r = assessComplianceRisk({ isPublicInterest: false, labelPosition: 'missing' });
  assert.equal(r.complianceRisk, 'LOW');
});

test('M4: LOW — public, label at title', () => {
  const r = assessComplianceRisk({ isPublicInterest: true, labelPosition: 'title' });
  assert.equal(r.complianceRisk, 'LOW');
});

test('M4: LOW — public, label at top_of_body', () => {
  const r = assessComplianceRisk({ isPublicInterest: true, labelPosition: 'top_of_body' });
  assert.equal(r.complianceRisk, 'LOW');
});

test('M4: MEDIUM — public + buried label', () => {
  const r = assessComplianceRisk({ isPublicInterest: true, labelPosition: 'buried' });
  assert.equal(r.complianceRisk, 'MEDIUM');
});

test('M4: HIGH — public + missing label, no GUARD failure', () => {
  const r = assessComplianceRisk({ isPublicInterest: true, labelPosition: 'missing', guardFailed: false });
  assert.equal(r.complianceRisk, 'HIGH');
});

test('M4: CRITICAL — public + missing label + guardFailed', () => {
  const r = assessComplianceRisk({ isPublicInterest: true, labelPosition: 'missing', guardFailed: true });
  assert.equal(r.complianceRisk, 'CRITICAL');
  assert.match(r.rationale, /Art\.5.*Art\.50|Art\.50.*Art\.5/);
});

// ─────────────────────────────────────────────
// checkCompliance — интеграция M1+M2+M3+M4
// ─────────────────────────────────────────────

test('checkCompliance: CRITICAL — elections + no label + guardFailed', () => {
  const r = checkCompliance(
    {
      headline: 'Итоги выборов: кандидаты подают иски',
      body: 'Явка на избирательных участках составила рекордные 72%. ' + 'A'.repeat(200),
    },
    { guardFailed: true }
  );
  assert.equal(r.complianceRisk, 'CRITICAL');
  assert.equal(r.isPublicInterest, true);
  assert.ok(r.domains.includes('elections'));
  assert.equal(r.labelFound, false);
  assert.equal(r.labelPosition, 'missing');
});

test('checkCompliance: HIGH — health + no label, no guard failure', () => {
  const r = checkCompliance({
    headline: 'Новый вакцинный препарат прошёл клинические испытания',
    body: 'Пациенты в 12 странах получили дозу без серьёзных симптомов.',
  });
  assert.equal(r.complianceRisk, 'HIGH');
  assert.equal(r.isPublicInterest, true);
  assert.ok(r.domains.includes('health'));
  assert.equal(r.labelPosition, 'missing');
});

test('checkCompliance: MEDIUM — finance + buried label', () => {
  const padding = 'P'.repeat(500);
  const r = checkCompliance({
    headline: 'Инвестиционный портфель: доходность за квартал',
    body: padding + ' Материал создан с помощью AI.',
  });
  assert.equal(r.complianceRisk, 'MEDIUM');
  assert.equal(r.labelPosition, 'buried');
  assert.ok(r.domains.includes('finance'));
});

test('checkCompliance: LOW — label at title, public topic', () => {
  const r = checkCompliance({
    headline: 'AI-generated: Election Forecast for 2026',
    body: 'Polling models show candidate A leading with 54% in key districts.',
  });
  assert.equal(r.complianceRisk, 'LOW');
  assert.equal(r.labelPosition, 'title');
  assert.equal(r.labelFound, true);
});

test('checkCompliance: LOW — non-public topic, no label', () => {
  const r = checkCompliance({
    headline: 'Топ-10 рецептов итальянской кухни',
    body: 'Паста карбонара — классическое блюдо из яиц и панчетты.',
  });
  assert.equal(r.complianceRisk, 'LOW');
  assert.equal(r.isPublicInterest, false);
});

test('checkCompliance: m1/m2/m3/m4 sub-results present in output', () => {
  const r = checkCompliance({ headline: 'Тест', body: 'Просто текст.' });
  assert.ok('m1' in r, 'm1 sub-result must be present');
  assert.ok('m2' in r, 'm2 sub-result must be present');
  assert.ok('m3' in r, 'm3 sub-result must be present');
  assert.ok('m4' in r, 'm4 sub-result must be present');
  // m1 fields
  assert.ok('labelFound' in r.m1);
  assert.ok('labelPosition' in r.m1);
  // m2 fields
  assert.ok('isPublicInterest' in r.m2);
  assert.ok('domains' in r.m2);
  // m3 fields
  assert.ok('hasAttribution' in r.m3);
  // m4 fields
  assert.ok('complianceRisk' in r.m4);
  assert.ok('rationale' in r.m4);
});

test('checkCompliance: top-level fields mirror sub-results', () => {
  const r = checkCompliance({
    headline: 'Investment strategy for 2026',
    body: 'This analysis was written by AI. ' + 'B'.repeat(300),
  });
  assert.equal(r.complianceRisk, r.m4.complianceRisk);
  assert.equal(r.labelFound, r.m1.labelFound);
  assert.equal(r.labelPosition, r.m1.labelPosition);
  assert.equal(r.isPublicInterest, r.m2.isPublicInterest);
  assert.deepEqual(r.domains, r.m2.domains);
  assert.equal(r.hasAttribution, r.m3.hasAttribution);
});

test('checkCompliance: empty inputs do not throw', () => {
  assert.doesNotThrow(() => checkCompliance({ headline: '', body: '' }));
  assert.doesNotThrow(() => checkCompliance({}));
});

test('checkCompliance: label in body top_of_body with public topic → LOW', () => {
  const body = 'Создано с помощью AI. ' + 'Акции выросли на фоне новостей о доходности инвестиций. '.repeat(10);
  const r = checkCompliance({ headline: 'Рынок акций', body });
  assert.equal(r.complianceRisk, 'LOW');
  assert.equal(r.labelPosition, 'top_of_body');
  assert.ok(r.domains.includes('finance'));
});
