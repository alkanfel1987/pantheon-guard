/**
 * HELD-OUT clickbait corpus · pulled 2026-05-15
 *
 * ⚠ GENERALIZATION-GAP TEST CORPUS — DO NOT use to author or tune patterns.
 *
 * The clickbait pack v0.0.x was authored against BuzzFeed + Bored Panda
 * entries. This corpus is pulled from THREE SOURCES THE PACK HAS NEVER
 * SEEN — Upworthy, Bright Side, Distractify — to measure whether the
 * detectors capture real structural patterns or merely overfit the
 * authoring corpus.
 *
 * Generalization Gap (GG) = catch-rate(in-corpus) − catch-rate(held-out).
 * In-corpus reference: 84% (21/25) on buzzfeed2026 + boredpanda subset.
 *
 * Labels assigned by source-based external rule BEFORE running the pack:
 *   - Bright Side: pure numeric-listicle farm → all CATCH (unambiguous)
 *   - Upworthy: "positive viral" — mixed; curiosity-gap / numeric-listicle
 *     / engineered-virality marker → CATCH; straight informative → PASS
 *   - Distractify: celebrity coverage — curiosity-gap / loaded framing →
 *     CATCH; straight factual celebrity report → PASS
 *
 * Honest note: held-out labeling has more borderline cases than the
 * in-corpus set. Borderline calls erred toward PASS (conservative — a
 * borderline-PASS that the pack catches counts against us as FP).
 */

