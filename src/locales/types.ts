export type SupportedLocale = 'en' | 'pt' | 'es'

export interface LocaleInfo {
  code: SupportedLocale
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (BR)',
    flag: '🇧🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
}

export interface Translations {
  common: {
    search: string
    searchPlaceholder: string
    searchKbd: string
    pricing: string
    signIn: string
    signOut: string
    creditsRemaining: string
    credits: string
    unlimited: string
    freeTier: string
    proMember: string
    upgradeToPro: string
    buyCredits: string
    viewAllPricing: string
    copy: string
    copied: string
    clear: string
    download: string
    format: string
    convert: string
    generate: string
    analyze: string
    loading: string
    upload: string
    error: string
    success: string
    backToTools: string
    privacyGuaranteeTitle: string
    privacyGuaranteeDesc: string
    recommended: string
    byokOption: string
    byokDesc: string
    enterApiKey: string
    getFreeApiKey: string
    saveKey: string
    cancel: string
    customApiKeyStoredLocally: string
    dailyFreeQuota: string
    dailyFreeQuotaDesc: string
  }
  sidebar: {
    tools: string
    categories: {
      converters: string
      developer: string
      formatters: string
      generators: string
      ai: string
    }
    allTools: string
    searchTools: string
    quickLinks: string
    brandTagline: string
  }
  header: {
    searchAria: string
    manageSubscription: string
  }
  footer: {
    quickLinks: string
    privacyPolicy: string
    termsOfService: string
    builtWithLove: string
    forDevelopers: string
  }
  pricing: {
    badge: string
    heroTitle: string
    heroDesc: string
    usdTab: string
    brlTab: string
    freeDeveloper: string
    freeDesc: string
    forever: string
    getStartedFree: string
    starterName: string
    starterDesc: string
    buyStarter: string
    powerName: string
    powerDesc: string
    buyPower: string
    proMembershipName: string
    proMembershipDesc: string
    joinPro: string
    proPackName: string
    proPackDesc: string
    buyProPack: string
    heavyUsersAgency: string
    needMassiveVolume: string
    faqTitle: string
    faq1Q: string
    faq1A: string
    faq2Q: string
    faq2A: string
    faq3Q: string
    faq3A: string
    faq4Q: string
    faq4A: string
    paymentSecurity: string
    noHiddenFees: string
  }
}
