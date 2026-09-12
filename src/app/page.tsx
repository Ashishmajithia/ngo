'use client';

import React from 'react';
import { ContentProvider } from '@/context/ContentContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ImpactStats } from '@/components/ImpactStats';
import { About } from '@/components/About';
import { Programs } from '@/components/Programs';
import { Approach } from '@/components/Approach';
import { Gallery } from '@/components/Gallery';
import { SupportSection } from '@/components/SupportSection';
import { Footer } from '@/components/Footer';
import { DonateModal } from '@/components/DonateModal';
import { GalleryModal } from '@/components/GalleryModal';
import { AdminDrawer } from '@/components/AdminDrawer';
import { ToastNotification } from '@/components/ToastNotification';

export default function Home() {
  return (
    <ContentProvider>
      <div className="site-shell min-h-screen bg-[#fffdf8]">
        <Header />
        <main>
          <Hero />
          <ImpactStats />
          <About />
          <Programs />
          <Approach />
          <Gallery />
          <SupportSection />
        </main>
        <Footer />

        {/* Dynamic Modals & Overlay Drawers */}
        <DonateModal />
        <GalleryModal />
        <AdminDrawer />
        <ToastNotification />
      </div>
    </ContentProvider>
  );
}
