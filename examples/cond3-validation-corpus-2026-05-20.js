/**
 * Condition-3 validation corpus — CROSS-TYPE manipulation samples — 2026-05-20.
 * Pre-registration: docs/VALIDATION-COND3-PREREG-2026-05-20.md
 *
 * Purpose: validate the 4-layer manipulation model's stacked two-axis
 * taxonomy (Vulnerability x Technique) on content spanning 5 TYPES — not the
 * news-narrow corpus of trigger #1b. NOT a detector test.
 *
 * Every item is a real, documented manipulative artifact. `text` is verbatim.
 * Sourcing is mixed (see prereg amendments log):
 *   - dark-* : direct WebFetch from deceptive.design (catalogue-certified).
 *   - others : verbatim string as quoted in a reliable secondary source
 *              (regulator / journalism / consumer-protection), recovered via
 *              WebSearch. `via` records this. Two steps removed — disclosed.
 *
 * Fields:
 *   id    — stable id
 *   type  — marketing | scam | dark-pattern | health | politics
 *   text  — VERBATIM manipulative string
 *   unit  — pitch-phrase | full-message | lure-phrase | ui-copy | claim
 *   cert  — who labelled it manipulative: FTC | catalogue | journalism | consumer-protection
 *   via   — webfetch-direct | websearch-snippet
 *   source / url — where the verbatim string was read
 *
 * Tags (Vulnerability x Technique) are NOT in this file — they are the
 * first-pass tagging artifact: docs/VALIDATION-COND3-TAGGING-2026-05-20.md.
 * USER ADJUDICATION of those tags is the binding step (Condition 3).
 *
 * SHA-256: to be captured after the user adjudication pass.
 */

export const PULLED_AT = '2026-05-20';