export const HELDOUT = [
  // ───── Bright Side (15) — pure listicle farm, all CATCH
  { src: 'brightside', label: 'BS kindness weaves humanity',
    text: "10 Moments That Reveal How Children's Kindness Quietly Weaves Humanity Together",
    expected: 'catch' },
  { src: 'brightside', label: 'BS forgiveness lost light',
    text: '10 Moments That Teach Us Forgiveness Can Bring Back Lost Light',
    expected: 'catch' },
  { src: 'brightside', label: 'BS quiet kindness happiness',
    text: '10 Moments That Teach Us Quiet Kindness and Compassion Still Lead to Happiness in 2026',
    expected: 'catch' },
  { src: 'brightside', label: 'BS 16 acts of kindness',
    text: '16 Acts of Kindness From Family That Prove Compassion Still Holds the World Together',
    expected: 'catch' },
  { src: 'brightside', label: 'BS kids teach humanity',
    text: '10 Kids That Teach Humanity Better Than Adults This Week',
    expected: 'catch' },
  { src: 'brightside', label: 'BS kindness back to hope',
    text: '11 Moments That Prove Kindness and Compassion Can Lead Us Back to Hope',
    expected: 'catch' },
  { src: 'brightside', label: 'BS family stories healing',
    text: '11 Family Stories That Prove Quiet Kindness Opens the Door to Healing',
    expected: 'catch' },
  { src: 'brightside', label: 'BS pets save broken soul',
    text: 'Top 11 Pets Who Proved Kindness Successfully Can Save a Broken Soul',
    expected: 'catch' },
  { src: 'brightside', label: 'BS heart of every family',
    text: '15 Moments That Prove Kindness, Compassion, and Love Are the Heart of Every Family',
    expected: 'catch' },
  { src: 'brightside', label: 'BS grandma house stay',
    text: "14 Quiet Moments From Grandma's House That Prove Some Places Stay With Us Forever",
    expected: 'catch' },
  { src: 'brightside', label: 'BS family love shield',
    text: '10 Times Quiet Family Love Became the Shield Nobody Knew Was There',
    expected: 'catch' },
  { src: 'brightside', label: 'BS kindness lights hearts',
    text: '12 Moments That Teach Us Quiet Family Kindness Still Lights Up Hearts',
    expected: 'catch' },
  { src: 'brightside', label: 'BS kindness change day',
    text: "12 Moments That Show How Quiet Kindness Can Change Someone's Entire Day",
    expected: 'catch' },
  { src: 'brightside', label: 'BS kids light dark times',
    text: "14 Stories That Prove Kids' Kindness Lights the Way in Dark Times",
    expected: 'catch' },
  { src: 'brightside', label: 'BS empathy great parenting',
    text: '14 Stories That Teach Us Why Quiet Empathy Is the Heart of Great Parenting',
    expected: 'catch' },

  // ───── Upworthy (15) — positive-viral, mixed (10 CATCH + 5 PASS)
  { src: 'upworthy', label: 'UW 60-second trick',
    text: 'How to avoid sounding long-winded in conversations with this 60-second trick',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW Tennessee student speech',
    text: 'Tennessee student stands up to school board with a speech after a member called her hot',
    expected: 'pass' },
  { src: 'upworthy', label: 'UW deGrasse Tyson aliens',
    text: 'Upworthy exclusive: Neil deGrasse Tyson on the best way to make first contact with aliens',
    expected: 'pass' },
  { src: 'upworthy', label: 'UW Knight Rider ticket',
    text: "The Knight Rider car somehow got a speeding ticket even though owners swear it hasn't moved in years",
    expected: 'catch' },
  { src: 'upworthy', label: 'UW 9 colonial words',
    text: "9 fascinating Colonial-era words to brush up on for America's 250th birthday",
    expected: 'catch' },
  { src: 'upworthy', label: 'UW Dostoevsky one habit',
    text: 'Fyodor Dostoevsky shared one powerful habit necessary to lead an authentic life',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW mom 19 gems',
    text: "Mom shares 19 gems of knowledge for her daughter's 19th birthday",
    expected: 'catch' },
  { src: 'upworthy', label: 'UW foolproof picky kids',
    text: 'Nutrition expert demonstrates foolproof method to get her picky kids to eat anything',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW Eric Church speech',
    text: "Eric Church's guitar-as-life metaphor commencement speech strikes a universal chord",
    expected: 'pass' },
  { src: 'upworthy', label: 'UW nanoplastics alarming',
    text: 'Scientists tested 3 popular bottled water brands for nanoplastics. The results are alarming.',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW bubbles cleft',
    text: 'How Bubbles Help Kids with Cleft Conditions',
    expected: 'pass' },
  { src: 'upworthy', label: 'UW masterclass parenting',
    text: 'His daughter crashed on a skate ramp, and his response was a masterclass in awesome parenting',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW kitten velociraptor',
    text: 'Kitten named Duck learns to run on two legs and she looks like an adorable velociraptor',
    expected: 'pass' },
  { src: 'upworthy', label: 'UW wedding dress viral',
    text: 'She bought the perfect wedding dress that went viral on TikTok, for $3.75',
    expected: 'catch' },
  { src: 'upworthy', label: 'UW homeless ashes',
    text: "A homeless man returns a pet dog's stolen ashes to their owner. It's changing his life.",
    expected: 'catch' },

  // ───── Distractify (15) — celebrity coverage, mixed (6 CATCH + 9 PASS)
  { src: 'distractify', label: 'DF Willow Smith scoop',
    text: "Are the Willow Smith Baby Rumors True? Here's the Scoop on the Chatter",
    expected: 'catch' },
  { src: 'distractify', label: 'DF Trump nickname',
    text: 'The Chinese Nickname for President Trump Is Unsurprisingly Pretty Mean',
    expected: 'catch' },
  { src: 'distractify', label: 'DF Bonnie Tyler rumors',
    text: "Bonnie Tyler's Family Shuts Down Rumors as Health Battle Continues",
    expected: 'pass' },
  { src: 'distractify', label: 'DF Gia Giudice marriage',
    text: 'Gia Giudice Talks Marriage Plans With Boyfriend and Pregnancy Rumors',
    expected: 'pass' },
  { src: 'distractify', label: 'DF Gia Giudice restaurant',
    text: 'Gia Giudice Is Opening a New Restaurant With a Modern Italian Twist',
    expected: 'pass' },
  { src: 'distractify', label: 'DF Rob Rausch overalls',
    text: 'Rob Rausch Says an Overalls Fashion Line Feels Too Gimmicky',
    expected: 'pass' },
  { src: 'distractify', label: 'DF marriage bites dust',
    text: 'Another Marriage Bites the Dust: Jason Biggs and His Wife Have Broken Up',
    expected: 'catch' },
  { src: 'distractify', label: 'DF Kelly Reilly husband',
    text: "Who Is Yellowstone Star Kelly Reilly's Husband? Inside Her Marriage",
    expected: 'catch' },
  { src: 'distractify', label: 'DF Drake album diss',
    text: "Drake's New Album Features a LeBron James Diss",
    expected: 'pass' },
  { src: 'distractify', label: 'DF Belmont Cameli girlfriend',
    text: "Fans of Belmont Cameli Are Asking — Who Is the Actor's New Girlfriend?",
    expected: 'catch' },
  { src: 'distractify', label: 'DF Taylor Holder tour',
    text: 'Taylor Holder Abruptly Canceled His Tour To Focus On His Mental Health',
    expected: 'pass' },
  { src: 'distractify', label: 'DF Off Campus season 2',
    text: 'Off Campus Season 2 Is Coming, But Fans Still Have Release Date Questions',
    expected: 'pass' },
  { src: 'distractify', label: 'DF Shea McGuire arrest',
    text: "Shea McGuire's 2021 Arrest Resurfaces After 90 Day Fiance Debut",
    expected: 'pass' },
  { src: 'distractify', label: 'DF Taylor Sheridan spinoff',
    text: "Taylor Sheridan Was Not Involved in the Yellowstone Spinoff — Here's Why",
    expected: 'catch' },
  { src: 'distractify', label: 'DF Flash Shelton squatters',
    text: 'Flash Shelton Frustrating Experiences With Squatters Led Him to Host the Series',
    expected: 'pass' },
];
