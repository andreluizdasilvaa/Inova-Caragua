'use client';

import React, { useMemo } from 'react';
import { Asset, CategoriaItem, EstadoConservacao, StatusItem } from '@/types';
import { OccurrenceHistory } from '@/types';
import { Card, Button, AssetStatusBadge, STATUS_ITEM_LABEL } from '@/components/UI';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  History, 
  Calendar, 
  Truck, 
  Download,
  AlertTriangle,
  PenTool,
  Hash,
  Tag
} from 'lucide-react';
import { mockAssetHistory } from '@/mockData';

interface DetalhesViewProps {
  asset: Asset | null;
  setView: (view: string) => void;
}

const CATEGORIA_LABEL: Record<CategoriaItem, string> = {
  INFORMATICA: 'Informática',
  MOBILIARIO: 'Mobiliário',
  ELETRODOMESTICO: 'Eletrodoméstico',
  CONECTIVIDADE: 'Conectividade',
  PREDIAL: 'Predial',
  OUTRO: 'Outro',
};

const ESTADO_LABEL: Record<EstadoConservacao, string> = {
  NOVO: 'Novo',
  BOM: 'Bom',
  REGULAR: 'Regular',
  RUIM: 'Ruim',
  INSERVIVEL: 'Inservível',
};

export const DetalhesView: React.FC<DetalhesViewProps> = ({
  asset,
  setView
}) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Safe fallback if null
  const currentAsset: Asset = asset || {
    id: 'N/A',
    nome: 'Ativo Desconhecido',
    numeroPatrimonio: null,
    categoria: 'OUTRO',
    estadoConservacao: 'REGULAR',
    status: 'ATIVO',
    createdAt: new Date(),
    updatedAt: new Date(),
    setorId: 'N/A',
    instituicaoId: 'N/A'
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  };

  // Get asset history list
  const historyList = useMemo<OccurrenceHistory[]>(() => {
    const key = currentAsset.id.replace('#', '').trim();
    return mockAssetHistory[key] || [];
  }, [currentAsset]);

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 bg-brand-teal rounded-full animate-ping" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('inventario')} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentAsset.numeroPatrimonio || currentAsset.id}
              </span>
              <AssetStatusBadge status={currentAsset.status} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mt-1.5">
              Ficha Técnica: {currentAsset.nome}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => triggerToast('Laudo técnico gerado em PDF!')}
            className="text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1 text-xs py-2 px-3">
            <Download className="w-4 h-4" /><span>Exportar PDF</span>
          </Button>
          <Button variant="secondary" onClick={() => setView('novo-ativo')}
            className="bg-slate-800 hover:bg-slate-900 flex items-center gap-1 text-xs py-2 px-3">
            <PenTool className="w-4 h-4" /><span>Editar Ativo</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-1 shrink-0">
            <FileText className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Especificações Técnicas</h3>
          </div>
          <div className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marca</span>
              <span className="text-sm font-bold text-slate-800">{currentAsset.marca || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modelo</span>
              <span className="text-sm font-bold text-slate-800">{currentAsset.modelo || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº de Série</span>
              <span className="text-sm font-mono font-bold text-slate-700">{currentAsset.numeroSerie || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
              <span className="text-sm font-bold text-brand-blue">{CATEGORIA_LABEL[currentAsset.categoria]}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</span>
              <span className="text-sm font-bold text-slate-700">{ESTADO_LABEL[currentAsset.estadoConservacao]}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-1 shrink-0">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Dados de Aquisição</h3>
          </div>
          <div className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data de Aquisição</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(currentAsset.dataAquisicao)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</span>
              <span className="text-sm font-bold text-slate-800">
                {currentAsset.valorAquisicao ? `R$ ${Number(currentAsset.valorAquisicao).toFixed(2)}` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <AssetStatusBadge status={currentAsset.status} />
            </div>
          </div>
        </Card>
      </div>

      {historyList.length > 0 && (
        <Card className="overflow-hidden">
          <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-blue" />
              Histórico de Ocorrências
            </h3>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              {historyList.length} Entradas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Status Anterior</th>
                  <th className="py-2.5 px-4">Status Novo</th>
                  <th className="py-2.5 px-4">Comentário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {historyList.map((hist, index) => (
                  <tr key={hist.id || index} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{formatDate(hist.createdAt)}</td>
                    <td className="py-2.5 px-4 text-slate-500">{hist.statusAnterior || '—'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{hist.statusNovo}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-[320px] truncate">{hist.comentario || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex justify-end pt-1 shrink-0">
        <Button variant="outline" onClick={() => setView('inventario')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs py-2 px-3">
          Voltar para o Inventário
        </Button>
      </div>
    </div>
  );
};