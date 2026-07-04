'use client';

import React, { useState, useMemo } from 'react';
import { Asset } from '@/mockData';
import { Card, Button } from '@/components/UI';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  Grid, 
  ListPlus, 
  Download 
} from 'lucide-react';

interface LoteViewProps {
  assets: Asset[];
  setView: (view: string) => void;
  onGenerateBatch: (newAssets: Asset[]) => void;
}

export const LoteView: React.FC<LoteViewProps> = ({
  assets,
  setView,
  onGenerateBatch
}) => {
  // Config inputs
  const [prefix, setPrefix] = useState('PAT-2026-');
  const [quantity, setQuantity] = useState(6);
  const [startSequence, setStartSequence] = useState(1);
  
  const [assetName, setAssetName] = useState('Ar Condicionado Inverter 18000 BTUs');
  const [assetCategory, setAssetCategory] = useState('Climatização');
  const [assetLocation, setAssetLocation] = useState('Bloco C - Segundo Andar');

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic preview sequence list based on inputs
  const previewSequence = useMemo(() => {
    const list: string[] = [];
    const limit = Math.max(1, Math.min(100, quantity));
    for (let i = 0; i < limit; i++) {
      const seqNum = startSequence + i;
      const formattedSeq = String(seqNum).padStart(3, '0');
      list.push(`${prefix}${formattedSeq}`);
    }
    return list;
  }, [prefix, quantity, startSequence]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleBatchGenerate = () => {
    const batch: Asset[] = previewSequence.map((pat) => ({
      patrimony: pat,
      name: assetName,
      category: assetCategory,
      location: assetLocation,
      status: 'Operacional',
      model: 'Carrier Silent X',
      brand: 'Carrier',
      serialNumber: `SRL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      purchaseDate: '04/07/2026',
      supplier: 'Clima Comercial S.A.',
      invoice: 'NFE-000.412.909',
      warrantyStatus: 'Ativa (36 Meses de Garantia)'
    }));

    onGenerateBatch(batch);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setView('inventario');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-16 right-4 bg-teal-900 text-white border border-teal-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">Lote de {quantity} ativos adicionado ao inventário!</span>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 bg-brand-teal rounded-full animate-ping" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('inventario')}
          className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Geração de Ativos em Lote</h2>
          <p className="text-sm text-slate-400">Crie sequências de patrimônios e exporte etiquetas de rastreamento escolares.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left config form (5 Cols) */}
        <Card className="lg:col-span-5 p-4 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 shrink-0">
            <Settings className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Parâmetros da Sequência</h3>
          </div>

          <div className="space-y-4">
            {/* Prefixo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prefixo do Patrimônio</label>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" data-tip="Código que antecede a sequência numérica." />
              </div>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
              />
            </div>

            {/* Quantidade e Sequencia Inicial inline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Início da Sequência</label>
                <input
                  type="number"
                  min={1}
                  value={startSequence}
                  onChange={(e) => setStartSequence(parseInt(e.target.value) || 1)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Template Asset Details */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ficha Técnica do Lote</p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome de Modelo Padrão</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full text-sm rounded border border-slate-200 bg-white p-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                  >
                    <option value="Climatização">Climatização</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Mobiliário">Mobiliário</option>
                    <option value="Hidráulica">Hidráulica</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local de Instalação</label>
                  <input
                    type="text"
                    value={assetLocation}
                    onChange={(e) => setAssetLocation(e.target.value)}
                    className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleBatchGenerate}
              className="w-full bg-brand-blue hover:bg-brand-teal text-xs py-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Gerar Ativos e Exportar Etiquetas</span>
            </Button>
          </div>
        </Card>

        {/* Right preview sequence cards grid (7 Cols) */}
        <Card className="lg:col-span-7 p-4 flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-brand-blue" />
                Sequência de Patrimônios ({previewSequence.length})
              </h3>
              <button 
                onClick={() => triggerToast('Sequência de etiquetas CSV exportada com sucesso!')}
                className="text-xs font-bold text-slate-500 hover:text-brand-blue flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar ZIP</span>
              </button>
            </div>

            {/* List preview nodes visually as mock physical barcode sheets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[240px] pr-1">
              {previewSequence.map((pat) => (
                <div 
                  key={pat} 
                  className="border border-dashed border-slate-200 rounded p-3 bg-slate-50/40 text-center flex flex-col justify-between items-center relative group hover:border-brand-blue hover:bg-brand-ice/20 transition-all duration-150"
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Simulated vertical barcode lines */}
                    <div className="w-14 h-8 flex items-center gap-0.5 justify-center opacity-80 mb-1.5">
                      <div className="w-0.5 h-full bg-slate-900" />
                      <div className="w-1 h-full bg-slate-900" />
                      <div className="w-0.5 h-full bg-slate-900" />
                      <div className="w-1.5 h-full bg-slate-900" />
                      <div className="w-0.5 h-full bg-slate-900" />
                      <div className="w-1 h-full bg-slate-900" />
                      <div className="w-0.5 h-full bg-slate-900" />
                    </div>
                    
                    <span className="font-mono text-xs font-black text-slate-800 tracking-wider">
                      {pat}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 mt-1.5 truncate max-w-full uppercase tracking-wider">
                    {assetCategory}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded p-3 border border-slate-200 mt-4 flex items-start gap-3 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-800">Verificação de Chaves Primárias Concluída</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Todos os códigos gerados foram validados contra o banco de dados. Não há colisões ou duplicidade de registros cadastrados.
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};