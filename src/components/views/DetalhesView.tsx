'use client';

import React, { useMemo } from 'react';
import { Asset, AssetHistory } from '@/mockData';
import { Card, Button, AssetStatusBadge } from '@/components/UI';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  History, 
  Calendar, 
  Truck, 
  FileSpreadsheet, 
  Download,
  AlertTriangle,
  PenTool
} from 'lucide-react';
import { mockAssetHistory } from '@/mockData';

interface DetalhesViewProps {
  asset: Asset | null;
  setView: (view: string) => void;
}

export const DetalhesView: React.FC<DetalhesViewProps> = ({
  asset,
  setView
}) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Safe fallback if null
  const currentAsset: Asset = asset || {
    patrimony: 'PAT-2023-001',
    name: 'Ar Condicionado 12000 BTUs',
    category: 'Climatização',
    location: 'Sala 4',
    status: 'Operacional',
    model: 'Split Hi-Wall Eco',
    brand: 'Consul',
    serialNumber: 'CSL-9982-XYZ-44',
    purchaseDate: '15/03/2023',
    supplier: 'Refrigeração Total Ltda',
    invoice: '000.145.889',
    warrantyStatus: 'Ativa (Até Março 2027)'
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Get asset history list
  const historyList = useMemo<AssetHistory[]>(() => {
    const key = currentAsset.patrimony.replace('#', '').trim();
    return mockAssetHistory[key] || [
      {
        date: currentAsset.purchaseDate,
        occurrence: 'Instalação e Cadastro Inicial',
        resolution: 'Ativo instalado com sucesso no ambiente escolar e etiquetado.',
        technician: 'Carlos S. (Membro TI)'
      }
    ];
  }, [currentAsset]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 bg-brand-teal rounded-full animate-ping" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('inventario')}
            className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentAsset.patrimony}
              </span>
              <AssetStatusBadge status={currentAsset.status} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mt-1.5">
              Ficha Técnica: {currentAsset.name}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => triggerToast('Laudo técnico do ativo gerado em PDF!')}
            className="text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1 text-xs py-2 px-3"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => triggerToast('Interface de edição de metadados iniciada!')}
            className="bg-slate-800 hover:bg-slate-900 flex items-center gap-1 text-xs py-2 px-3"
          >
            <PenTool className="w-4 h-4" />
            <span>Editar Ativo</span>
          </Button>
        </div>
      </div>

      {/* Two Columns Grid: Technical Specs & Warranty specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Card: Ficha Técnica */}
        <Card className="p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-1 shrink-0">
            <FileText className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Especificações Técnicas</h3>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marca</span>
              <span className="text-sm font-bold text-slate-800">{currentAsset.brand}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modelo</span>
              <span className="text-sm font-bold text-slate-800">{currentAsset.model}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Número de Série</span>
              <span className="text-sm font-mono font-bold text-slate-700">{currentAsset.serialNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local de Instalação</span>
              <span className="text-sm font-bold text-brand-blue">{currentAsset.location}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nota Fiscal (NF-e)</span>
              <span className="text-sm font-mono font-bold text-slate-600">{currentAsset.invoice}</span>
            </div>
          </div>
        </Card>

        {/* Right Card: Warranty Specs */}
        <Card className="p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-1 shrink-0">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Contrato de Aquisição e Garantia</h3>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fornecedor</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Truck className="w-4 h-4 text-slate-400" />
                {currentAsset.supplier}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data de Compra</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {currentAsset.purchaseDate}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cobertura de Garantia</span>
              <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded border border-teal-200 text-right">
                {currentAsset.warrantyStatus}
              </span>
            </div>
          </div>
        </Card>

      </div>

      {/* Full Chronological Maintenance logs */}
      <Card className="overflow-hidden">
        <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-brand-blue" />
            Histórico de Ocorrências e Reparos
          </h3>
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
            {historyList.length} Entradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Data da Ocorrência</th>
                <th className="py-2.5 px-4">Título / Motivo</th>
                <th className="py-2.5 px-4">Resolução Aplicada</th>
                <th className="py-2.5 px-4">Responsável Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
              {historyList.map((hist, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="py-2.5 px-4 text-slate-900 font-semibold">{hist.date}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    {hist.occurrence}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 leading-relaxed max-w-[320px] truncate" title={hist.resolution}>
                    {hist.resolution}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-700">{hist.technician}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Return button */}
      <div className="flex justify-end pt-1 shrink-0">
        <Button
          variant="outline"
          onClick={() => setView('inventario')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs py-2 px-3"
        >
          Voltar para o Inventário
        </Button>
      </div>
    </div>
  );
};