export const CORPUS = [
  // ── A · MARKETING / SALES (MLM & biz-opp pitch copy) ──
  { id: 'mkt-01', type: 'marketing', unit: 'pitch-phrase', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'travellingjezebel.com — "12 MLM Phrases"', url: 'https://travellingjezebel.com/marketing-buzzwords/',
    text: `Be your own boss!` },
  { id: 'mkt-02', type: 'marketing', unit: 'full-message', cert: 'journalism', via: 'websearch-snippet',
    source: 'HuffPost — "9 Signs That Exciting New Job Opportunity Is Really An MLM Scam"', url: 'https://www.huffpost.com/entry/job-opportunity-mlm-scam-pyramid-scheme_l_5e30c62ec5b6e8375f647a5e',
    text: `I need 30 people who want to join my 'team' -- must be self-starter and motivated!` },
  { id: 'mkt-03', type: 'marketing', unit: 'pitch-phrase', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'travellingjezebel.com — "12 MLM Phrases"', url: 'https://travellingjezebel.com/marketing-buzzwords/',
    text: `It's going to happen with or without you!` },
  { id: 'mkt-04', type: 'marketing', unit: 'pitch-phrase', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'travellingjezebel.com — "12 MLM Phrases"', url: 'https://travellingjezebel.com/marketing-buzzwords/',
    text: `Ground-floor opportunity` },
  { id: 'mkt-05', type: 'marketing', unit: 'pitch-phrase', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'travellingjezebel.com — "12 MLM Phrases"', url: 'https://travellingjezebel.com/marketing-buzzwords/',
    text: `Residual income!` },
  { id: 'mkt-06', type: 'marketing', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'TruthInAdvertising.org — "Deceptive Income Claims" (FTC-flagged language)', url: 'https://truthinadvertising.org/blog/deceptive-income-claims-how-not-to-market-your-mlm-business/',
    text: `enjoy more time and financial freedom` },

  // ── B · SCAM ──
  { id: 'scam-01', type: 'scam', unit: 'full-message', cert: 'journalism', via: 'websearch-snippet',
    source: 'Malwarebytes — "USPS smishing scam"', url: 'https://www.malwarebytes.com/blog/news/2022/04/usps-your-package-could-not-be-delivered-text-is-a-smishing-scam',
    text: `[U.S. Postal Service] We're sorry to let you know that your package could not be delivered. To reschedule a delivery please visit [bit(dot)ly]` },
  { id: 'scam-02', type: 'scam', unit: 'full-message', cert: 'journalism', via: 'webfetch-direct',
    source: 'Wikipedia — "Advance-fee scam" (Vidocq, c.1830 variant)', url: 'https://en.wikipedia.org/wiki/Advance-fee_scam',
    text: `Sir, you will doubtlessly be astonished to be receiving a letter from a person unknown to you, who is about to ask a favour from you` },
  { id: 'scam-03', type: 'scam', unit: 'full-message', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'ConsumerFraudReporting.org — lottery scam sample list', url: 'https://www.consumerfraudreporting.org/lotterysamplelist.php',
    text: `We are pleased to inform you of the result of the just concluded final draws of De Lotto Netherlands International Lottery programs. The online cyber lotto draws was conducted from an exclusive list of 25,000 e-mail addresses. No tickets were sold. Your e-mail address emerged as one of two winners in the category 'A'` },
  { id: 'scam-04', type: 'scam', unit: 'lure-phrase', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'Michigan.gov Consumer Protection — Grandparent/Family Emergency Scam', url: 'https://www.michigan.gov/consumerprotection/protect-yourself/consumer-alerts/scams/grandparent-family-emergency-scam',
    text: `Hi Grandma, it's me!` },
  { id: 'scam-05', type: 'scam', unit: 'full-message', cert: 'consumer-protection', via: 'websearch-snippet',
    source: 'Michigan.gov Consumer Protection — Grandparent/Family Emergency Scam', url: 'https://www.michigan.gov/consumerprotection/protect-yourself/consumer-alerts/scams/grandparent-family-emergency-scam',
    text: `Please don't tell Mom or Dad, they would kill me if they knew about this mess!` },
  { id: 'scam-06', type: 'scam', unit: 'lure-phrase', cert: 'journalism', via: 'websearch-snippet',
    source: 'TMJ4 — "Beware of account suspended scams"', url: 'https://www.tmj4.com/call4action/beware-of-account-suspended-scams',
    text: `your account has been suspended` },

  // ── C · UX DARK PATTERNS (deceptive.design, catalogue-certified, direct WebFetch) ──
  { id: 'dark-01', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Hall of Shame (Arc Browser)', url: 'https://www.deceptive.design/hall-of-shame',
    text: `No, I want to type in all my passwords again` },
  { id: 'dark-02', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Hall of Shame (Carvana)', url: 'https://www.deceptive.design/hall-of-shame',
    text: `I choose to decline coverage and continue` },
  { id: 'dark-03', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Hall of Shame (HP Printer)', url: 'https://www.deceptive.design/hall-of-shame',
    text: `We've alerted you multiple times that this printer had non-Original HP cartridges installed. This is your final notice to fix the issue` },
  { id: 'dark-04', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Confirmshaming (MyMedic, 2018)', url: 'https://www.deceptive.design/types/confirmshaming',
    text: `No, I prefer to bleed to death` },
  { id: 'dark-05', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Hall of Shame (Phosus, pre-checked box)', url: 'https://www.deceptive.design/hall-of-shame',
    text: `I would like to receive updates through the newsletter` },
  { id: 'dark-06', type: 'dark-pattern', unit: 'ui-copy', cert: 'catalogue', via: 'webfetch-direct',
    source: 'deceptive.design — Hall of Shame (RAC.co.uk, cancellation)', url: 'https://www.deceptive.design/hall-of-shame',
    text: `So much self-serve is possible online, but not that.` },

  // ── D · HEALTH / WELLNESS (FTC enforcement, certified-deceptive) ──
  { id: 'hlth-01', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC press release — Amberen / Lunada Biomedical (2015)', url: 'https://www.ftc.gov/news-events/news/press-releases/2015/05/ftc-charges-marketers-misleading-claims-their-supplement-causes-weight-loss-fat-loss-increased',
    text: `Amberen restores hormonal balance naturally, so the weight can just fall right off. Even that stubborn belly fat` },
  { id: 'hlth-02', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC press release — Amberen / Lunada Biomedical (2015)', url: 'https://www.ftc.gov/news-events/news/press-releases/2015/05/ftc-charges-marketers-misleading-claims-their-supplement-causes-weight-loss-fat-loss-increased',
    text: `the ONLY product on the market today clinically proven to cause sustained weight loss for women over 40` },
  { id: 'hlth-03', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC action — ZyCal Bioscience (2023)', url: 'https://www.ftc.gov/news-events/topics/truth-advertising/health-claims',
    text: `contains a biologically active protein complex proven for 40 years and used clinically for 20 years to grow bone` },
  { id: 'hlth-04', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC action — Thrive supplement (COVID-19 health-fraud)', url: 'https://www.ftc.gov/news-events/topics/truth-advertising/health-claims',
    text: `anti-viral wellness booster` },
  { id: 'hlth-05', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC press release — Iovate Health Sciences (2010)', url: 'https://www.ftc.gov/news-events/news/press-releases/2010/07/dietary-supplement-maker-pay-55-million-settle-ftc-false-advertising-charges',
    text: `Cold MD and Germ MD treat or prevent colds and flu` },
  { id: 'hlth-06', type: 'health', unit: 'claim', cert: 'FTC', via: 'websearch-snippet',
    source: 'FTC settlement — Supple LLC infomercials (2017)', url: 'https://www.ftc.gov/news-events/topics/truth-advertising/health-claims',
    text: `expert endorsements from Dr. Monita Poudyal` },

  // ── E · POLITICS (deceptive fundraising copy, journalism-documented) ──
  { id: 'pol-01', type: 'politics', unit: 'full-message', cert: 'journalism', via: 'websearch-snippet',
    source: 'WBUR — political fundraising text surge', url: 'https://www.wbur.org/news/2024/08/01/text-message-surge-fundraising-election-biden-trump-harris',
    text: `I'm begging. Will you GRADE Joe Biden's CNN Debate?` },
  { id: 'pol-02', type: 'politics', unit: 'full-message', cert: 'journalism', via: 'webfetch-direct',
    source: 'MS NOW (MSNBC opinion) — backfiring fundraising emails/texts', url: 'https://www.ms.now/opinion/msnbc-opinion/democrats-fundraising-emails-texts-donations-rcna183963',
    text: `You have blood on your hands.` },
  { id: 'pol-03', type: 'politics', unit: 'lure-phrase', cert: 'journalism', via: 'webfetch-direct',
    source: 'MS NOW (MSNBC opinion) — fundraising email subject line', url: 'https://www.ms.now/opinion/msnbc-opinion/democrats-fundraising-emails-texts-donations-rcna183963',
    text: `coffee today?` },
  { id: 'pol-04', type: 'politics', unit: 'lure-phrase', cert: 'journalism', via: 'webfetch-direct',
    source: 'MS NOW (MSNBC opinion) — fundraising email subject line', url: 'https://www.ms.now/opinion/msnbc-opinion/democrats-fundraising-emails-texts-donations-rcna183963',
    text: `Update from Dad.` },
  { id: 'pol-05', type: 'politics', unit: 'full-message', cert: 'journalism', via: 'webfetch-direct',
    source: 'MS NOW (MSNBC opinion) — fundraising text', url: 'https://www.ms.now/opinion/msnbc-opinion/democrats-fundraising-emails-texts-donations-rcna183963',
    text: `Our records show you're voting for Trump` },
];
