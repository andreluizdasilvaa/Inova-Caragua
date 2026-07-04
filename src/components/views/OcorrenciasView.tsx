'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, StatusOcorrencia, Prioridade, TipoSolicitacao } from '@/mockData';
import { Card, Button, PriorityBadge, StatusBadge, TIPO_SOLICITACAO_LABEL } from '@/components/UI';
import { Search, Eye, Edit, SlidersHorizontal } from 'lucide-react';

interface OcorrenciasViewProps {
  occurrences: Occurrence[];
  setView: (view: string) => void;
  setSelectedOccurrence: (occ: Occurrence) => void;
}

export const OcorrenciasView: React.FC<OcorrenciasViewProps> = ({
  occurrences,
  setView,
  setSelectedOccurrence
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todas');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todas');

  // Available unique options for dropdowns
  const prioridades: string[] = ['Todas', 'URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];
  const statusList: StatusOcorrencia[] = ['ABERTA', 'AGUARDANDO_CORRECAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'RECUSADA', 'CANCELADA'];
  const tiposList: TipoSolicitacao[] = ['SERVICO', 'REPARO', 'TROCA', 'REABASTECIMENTO', 'OUTRO'];

  const PRIORIDADE_LABEL: Record<string, string> = {
    URGENTE: 'Urgente',
    ALTA: 'Alta',
    MEDIA: 'Média',
    BAIXA: 'Baixa',
  };

  const STATUS_LABEL: Record<StatusOcorrencia, string> = {
    ABERTA: 'Aberta',
    AGUARDANDO_CORRECAO: 'Aguardando Correção',
    AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
    APROVADA: 'Aprovada',
    AGENDADA: 'Agendada',
    EM_EXECUCAO: 'Em Execução',
    CONCLUIDA: 'Concluída',
    RECUSADA: 'Recusada',
    CANCELADA: 'Cancelada',
  };

  const TIPO_LABEL: Record<TipoSolicitacao, string> = {
    SERVICO: 'Serviço',
    REPARO: 'Reparo',
    TROCA: 'Troca',
    REABASTECIMENTO: 'Reabastecimento',
    OUTRO: 'Outro',
  };

  // Handle Filtering
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        `#${occ.numero}`.includes(q) ||
        occ.titulo.toLowerCase().includes(q) ||
        occ.descricao.toLowerCase().includes(q);

      const matchesPriority = selectedPriority === 'Todas' || occ.prioridade === selectedPriority;
      const matchesStatus = selectedStatus === 'Todas' || occ.status === selectedStatus;
      const matchesTipo = selectedTipo === 'Todas' || occ.tipoSolicitacao === selectedTipo;

      return matchesSearch && matchesPriority && matchesStatus && matchesTipo;
    });
  }, [occurrences, searchQuery, selectedPriority, selectedStatus, selectedTipo]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('Todas');
    setSelectedStatus('Todas');
    setSelectedTipo('Todas');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestão de Ocorrências</h2>
          <p className="text-sm text-slate-400">Monitore, filtre e direcione chamados de infraestrutura em tempo real.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setView('nova-ocorrencia')}
          className="bg-brand-blue hover:bg-brand-teal text-sm py-2 px-4"
        >
          <span>Nova Ocorrência</span>
        </Button>
      </div>

      {/* Filter Section Card */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
          <span>Painel de Filtros Avançados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Priority dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              {prioridades.map(p => (
                <option key={p} value={p}>
                  {p === 'Todas' ? 'Todas as Prioridades' : PRIORIDADE_LABEL[p] || p}
                </option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              <option value="Todas">Todos os Status</option>
              {statusList.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>

          {/* Tipo dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Solicitação</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              <option value="Todas">Todos os Tipos</option>
              {tiposList.map(t => (
                <option key={t} value={t}>{TIPO_LABEL[t]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Actions footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por título, número, descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs py-1.5 px-3">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Occurrences Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nº</th>
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
              {filteredOccurrences.length > 0 ? (
                filteredOccurrences.map((occ) => (
                  <tr 
                    key={occ.id} 
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-mono text-sm font-bold text-slate-500">#{occ.numero}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate" title={occ.titulo}>{occ.titulo}</td>
                    <td className="py-3 px-4 text-slate-500">{TIPO_LABEL[occ.tipoSolicitacao]}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={occ.prioridade} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={occ.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(occ.createdAt)}</td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOccurrence(occ);
                          setView('triagem');
                        }}
                        title="Ver detalhes"
                        className="p-1.5 text-brand-blue hover:text-white hover:bg-brand-blue rounded transition-all duration-150 inline-flex items-center cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Editar chamado #${occ.numero}`)}
                        title="Editar chamado"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all duration-150 inline-flex items-center cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhuma ocorrência encontrada correspondente aos filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>
            Mostrando 1 a {filteredOccurrences.length} de {filteredOccurrences.length} entradas
          </span>
          <div className="flex gap-1">
            <button disabled className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40">
              Anterior
            </button>
            <button className="px-3 py-1.5 rounded border border-brand-blue bg-brand-blue text-white font-bold">
              1
            </button>
            <button disabled className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40">
              Próximo
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};