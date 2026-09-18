export interface HeroSlide {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  copy: string;
}

export interface ImpactStat {
  id: string;
  stat: string;
  label: string;
  iconName?: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  badgeBg: string;
  badgeTextColor: string;
  gridSpan?: string;
}

export interface PrincipleItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  image: string;
  gridSpan?: string;
}

export interface FieldCenterItem {
  id: string;
  name: string;
  city: string;
  state: string;
  childrenCount: string;
  programs: string[];
  coordinator?: string;
  phone?: string;
  address?: string;
  image?: string;
  mapX: number; // percentage 0-100 on map
  mapY: number; // percentage 0-100 on map
  isActive?: boolean;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  primaryCtaText: string;
  logo?: string;
  logoStyle?: 'full' | 'icon_text';
  logoHeight?: number;
  regNo?: string;
  whatsappNumber?: string;
  whatsappGreeting?: string;
  enableWhatsappButton?: boolean;
}

export interface AboutSectionData {
  eyebrow: string;
  title: string;
  copyOne: string;
  copyTwo: string;
  ctaText: string;
  image: string;
  badgeTitle: string;
  badgeCopy: string;
}

export interface ApproachSectionData {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  principles: PrincipleItem[];
}

export interface SupportSectionData {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  ctaText: string;
}

export interface PaymentConfig {
  qrCodeImage?: string;
  upiId?: string;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  instructions?: string;
  enableQrDonation?: boolean;
}

export interface SiteContent {
  brand: BrandConfig;
  hero: {
    slides: HeroSlide[];
    ctaText: string;
  };
  impactStats: ImpactStat[];
  about: AboutSectionData;
  programs: {
    eyebrow: string;
    title: string;
    copy: string;
    items: ProgramItem[];
  };
  approach: ApproachSectionData;
  gallery: {
    eyebrow: string;
    title: string;
    copy: string;
    items: GalleryItem[];
  };
  fieldCenters?: FieldCenterItem[];
  support: SupportSectionData;
  payment?: PaymentConfig;
  updatedAt?: string;
}
