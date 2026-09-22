export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface TitledItem {
  title: string;
  body: string;
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    appTitle: string;
  };
  common: {
    brand: string;
    login: string;
    openApp: string;
    logout: string;
    account: string;
    support: string;
    back: string;
    loading: string;
    language: string;
    /** Greets a buyer who lands on the sales page again. */
    alreadyMember: string;
  };
  landing: {
    hero: {
      eyebrow: string;
      titleStart: string;
      titleEm: string;
      titleEnd: string;
      subtitle: string;
      body: string;
      cta: string;
      microcopy: string[];
    };
    evenIf: { title: string; items: string[] };
    story: { title: string; paragraphs: string[] };
    mistake: { title: string; paragraphs: string[] };
    secret: { eyebrow: string; title: string; intro: string; bullets: TitledItem[]; outro: string };
    fit: { title: string; yesTitle: string; yes: string[]; noTitle: string; no: string[]; closing: string };
    why: { title: string; paragraphs: string[] };
    steps: { title: string; intro: string; items: TitledItem[]; outro: string };
    experience: { title: string; items: TitledItem[]; closing: string };
    testimonials: { title: string; items: { name: string; text: string }[] };
    included: { title: string; subtitle: string; items: TitledItem[] };
    pricing: {
      eyebrow: string;
      title: string;
      todayLabel: string;
      priceFallback: string;
      cta: string;
      secure: string;
      /** Warns what shows on the card statement, so buyers don't dispute it. */
      statement: string;
      bullets: string[];
    };
    guarantee: { title: string; body: string; cta: string };
    faq: { title: string; items: FaqItem[] };
    close: { title: string; paragraphs: string[]; cta: string };
    footer: {
      terms: string;
      privacy: string;
      refund: string;
      support: string;
      rights: string;
      fbDisclaimer: string;
      healthDisclaimer: string;
      alreadyBought: string;
    };
  };
  consent: {
    title: string;
    body: string;
    accept: string;
    reject: string;
    learnMore: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    sentTitle: string;
    sentBody: string;
    sentHint: string;
    resend: string;
    tooSoon: string;
    invalidEmail: string;
    genericError: string;
    expiredTitle: string;
    expiredBody: string;
    noPurchase: string;
    termsNotice: string;
    buyInstead: string;
  };
  blocked: {
    title: string;
    body: string;
    cta: string;
  };
  app: {
    greeting: string;
    subtitleWithName: string;
    subtitleNoName: string;
    streakStart: string;
    streakDay: string;
    onboarding: {
      eyebrow: string;
      titleStart: string;
      titleEm: string;
      titleEnd: string;
      body: string;
      ingredients: [string, string, string, string];
      seeRecipe: string;
      skip: string;
    };
    recipe: {
      eyebrow: string;
      title: string;
      ingredients: { name: string; role: string }[];
      prepTitle: string;
      prepBody: string;
      whyTitle: string;
      whyBody: string;
      disclaimer: string;
    };
    home: {
      markDone: string;
      markDoneHint: string;
      done: string;
      doneHint: string;
      routineTitle: string;
      water: string;
      honey: string;
      screenOff: string;
      doneLabel: string;
      notYet: string;
      tonight: string;
      ariaDone: string;
      ariaMark: string;
    };
    soon: {
      eyebrow: string;
      title: string;
      items: { glyph: string; tag: string; label: string }[];
      body: string;
      back: string;
    };
    nav: { home: string; recipe: string; soon: string; account: string };
    install: { title: string; body: string; dismiss: string };
    syncError: string;
  };
  account: {
    title: string;
    subtitle: string;
    emailLabel: string;
    languageLabel: string;
    remindersTitle: string;
    remindersBody: string;
    remindersOn: string;
    remindersOff: string;
    dataTitle: string;
    dataBody: string;
    exportCta: string;
    deleteTitle: string;
    deleteBody: string;
    deleteCta: string;
    deleteConfirm: string;
    deleteConfirmWord: string;
    deleteInputLabel: string;
    deleted: string;
    saved: string;
    legalTitle: string;
    logout: string;
  };
  support: {
    title: string;
    body: string;
    emailLabel: string;
    faqTitle: string;
    items: FaqItem[];
  };
  legal: {
    updatedAt: string;
    terms: { title: string; sections: LegalSection[] };
    privacy: { title: string; sections: LegalSection[] };
    refund: { title: string; sections: LegalSection[] };
  };
  thanks: {
    /** Shown when the buyer was signed in automatically on return from checkout. */
    readyEyebrow: string;
    readyTitle: string;
    readyBody: string;
    readyCta: string;
    readyKeepAccess: string;
    /** Shown when the payment is still settling (boleto, bank transfer). */
    pendingTitle: string;
    pendingBody: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: string[];
    emailHint: string;
    resendTitle: string;
    resendBody: string;
    resendCta: string;
    resendSent: string;
    spamHint: string;
    openApp: string;
  };
  vsl: {
    eyebrow: string;
    title: string;
    subtitle: string;
    unmute: string;
    ctaHint: string;
    fullPage: string;
  };
  sticky: {
    label: string;
    cta: string;
  };
  exit: {
    title: string;
    body: string;
    cta: string;
    dismiss: string;
  };
  email: {
    welcome: { subject: string; title: string; body: string; cta: string; expires: string; footer: string };
    login: { subject: string; title: string; body: string; cta: string; expires: string; footer: string };
    reminder: { subject: string; title: string; body: string; cta: string; footer: string };
    /** Onboarding sequence sent N days after purchase (day 1, 2, 3, 5, 6). */
    sequence: { day: number; subject: string; title: string; body: string; cta: string }[];
    sequenceFooter: string;
  };
  notFound: { title: string; body: string; cta: string };
}
