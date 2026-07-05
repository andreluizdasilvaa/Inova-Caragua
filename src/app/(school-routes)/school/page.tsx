'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Occurrence, Asset } from '@/types';
import { api } from '@/lib/api';
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

export default function SchoolPage() {
  const { data: session, status } = useSession();

  const [currentView, setView] = useState<string>('dashboard');
  const [schoolOccurrences, setSchoolOccurrences] = useState<Occurrence[]>([]);
  const [schoolAssets, setSchoolAssets] = useState<Asset[]>([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState('Minha Escola');

  const instituicaoId = session?.user?.instituicaoId || null;

  // Use live update hook for 10s polling and security check
  useLiveUpdate(schoolOccurrences, setSchoolOccurrences, instituicaoId);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!instituicaoId) return;

    setLoading(true);
    try {
      const [occResult, itemsResult, instResult] = await Promise.all([
        api.occurrences.list({ instituicaoId }),
        api.items.list({ instituicaoId }),
        api.instituicoes.list(),
      ]);

      const occurrences = Array.isArray(occResult) ? occResult : (occResult as any).data || [];
      const items = Array.isArray(itemsResult) ? itemsResult : (itemsResult as any).data || [];

      setSchoolOccurrences(occurrences);
      setSchoolAssets(items);

      // Find school name
      const instList = Array.isArray(instResult) ? instResult : [];
      const school = instList.find((i: any) => i.id === instituicaoId);
      if (school) setSchoolName(school.nome);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [instituicaoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleUpdateOccurrence = useCallback(async (updated: Occurrence) => {
    try {
      const result = await api.occurrences.update(updated.id, {
        status: updated.status,
        prioridade: updated.prioridade,
        observacoesMestre: updated.observacoesMestre,
        observacoesTriagem: updated.observacoesTriagem,
        motivoRecusa: updated.motivoRecusa,
      });
      setSchoolOccurrences(prev => prev.map(o => o.id === result.id ? result : o));
    } catch (err) {
      console.error('Error updating occurrence:', err);
    }
  }, []);

  const handleRegisterOccurrence = useCallback(async (occurrence: Occurrence) => {
    try {
      const isEditing = occurrence.id && !occurrence.id.startsWith('occ_');
      
      if (isEditing) {
        // Update existing occurrence
        // If it was waiting for correction, auto-resubmit (set back to ABERTA)
        const wasAguardandoCorrecao = occurrence.status === 'AGUARDANDO_CORRECAO';
        const result = await api.occurrences.update(occurrence.id, {
          titulo: occurrence.titulo,
          descricao: occurrence.descricao,
          tipoSolicitacao: occurrence.tipoSolicitacao,
          localizacaoDescricao: occurrence.localizacaoDescricao,
          numeroPatrimonioTexto: occurrence.numeroPatrimonioTexto,
          itemId: occurrence.itemId,
          prioridade: occurrence.prioridade,
          ...(wasAguardandoCorrecao ? { status: 'ABERTA', motivoRecusa: null } : {}),
        });
        setSchoolOccurrences(prev => prev.map(o => o.id === result.id ? result : o));
      } else {
        // Create new occurrence
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
        setSchoolOccurrences(prev => [result, ...prev]);
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
      setSchoolAssets(prev => [result, ...prev]);
    } catch (err) {
      console.error('Error creating asset:', err);
    }
  }, []);

  const handleGenerateBatch = useCallback(async (newAssets: Asset[]) => {
    for (const asset of newAssets) {
      await handleRegisterAsset(asset);
    }
  }, [handleRegisterAsset]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSetView = useCallback((view: string) => {
    if (view === 'triagem' || view === 'aprovacao') return;
    setView(view);
  }, []);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!instituicaoId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">Usuário sem vínculo com instituição</p>
          <p className="text-sm text-slate-500 mt-2">Contate o administrador do sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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

      <div className="md:pl-60 min-h-screen flex flex-col">
        <Header
          session={session}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 mt-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {currentView === 'dashboard' && (
                  <SchoolDashboardView
                    occurrences={schoolOccurrences}
                    assets={schoolAssets}
                    schoolName={schoolName}
                  />
                )}

                {currentView === 'ocorrencias' && (
                  <OcorrenciasView
                    occurrences={schoolOccurrences}
                    setView={handleSetView}
                    setSelectedOccurrence={setSelectedOccurrence}
                    onUpdateOccurrence={handleUpdateOccurrence}
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
                    instituicaoId={instituicaoId}
                    userRole="ESCOLA"
                    instituicaoNome={schoolName}
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
                    instituicaoId={instituicaoId}
                    criadoPorId={session?.user?.id}
                  />
                )}

                {currentView === 'novo-ativo' && (
                  <NovoAtivoView
                    setView={handleSetView}
                    onRegisterAsset={handleRegisterAsset}
                    userRole="ESCOLA"
                    instituicaoId={instituicaoId}
                    instituicaoNome={schoolName}
                    editingAsset={selectedAsset}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}