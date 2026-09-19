import { SiteContent } from '@/types/content';

export const emptyContent: SiteContent = {
  brand: {
    name: 'ACT Charitable Trust',
    tagline: 'Rising Hope for Children',
    email: '',
    phone: '',
    location: '',
    primaryCtaText: 'Donate & Support',
    logo: '',
    logoStyle: 'icon_text',
    regNo: 'REG.NO.220',
    whatsappNumber: '',
    whatsappGreeting: 'Hello ACT Charitable Trust! I want to support your mission and learn more about your initiatives.',
    enableWhatsappButton: true,
  },
  hero: {
    ctaText: '',
    slides: [],
  },
  impactStats: [],
  about: {
    eyebrow: '',
    title: '',
    copyOne: '',
    copyTwo: '',
    ctaText: '',
    image: '',
    badgeTitle: '',
    badgeCopy: '',
  },
  programs: {
    eyebrow: '',
    title: '',
    copy: '',
    items: [],
  },
  approach: {
    eyebrow: '',
    title: '',
    copy: '',
    image: '',
    principles: [],
  },
  gallery: {
    eyebrow: '',
    title: '',
    copy: '',
    items: [],
  },
  support: {
    eyebrow: '',
    title: '',
    copy: '',
    image: '',
    ctaText: '',
  },
  payment: {
    qrCodeImage: '',
    upiId: '',
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    instructions: '',
    enableQrDonation: false,
  },
};

export const defaultContent: SiteContent = emptyContent;
