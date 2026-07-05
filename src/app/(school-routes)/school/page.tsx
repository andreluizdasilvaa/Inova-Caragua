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
import { NovoAtivoView } from '@/components/views/NovoAtivoView';
import { signOut, useSession } from 'next-auth/react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Carregando sessão...</p>
      </div>
    </div>
  );
}

export default function SchoolPage() {
  const { data: session, status } = useSession()

  // Active View Router - must come before early return
  const [currentView, setView] = useState<string>('dashboard');

  // Local state for occurrences (to allow priority editing)
  const [schoolOccurrencesState, setSchoolOccurrences] = useState<Occurrence[]>([]);
  
  // Selected detail items
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All hooks must be called before any conditional return
  // Get the user's instituicaoId from session
  const instituicaoId = session?.user?.instituicaoId || null;

  // Filter occurrences and assets by the user's institution only
  const schoolOccurrences = useMemo<Occurrence[]>(() => {
    if (!instituicaoId) return [];
    return mockOccurrences.filter(o => o.instituicaoId === instituicaoId);
  }, [instituicaoId]);

  // Sync local state with filtered data
  React.useEffect(() => {
    if (schoolOccurrences.length > 0 && schoolOccurrencesState.length === 0) {
      setSchoolOccurrences(schoolOccurrences);
    }
  }, [schoolOccurrences, schoolOccurrencesState.length]);

  const schoolAssets = useMemo<Asset[]>(() => {
    if (!instituicaoId) return [];
    return mockAssets.filter(a => a.instituicaoId === instituicaoId);
  }, [instituicaoId]);

  // Find school info from mock data
  const schoolInfo = useMemo(() => {
    if (!instituicaoId) return null;
    return mockSchoolStats.find(s => s.instituicaoId === instituicaoId) || null;
  }, [instituicaoId]);

  // Now safe to do early return for loading state
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

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

  const handleRegisterAsset = (asset: Asset) => {
    // In a real app, this would be saved to the DB
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSetView = (view: string) => {
    // School users must NOT access triagem
    if (view === 'triagem') return;
    setView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Fixed size with responsive toggling */}
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <SchoolSidebar
          currentView={currentView}
          setView={(view) => {
            handleSetView(view);
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
                occurrences={schoolOccurrencesState.length > 0 ? schoolOccurrencesState : schoolOccurrences}
                setView={handleSetView}
                setSelectedOccurrence={setSelectedOccurrence}
                onUpdateOccurrence={(updated) => {
                  setSchoolOccurrences((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
                }}
                canEditOwn={true}
              />
            )}

            {currentView === 'inventario' && (
              <InventarioView
                assets={schoolAssets}
                setView={handleSetView}
                setSelectedAsset={setSelectedAsset}
              />
            )}

            {currentView === 'lote' && (
              <LoteView
                assets={schoolAssets}
                setView={handleSetView}
                onGenerateBatch={handleGenerateBatch}
                instituicaoId={instituicaoId || undefined}
                userRole="ESCOLA"
                instituicaoNome={schoolInfo?.nomeInstituicao}
              />
            )}

            {currentView === 'detalhes' && (
              <DetalhesView
                asset={selectedAsset}
                setView={handleSetView}
              />
            )}

            {currentView === 'nova-ocorrencia' && (
              <NovaOcorrenciaView
                assets={schoolAssets}
                occurrences={schoolOccurrences}
                setView={handleSetView}
                onRegisterOccurrence={handleRegisterOccurrence}
                editingOccurrence={selectedOccurrence}
              />
            )}

            {currentView === 'novo-ativo' && (
              <NovoAtivoView
                setView={handleSetView}
                onRegisterAsset={handleRegisterAsset}
                userRole="ESCOLA"
                instituicaoId={instituicaoId || undefined}
                instituicaoNome={schoolInfo?.nomeInstituicao}
                editingAsset={selectedAsset}
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}