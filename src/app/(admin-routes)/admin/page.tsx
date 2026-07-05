'use client';

import React, { useState } from 'react';
import { Occurrence, Asset } from '@/mockData';
import { mockOccurrences, mockAssets } from '@/mockData';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { OcorrenciasView } from '@/components/views/OcorrenciasView';
import { TriagemView } from '@/components/views/TriagemView';
import { InventarioView } from '@/components/views/InventarioView';
import { LoteView } from '@/components/views/LoteView';
import { DetalhesView } from '@/components/views/DetalhesView';
import { NovaOcorrenciaView } from '@/components/views/NovaOcorrenciaView';
import { NovoAtivoView } from '@/components/views/NovoAtivoView';
import { MapaCalorView } from '@/components/views/MapaCalorView';
import { signOut, useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession()

  // Global Interactive Databases kept in React State
  const [occurrences, setOccurrences] = useState<Occurrence[]>(mockOccurrences);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  // Active View Router
  const [currentView, setView] = useState<string>('dashboard');

  // Selected detail items
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(mockOccurrences[0]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(mockAssets[0]);

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

  const handleGenerateBatch = (newAssets: Asset[]) => {
    setAssets((prev) => [...newAssets, ...prev]);
  };

  const handleRegisterOccurrence = (occurrence: Occurrence) => {
    setOccurrences((prev) => [occurrence, ...prev]);
  };

  const handleRegisterAsset = (asset: Asset) => {
    setAssets((prev) => {
      const exists = prev.find((a) => a.id === asset.id);
      if (exists) {
        return prev.map((a) => (a.id === asset.id ? asset : a));
      }
      return [asset, ...prev];
    });
    setSelectedAsset(null);
  };

  // Wrapper que limpa selectedAsset se não estiver vindo de detalhes
  const navigateToView = (view: string) => {
    if (view === 'novo-ativo' && currentView !== 'detalhes') {
      setSelectedAsset(null); // Fresh form
    }
    setView(view);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sidebar - Fixed size with responsive toggling */}
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar
          currentView={currentView}
          setView={(view) => {
            // Clear selectedAsset when navigating away from detalhes/novo-ativo
            if (view !== 'novo-ativo' && view !== 'detalhes') {
              setSelectedAsset(null);
            }
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
              <DashboardView
                occurrences={occurrences}
                assets={assets}
                setView={navigateToView}
                setSelectedOccurrence={setSelectedOccurrence}
              />
            )}

            {currentView === 'ocorrencias' && (
              <OcorrenciasView
                occurrences={occurrences}
                setView={navigateToView}
                setSelectedOccurrence={setSelectedOccurrence}
              />
            )}

            {currentView === 'triagem' && (
              <TriagemView
                occurrences={occurrences}
                selectedOccurrence={selectedOccurrence}
                setSelectedOccurrence={setSelectedOccurrence}
                onUpdateOccurrence={handleUpdateOccurrence}
              />
            )}

            {currentView === 'inventario' && (
              <InventarioView
                assets={assets}
                setView={navigateToView}
                setSelectedAsset={setSelectedAsset}
              />
            )}

            {currentView === 'lote' && (
              <LoteView
                assets={assets}
                setView={navigateToView}
                onGenerateBatch={handleGenerateBatch}
                userRole="MESTRE"
              />
            )}

            {currentView === 'detalhes' && (
              <DetalhesView
                asset={selectedAsset}
                setView={navigateToView}
              />
            )}

            {currentView === 'nova-ocorrencia' && (
              <NovaOcorrenciaView
                assets={assets}
                occurrences={occurrences}
                setView={navigateToView}
                onRegisterOccurrence={handleRegisterOccurrence}
              />
            )}

            {currentView === 'novo-ativo' && (
              <NovoAtivoView
                setView={navigateToView}
                onRegisterAsset={handleRegisterAsset}
                userRole="MESTRE"
                editingAsset={selectedAsset}
              />
             )}
              
            {currentView === 'mapa-calor' && (
              <MapaCalorView />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}