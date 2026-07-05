'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, StatusOcorrencia, Prioridade, TipoSolicitacao } from '@/mockData';
import { Card, Button, PriorityBadge, StatusBadge, TIPO_SOLICITACAO_LABEL } from '@/components/UI';
import { Search, Edit, SlidersHorizontal, Calendar, Clock } from 'lucide-react';

interface OcorrenciasViewProps {
  occurrences: Occurrence[];
  setView: (view: string) => void;
  setSelectedOccurrence: (occ: Occurrence | null) => void;
  onUpdateOccurrence?: (occ: Occurrence) => void;
  canEditOwn?: boolean;
  canEditPriority?: boolean;
}

export const OcorrenciasView: React.FC<OcorrenciasViewProps> = ({
  occurrences,
  setView,
  setSelectedOccurrence,
  onUpdateOccurrence,
  canEditOwn = false,
  canEditPriority = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todas');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todas');

  const prioridades: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA'];
  const statusList: StatusOcorrencia[] = ['ABERTA', 'AGUARDANDO_CORRECAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'RECUSADA', 'CANCELADA'];
  const tiposList: TipoSolicitacao[] = ['SERVICO', 'REPARO', 'TROCA', 'REABASTECIMENTO', 'OUTRO'];

  const PRIORIDADE_LABEL: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '—';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('Todas');
    setSelectedStatus('Todas');
    setSelectedTipo('Todas');
  };

  const canEdit = canEditOwn || canEditPriority;

  const handleEditClick = (occ: Occurrence) => {
    setSelectedOccurrence(occ);
    setView('nova-ocorrencia');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestão de Ocorrências</h2>
          <p className="text-sm text-slate-400">Monitore, filtre e direcione chamados de infraestrutura em tempo real.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => {
            setSelectedOccurrence(null);
            setView('nova-ocorrencia');
          }}
          className="bg-brand-blue hover:bg-brand-teal text-sm py-2 px-4"
        >
          <span>Nova Ocorrência</span>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
          <span>Painel de Filtros Avançados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              <option value="Todas">Todas as Prioridades</option>
              {prioridades.map(p => (
                <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
              ))}
            </select>
          </div>

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
                <th className="py-3 px-4">Agendamento</th>
                {canEdit && <th className="py-3 px-4 text-right">Editar</th>}
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
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 max-w-[200px] truncate block" title={occ.titulo}>{occ.titulo}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-slate-600">{TIPO_LABEL[occ.tipoSolicitacao]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={occ.prioridade} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={occ.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(occ.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {occ.dataVisitaAgendada ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(occ.dataVisitaAgendada)}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(occ.dataVisitaAgendada)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEditClick(occ)}
                          title="Editar ocorrência"
                          className="p-1.5 text-brand-blue hover:text-white hover:bg-brand-blue rounded transition-all duration-150 inline-flex items-center cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-10 text-center text-slate-400">
                    Nenhuma ocorrência encontrada correspondente aos filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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