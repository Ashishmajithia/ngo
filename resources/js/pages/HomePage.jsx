import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ImpactStats } from '../components/ImpactStats';
import { About } from '../components/About';
import { Programs } from '../components/Programs';
import { Approach } from '../components/Approach';
import { FieldCentersSection } from '../components/FieldCentersSection';
import { Gallery } from '../components/Gallery';
import { BlogSection } from '../components/BlogSection';
import { SupportSection } from '../components/SupportSection';
import { Footer } from '../components/Footer';
import { DonateModal } from '../components/DonateModal';
import { GalleryModal } from '../components/GalleryModal';
import { ToastNotification } from '../components/ToastNotification';
import { WhatsAppFloatingButton } from '../components/WhatsAppFloatingButton';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#183a35]">
      <Header />
      <Hero />
      <ImpactStats />
      <About />
      <Programs />
      <Approach />
      <FieldCentersSection />
      <Gallery />
      <BlogSection />
      <SupportSection />
      <Footer />
      <DonateModal />
      <GalleryModal />
      <ToastNotification />
      <WhatsAppFloatingButton />
    </main>
  );
}
