/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { LightboxModal } from './components/LightboxModal';
import { CatchDetailModal } from './components/CatchDetailModal';
import { SpotMapModal } from './components/SpotMapModal';
import { BathymetryModal } from './components/BathymetryModal';
import { WorkstationScreen } from './screens/WorkstationScreen';
import { LogsScreen } from './screens/LogsScreen';
import { PlanScreen } from './screens/PlanScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { MediaScreen } from './screens/MediaScreen';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Viewport */}
      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface max-w-md mx-auto shadow-sm">
        {activeTab === 'home' && <WorkstationScreen />}
        {activeTab === 'logs' && <LogsScreen />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'insights' && <InsightsScreen />}
        {activeTab === 'media' && <MediaScreen />}
      </main>

      {/* Pinned Bottom Nav */}
      <Navbar />

      {/* Global Modals & Notifications */}
      <Toast />
      <LightboxModal />
      <CatchDetailModal />
      <SpotMapModal />
      <BathymetryModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
