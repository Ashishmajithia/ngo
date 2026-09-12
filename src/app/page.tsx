'use client';

import React, { useState } from 'react';
import { ContentProvider } from '@/context/ContentContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ImpactStats } from '@/components/ImpactStats';
import { About } from '@/components/About';
import { Programs } from '@/components/Programs';
import { Approach } from '@/components/Approach';
import { BlogSection } from '@/components/BlogSection';
import { BlogModal } from '@/components/BlogModal';
import { SupportSection } from '@/components/SupportSection';
import { Footer } from '@/components/Footer';
import { DonateModal } from '@/components/DonateModal';
import { AdminDrawer } from '@/components/AdminDrawer';
import { ToastNotification } from '@/components/ToastNotification';
import { BlogPost } from '@/types/blog';

export default function Home() {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

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
          {/* Moments Of Hope - Impact Stories & Blog Engine */}
          <BlogSection
            onSelectBlog={(blog) => setSelectedBlog(blog)}
          />
          <SupportSection />
        </main>
        <Footer />

        {/* Dynamic Modals & Overlay Drawers */}
        <DonateModal />
        <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
        <AdminDrawer />
        <ToastNotification />
      </div>
    </ContentProvider>
  );
}
