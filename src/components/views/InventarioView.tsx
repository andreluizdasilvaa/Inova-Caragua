'use client';

import React, { useState, useMemo } from 'react';
import { Asset, CategoriaItem, EstadoConservacao, StatusItem } from '@/types';
import { Card, Button, AssetStatusBadge } from '@/components/UI';
import { Search, Plus, ListPlus, Eye, FileSpreadsheet, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface InventarioViewProps {
  assets?: Asset[]; // Keeping for optional fallback but ignoring
  instituicaoId?: string | null;
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
  instituicaoId,
  setView,
  setSelectedAsset
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [items, setItems] = useState<Asset[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [assetStats, setAssetStats] = useState({ total: 0, ativo: 0, manutencao: 0, baixado: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const categories: (CategoriaItem | 'Todas')[] = ['Todas', 'INFORMATICA', 'MOBILIARIO', 'ELETRODOMESTICO', 'CONECTIVIDADE', 'PREDIAL', 'OUTRO'];

  // Fetch paginated items and stats
  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchParams: any = { page: currentPage, limit: itemsPerPage };
    if (instituicaoId) fetchParams.instituicaoId = instituicaoId;
    if (selectedCategory !== 'Todas') fetchParams.categoria = selectedCategory;
    if (searchQuery.trim()) fetchParams.search = searchQuery.trim();

    Promise.all([
      api.items.list(fetchParams),
      api.items.stats({ instituicaoId: instituicaoId || undefined })
    ]).then(([res, stats]) => {
      if (!isMounted) return;
      if (res && res.data) {
        setItems(res.data);
        setTotalItems(res.total);
      } else if (Array.isArray(res)) {
        setItems(res);
        setTotalItems(res.length);
      }
      setAssetStats(stats);
      setIsLoading(false);
    }).catch(err => {
      console.error('Failed to fetch items:', err);
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [currentPage, itemsPerPage, instituicaoId, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginationPages = useMemo<Array<number | 'ellipsis'>>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage]);

    for (let offset = 1; offset <= 2; offset += 1) {
      if (currentPage - offset > 1) pages.add(currentPage - offset);
      if (currentPage + offset < totalPages) pages.add(currentPage + offset);
    }

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const result: Array<number | 'ellipsis'> = [];

    sortedPages.forEach((page, index) => {
      const previous = sortedPages[index - 1];
      if (previous !== undefined && page - previous > 1) {
        result.push('ellipsis');
      }
      result.push(page);
    });

    return result;
  }, [currentPage, totalPages]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const stats = useMemo(() => {
    return {
      total: assetStats.total,
      ativo: assetStats.ativo,
      manutencao: assetStats.manutencao,
      baixado: assetStats.baixado
    };
  }, [assetStats]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDeleteItem = async (asset: Asset) => {
    if (confirm(`Tem certeza que deseja excluir o item ${asset.numeroPatrimonio || asset.nome}?`)) {
      try {
        const response = await fetch('/api/itens', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: asset.id, status: 'BAIXADO' })
        });
        if (response.ok) {
          triggerToast(`Item ${asset.numeroPatrimonio || asset.nome} excluído com sucesso!`);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          triggerToast('Erro ao excluir item.');
        }
      } catch (err) {
        triggerToast('Erro na conexão ao excluir item.');
      }
    }
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registro de Inventário</h2>
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
            <span>Novo Item</span>
          </Button>
        </div>
      </div>

      {/* Top Asset Counter Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-brand-navy text-white rounded p-4 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total de Itens</span>
          <p className="text-2xl font-black mt-1 leading-none">{stats.total}</p>
        </div>
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itens</span>
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
        <div className="flex flex-col gap-3">
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
              <div className="flex gap-1.5 overflow-x-hidden flex-wrap w-full sm:w-auto pb-0.5">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <span className="text-slate-500 font-medium">Exibindo {startItem}-{endItem} de {totalItems} itens filtrados.</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {paginationPages.map((page, index) =>
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="w-7 h-7 text-xs font-medium text-slate-400 flex items-center justify-center">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-7 h-7 text-xs font-medium rounded transition-all ${
                      currentPage === page
                        ? 'bg-brand-blue text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
      </Card>

      {/* Asset Table list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum item encontrado com os filtros atuais.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[15%]">Patrimônio</th>
                  <th className="py-3 px-4 w-[25%]">Equipamento</th>
                  <th className="py-3 px-4 w-[15%]">Categoria</th>
                  <th className="py-3 px-4 w-[15%]">Estado</th>
                  <th className="py-3 px-4 w-[15%]">Status</th>
                  <th className="py-3 px-4 w-[15%] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {items.map((asset) => (
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
                        onClick={() => handleDeleteItem(asset)}
                        title="Excluir Item"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      {totalItems > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Página {currentPage} de {totalPages}</span>
          <span>{itemsPerPage} itens por página</span>
        </div>
      )}
    </div>
  );
};