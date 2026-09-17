import { SiteContent } from '@/types/content';

export const emptyContent: SiteContent = {
  brand: {
    name: '',
    tagline: '',
    email: '',
    phone: '',
    location: '',
    primaryCtaText: '',
    logo: '',
    logoStyle: 'icon_text',
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
