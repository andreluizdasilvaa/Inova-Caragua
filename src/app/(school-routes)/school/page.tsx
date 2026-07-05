'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, Asset, mockOccurrences, mockAssets, mockSchoolStats } from '@/mockData';
import { SchoolSidebar } from '@/components/SchoolSidebar';
import { Header } from '@/components/Header';
import { SchoolDashboardView } from '@/components/views/SchoolDashboardView';
import { InventarioView } from '@/components/views/InventarioView';
import { OcorrenciasView } from '@/components/views/OcorrenciasView';
import { LoteView } from '@/components/views/LoteView';
import { DetalhesView } from '@/components/views/DetalhesView';
import { NovaOcorrenciaView } from '@/components/views/NovaOcorrenciaView';
import { signOut, useSession } from 'next-auth/react';

export default function SchoolPage() {
  const { data: session } = useSession()

  // Get the user's instituicaoId from session
  const instituicaoId = session?.user?.instituicaoId || null;

  console.log("user", session?.user)

  // Filter occurrences and assets by the user's institution only
  const schoolOccurrences = useMemo<Occurrence[]>(() => {
    if (!instituicaoId) return [];
    return mockOccurrences.filter(o => o.instituicaoId === instituicaoId);
  }, [instituicaoId]);

  const schoolAssets = useMemo<Asset[]>(() => {
    if (!instituicaoId) return [];
    return mockAssets.filter(a => a.instituicaoId === instituicaoId);
  }, [instituicaoId]);

  // Find school info from mock data
  const schoolInfo = useMemo(() => {

    console.log(instituicaoId)

    if (!instituicaoId) return null;
    return mockSchoolStats.find(s => s.instituicaoId === instituicaoId) || null;
  }, [instituicaoId]);

  // Active View Router
  const [currentView, setView] = useState<string>('dashboard');

  // Selected detail items
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(schoolAssets[0] || null);

  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handlers
  const handleUpdateOccurrence = (updated: Occurrence) => {
    // For school users we don't need triagem update, but keep the pattern
  };

  const handleGenerateBatch = (newAssets: Asset[]) => {
    // In a real app, these would be saved to the DB
  };

  const handleRegisterOccurrence = (occurrence: Occurrence) => {
    // In a real app, this would be saved to the DB
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Fixed size with responsive toggling */}
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <SchoolSidebar
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
            {currentView === 'dashboard' && (
              <SchoolDashboardView
                occurrences={schoolOccurrences}
                assets={schoolAssets}
                schoolName={schoolInfo?.nomeInstituicao || 'Minha Escola'}
              />
            )}

            {currentView === 'ocorrencias' && (
              <OcorrenciasView
                occurrences={schoolOccurrences}
                setView={(view) => {
                  // School users MUST NOT access triagem; redirect to detail if clicked
                  if (view === 'triagem') {
                    // Stay on ocorrencias view - school users cannot access triagem
                    return;
                  }
                  setView(view);
                }}
                setSelectedOccurrence={setSelectedOccurrence}
              />
            )}

            {currentView === 'inventario' && (
              <InventarioView
                assets={schoolAssets}
                setView={setView}
                setSelectedAsset={setSelectedAsset}
              />
            )}

            {currentView === 'lote' && (
              <LoteView
                assets={schoolAssets}
                setView={setView}
                onGenerateBatch={handleGenerateBatch}
                instituicaoId={instituicaoId || undefined}
              />
            )}

            {currentView === 'detalhes' && (
              <DetalhesView
                asset={selectedAsset}
                setView={setView}
              />
            )}

            {currentView === 'nova-ocorrencia' && (
              <NovaOcorrenciaView
                assets={schoolAssets}
                occurrences={schoolOccurrences}
                setView={setView}
                onRegisterOccurrence={handleRegisterOccurrence}
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}