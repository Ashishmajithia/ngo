import { SiteContent } from '@/types/content';

// Zero hardcoded slides, programs, or gallery items.
// Everything is 100% dynamic from the live database.
export const emptyContent: SiteContent = {
  brand: {
    name: 'ACT Charitable Trust',
    tagline: 'Rising Hope for Children',
    email: '',
    phone: '',
    location: '',
    primaryCtaText: 'Donate & Support',
    logo: '/uploads/act_official_logo.jpg',
    logoStyle: 'full',
    regNo: 'REG.NO.220',
    whatsappNumber: '',
    whatsappGreeting: '',
    enableWhatsappButton: true,
  },
  hero: {
    ctaText: 'Donate & Support',
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
  approach: {
    eyebrow: '',
    title: '',
    copy: '',
    image: '',
    principles: [],
  },
  programs: {
    eyebrow: '',
    title: '',
    copy: '',
    items: [],
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
    qrCodeImage: '/uploads/payment_qr_code.jpg',
    upiId: '',
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    instructions: '',
    enableQrDonation: true,
  },
  fieldCenters: [],
};

export const defaultContent: SiteContent = emptyContent;
