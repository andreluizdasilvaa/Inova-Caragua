'use client';

import React, { useState, useMemo } from 'react';
import { Asset, CategoriaItem, EstadoConservacao, StatusItem } from '@/types';
import { Card, Button, AssetStatusBadge } from '@/components/UI';
import { Search, Plus, ListPlus, Eye, FileSpreadsheet } from 'lucide-react';

interface InventarioViewProps {
  assets: Asset[];
  setView: (view: string) => void;
  setSelectedAsset: (asset: Asset) => void;
}

const CATEGORIA_LABEL: Record<CategoriaItem, string> = {
  INFORMATICA: 'Informática',
  MOBILIARIO: 'Mobiliário',
  ELETRODOMESTICO: 'Eletrodoméstico',
  CONECTIVIDADE: 'Conectividade',
  PREDIAL: 'Predial',
  OUTRO: 'Outro',
};

export const InventarioView: React.FC<InventarioViewProps> = ({
  assets,
  setView,
  setSelectedAsset
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories: (CategoriaItem | 'Todas')[] = ['Todas', 'INFORMATICA', 'MOBILIARIO', 'ELETRODOMESTICO', 'CONECTIVIDADE', 'PREDIAL', 'OUTRO'];

  // Filter computation
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        asset.nome.toLowerCase().includes(q) ||
        (asset.numeroPatrimonio && asset.numeroPatrimonio.toLowerCase().includes(q)) ||
        (asset.marca && asset.marca.toLowerCase().includes(q)) ||
        (asset.modelo && asset.modelo.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'Todas' || asset.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      ativo: assets.filter(a => a.status === 'ATIVO').length,
      manutencao: assets.filter(a => a.status === 'EM_MANUTENCAO').length,
      baixado: assets.filter(a => a.status === 'BAIXADO').length
    };
  }, [assets]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

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
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registro de Ativos e Inventário</h2>
          <p className="text-sm text-slate-400">Administre o ciclo de vida dos bens patrimoniais das unidades escolares.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setView('lote')}
            className="text-slate-700 border-slate-300 flex items-center gap-1.5 text-xs py-2 px-3"
          >
            <ListPlus className="w-4 h-4" />
            <span>Cadastrar Lote</span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setView('novo-ativo')}
            className="bg-brand-blue hover:bg-brand-teal flex items-center gap-1 text-xs py-2 px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ativo</span>
          </Button>
        </div>
      </div>

      {/* Top Asset Counter Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-brand-navy text-white rounded p-4 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total de Ativos</span>
          <p className="text-2xl font-black mt-1 leading-none">{stats.total}</p>
        </div>
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ativos</span>
          <p className="text-2xl font-black text-teal-600 mt-1 leading-none">{stats.ativo}</p>
        </div>
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Manutenção</span>
          <p className="text-2xl font-black text-brand-blue mt-1 leading-none">{stats.manutencao}</p>
        </div>
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baixados</span>
          <p className="text-2xl font-black text-rose-600 mt-1 leading-none">{stats.baixado}</p>
        </div>
      </div>

      {/* Database Search Filters */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por patrimônio, marca, modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-400 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:inline">Categoria:</span>
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-blue border-brand-blue text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'Todas' ? 'Todas' : CATEGORIA_LABEL[cat as CategoriaItem]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Asset Table list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patrimônio</th>
                <th className="py-3 px-4">Equipamento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition-all duration-150">
                    <td className="py-2.5 px-4 font-mono text-sm font-bold text-slate-600">
                      {asset.numeroPatrimonio || asset.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 leading-snug">{asset.nome}</div>
                      <div className="text-xs text-slate-400 font-medium">{asset.marca}{asset.modelo ? ` - ${asset.modelo}` : ''}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{CATEGORIA_LABEL[asset.categoria]}</td>
                    <td className="py-2.5 px-4 text-slate-500">{asset.estadoConservacao}</td>
                    <td className="py-2.5 px-4">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setView('detalhes');
                        }}
                        title="Ver Ficha Técnica Completa"
                        className="p-1.5 text-brand-blue hover:text-white hover:bg-brand-blue rounded transition-all inline-flex items-center cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => triggerToast(`Termo de responsabilidade gerado para o ativo ${asset.numeroPatrimonio}`)}
                        title="Exportar Termo"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all inline-flex items-center cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    Nenhum ativo patrimonial correspondente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};