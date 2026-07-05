'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Occurrence, Asset } from '@/types';
import { api } from '@/lib/api';
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
import { AprovacaoView } from '@/components/views/AprovacaoView';
import { UsuariosView } from '@/components/views/UsuariosView';
import { InstituicoesView } from '@/components/views/InstituicoesView';
import dynamic from 'next/dynamic';
const MapaCalorView = dynamic(() => import('@/components/views/MapaCalorView').then(mod => mod.MapaCalorView), { ssr: false });
import { signOut, useSession } from 'next-auth/react';
import { useLiveUpdate } from '@/hooks/useLiveUpdate';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Use live update hook for 10s polling and security check
  useLiveUpdate(occurrences, setOccurrences);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [occResult] = await Promise.all([
        api.occurrences.list(),
      ]);
      setOccurrences(occResult);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active View Router
  const [currentView, setView] = useState<string>('dashboard');

  // Selected detail items
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handlers
  const handleUpdateOccurrence = useCallback(async (updated: Occurrence) => {
    try {
      const result = await api.occurrences.update(updated.id, {
        status: updated.status,
        prioridade: updated.prioridade,
        tipoSolicitacao: updated.tipoSolicitacao,
        observacoesMestre: updated.observacoesMestre,
        observacoesTriagem: updated.observacoesTriagem,
        dataTriagem: updated.dataTriagem,
        dataAprovacao: updated.dataAprovacao,
        dataConclusao: updated.dataConclusao,
        dataVisitaAgendada: updated.dataVisitaAgendada,
        prestadorServico: updated.prestadorServico,
        triagemPorId: updated.triagemPorId,
        aprovadoPorId: updated.aprovadoPorId,
        motivoRecusa: updated.motivoRecusa,
      });
      setOccurrences((prev) => prev.map((o) => (o.id === result.id ? result : o)));
      if (selectedOccurrence?.id === updated.id) {
        setSelectedOccurrence(result);
      }
    } catch (err) {
      console.error('Error updating occurrence:', err);
    }
  }, [selectedOccurrence]);

  const handleGenerateBatch = useCallback(async (newAssets: Asset[]) => {
    for (const asset of newAssets) {
      try {
        const result = await api.items.create({
          nome: asset.nome,
          categoria: asset.categoria,
          numeroPatrimonio: asset.numeroPatrimonio,
          numeroSerie: asset.numeroSerie,
          marca: asset.marca,
          modelo: asset.modelo,
          estadoConservacao: asset.estadoConservacao,
          status: asset.status,
          dataAquisicao: asset.dataAquisicao?.toISOString(),
          valorAquisicao: asset.valorAquisicao,
          observacoes: asset.observacoes,
          setorId: asset.setorId,
          instituicaoId: asset.instituicaoId,
          cadastradoPorId: asset.cadastradoPorId,
        });
        setAssets((prev) => [result, ...prev]);
      } catch (err) {
        console.error('Error creating asset in batch:', err);
      }
    }
  }, []);

  const handleRegisterOccurrence = useCallback(async (occurrence: Occurrence) => {
    try {
      const isEditing = occurrence.id && !occurrence.id.startsWith('occ_');
      
      if (isEditing) {
        const result = await api.occurrences.update(occurrence.id, {
          titulo: occurrence.titulo,
          descricao: occurrence.descricao,
          tipoSolicitacao: occurrence.tipoSolicitacao,
          localizacaoDescricao: occurrence.localizacaoDescricao,
          numeroPatrimonioTexto: occurrence.numeroPatrimonioTexto,
          itemId: occurrence.itemId,
          prioridade: occurrence.prioridade,
        });
        setOccurrences((prev) => prev.map((o) => (o.id === result.id ? result : o)));
      } else {
        const result = await api.occurrences.create({
          titulo: occurrence.titulo,
          descricao: occurrence.descricao,
          tipoSolicitacao: occurrence.tipoSolicitacao,
          localizacaoDescricao: occurrence.localizacaoDescricao,
          numeroPatrimonioTexto: occurrence.numeroPatrimonioTexto,
          itemId: occurrence.itemId,
          instituicaoId: occurrence.instituicaoId,
          criadoPorId: occurrence.criadoPorId,
          prioridade: occurrence.prioridade,
        });
        setOccurrences((prev) => [result, ...prev]);
      }
    } catch (err) {
      console.error('Error saving occurrence:', err);
    }
  }, []);

  const handleRegisterAsset = useCallback(async (asset: Asset) => {
    try {
      const result = await api.items.create({
        nome: asset.nome,
        categoria: asset.categoria,
        numeroPatrimonio: asset.numeroPatrimonio,
        numeroSerie: asset.numeroSerie,
        marca: asset.marca,
        modelo: asset.modelo,
        estadoConservacao: asset.estadoConservacao,
        status: asset.status,
        dataAquisicao: asset.dataAquisicao?.toISOString(),
        valorAquisicao: asset.valorAquisicao,
        observacoes: asset.observacoes,
        setorId: asset.setorId,
        instituicaoId: asset.instituicaoId,
        cadastradoPorId: asset.cadastradoPorId,
      });
      setAssets((prev) => {
        const exists = prev.find((a) => a.id === result.id);
        if (exists) {
          return prev.map((a) => (a.id === result.id ? result : a));
        }
        return [result, ...prev];
      });
      setSelectedAsset(null);
    } catch (err) {
      console.error('Error creating asset:', err);
    }
  }, []);

  const navigateToView = useCallback((view: string) => {
    if (view === 'novo-ativo' && currentView !== 'detalhes') {
      setSelectedAsset(null);
    }
    setView(view);
  }, [currentView]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar
          currentView={currentView}
          setView={(view) => {
            if (view !== 'novo-ativo' && view !== 'detalhes') {
              setSelectedAsset(null);
            }
            setView(view);
            setSidebarOpen(false);
          }}
          session={session}
          onLogout={handleLogout}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      <div className="md:pl-60 min-h-screen flex flex-col">
        <Header
          session={session}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={(view) => setView(view)}
        />

        <main className="flex-1 p-4 mt-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
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
                    onUpdateOccurrence={handleUpdateOccurrence}
                    canEditOwn={true}
                    canEditPriority={true}
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
                    editingOccurrence={selectedOccurrence}
                    canEditPriority={true}
                    instituicaoId={session?.user?.instituicaoId || ''}
                    criadoPorId={session?.user?.id}
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

                {currentView === 'aprovacao' && (
                  <AprovacaoView
                    occurrences={occurrences}
                    onUpdateOccurrence={handleUpdateOccurrence}
                  />
                )}

                {currentView === 'usuarios' && (
                  <UsuariosView />
                )}

                {currentView === 'instituicoes' && (
                  <InstituicoesView />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}