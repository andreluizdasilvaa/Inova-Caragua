'use client';

import React, { useState, useEffect } from 'react';
import { Occurrence, Asset } from '@/types';
import { TriageSidebar } from '@/components/TriageSidebar';
import { Header } from '@/components/Header';
import { TriagemView } from '@/components/views/TriagemView';
import { OcorrenciasView } from '@/components/views/OcorrenciasView';
import { signOut, useSession } from 'next-auth/react';

export default function TriageDashboard() {
  const { data: session } = useSession();

  // Global Interactive Databases kept in React State
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Fetch real assets and occurrences on mount
  useEffect(() => {
    fetch('/api/itens')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAssets(data);
        }
      })
      .catch(err => console.error('Error fetching items:', err));

    fetch('/api/ocorrencias')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOccurrences(data);
        }
      })
      .catch(err => console.error('Error fetching occurrences:', err));
  }, []);

  // Active View Router
  const [currentView, setView] = useState<string>('triagem');

  // Selected detail items
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);

  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handlers
  const handleUpdateOccurrence = (updated: Occurrence) => {
    setOccurrences((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

    // Also update selectedOccurrence state to sync right panel
    if (selectedOccurrence?.id === updated.id) {
      setSelectedOccurrence(updated);
    }
  };

  const handleRegisterOccurrence = (occurrence: Occurrence) => {
    setOccurrences((prev) => [occurrence, ...prev]);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sidebar - Fixed size with responsive toggling */}
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <TriageSidebar
          currentView={currentView}
          setView={(view) => {
            setView(view);
            setSidebarOpen(false);
          }}
          session={session}
          onLogout={handleLogout}
        />
      </div>

      {/* Main layout container offsetting the fixed sidebar (left-60) */}
      <div className="md:pl-60 min-h-screen flex flex-col">

        {/* Top Navbar */}
        <Header
          session={session}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable screen body */}
        <main className="flex-1 p-4 mt-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {currentView === 'triagem' && (
              <TriagemView
                occurrences={occurrences}
                selectedOccurrence={selectedOccurrence}
                setSelectedOccurrence={setSelectedOccurrence}
                onUpdateOccurrence={handleUpdateOccurrence}
              />
            )}

            {currentView === 'ocorrencias' && (
              <OcorrenciasView
                occurrences={occurrences}
                setView={setView}
                setSelectedOccurrence={setSelectedOccurrence}
                onUpdateOccurrence={handleUpdateOccurrence}
                canEditOwn={true}
                canEditPriority={true}
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}