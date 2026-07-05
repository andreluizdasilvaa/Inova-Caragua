'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, StatusOcorrencia, Prioridade, TipoSolicitacao } from '@/types';
import { Card, Button, PriorityBadge, StatusBadge, TIPO_SOLICITACAO_LABEL } from '@/components/UI';
import { Search, Edit, SlidersHorizontal, Calendar, Clock, AlertTriangle, ArrowLeftRight, X } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/timestamp';

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

  const prioridades: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];
  const statusList: StatusOcorrencia[] = ['ABERTA', 'AGUARDANDO_CORRECAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'RECUSADA', 'CANCELADA'];
  const tiposList: TipoSolicitacao[] = ['SERVICO', 'REPARO', 'TROCA', 'REABASTECIMENTO', 'OUTRO'];

  const PRIORIDADE_LABEL: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('Todas');
    setSelectedStatus('Todas');
    setSelectedTipo('Todas');
  };

  const canEdit = canEditOwn || canEditPriority;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(filteredOccurrences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOccurrences = filteredOccurrences.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters or items per page change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPriority, selectedStatus, selectedTipo, itemsPerPage]);

  const [showMotivoModal, setShowMotivoModal] = useState<string | null>(null);
  const [motivoOcc, setMotivoOcc] = useState<Occurrence | null>(null);

  const handleEditClick = (occ: Occurrence) => {
    setSelectedOccurrence(occ);
    setView('nova-ocorrencia');
  };

  const handleRevisarClick = (occ: Occurrence) => {
    setMotivoOcc(occ);
    setShowMotivoModal(occ.motivoRecusa || '');
  };

  const handleReenviarClick = () => {
    if (!motivoOcc) return;
    // Set status back to ABERTA and clear motivoRecusa
    const updated: Occurrence = {
      ...motivoOcc,
      status: 'ABERTA',
      motivoRecusa: null,
    };
    if (onUpdateOccurrence) {
      onUpdateOccurrence(updated);
    }
    setShowMotivoModal(null);
    setMotivoOcc(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-5">
      {/* Motivo Recusa Modal */}
      {showMotivoModal !== null && motivoOcc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Correção Necessária
              </h3>
              <button onClick={() => setShowMotivoModal(null)} className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Motivo da Recusa / Correção</p>
              <p className="text-sm text-orange-900 font-medium leading-relaxed whitespace-pre-wrap">
                {motivoOcc.motivoRecusa || 'Nenhum motivo detalhado foi fornecido.'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-slate-700">Ocorrência #{motivoOcc.numero}</p>
              <p className="text-sm text-slate-600">{motivoOcc.titulo}</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowMotivoModal(null)}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                Fechar
              </Button>
              <Button variant="secondary" onClick={() => { setShowMotivoModal(null); handleEditClick(motivoOcc); }}
                className="flex-1 bg-brand-blue hover:bg-brand-teal">
                <Edit className="w-4 h-4 mr-1.5" />
                Editar e Reenviar
              </Button>
              <Button variant="primary" onClick={handleReenviarClick}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <ArrowLeftRight className="w-4 h-4 mr-1.5" />
                Reenviar
              </Button>
            </div>
          </div>
        </div>
      )}

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
                <option key={p} value={p}>{PRIORIDADE_LABEL[p] || p}</option>
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
              {paginatedOccurrences.length > 0 ? (
                paginatedOccurrences.map((occ) => {
                  const isAguardandoCorrecao = occ.status === 'AGUARDANDO_CORRECAO';
                  return (
                  <tr 
                    key={occ.id} 
                    className={`transition-colors duration-150 ${
                      isAguardandoCorrecao 
                        ? 'bg-orange-50/70 border-l-4 border-l-orange-400 hover:bg-orange-100/70' 
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-sm font-bold text-slate-500">#{occ.numero}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isAguardandoCorrecao && (
                          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 max-w-[180px] truncate block" title={occ.titulo}>{occ.titulo}</span>
                      </div>
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
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-md border border-purple-200 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          {formatDate(occ.dataVisitaAgendada)}
                          <span className="text-purple-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          {formatTime(occ.dataVisitaAgendada)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isAguardandoCorrecao ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleRevisarClick(occ)}
                            title="Ver motivo da correção e reenviar"
                            className="px-3 py-1.5 text-xs font-bold rounded bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Revisar
                          </button>
                          <button
                            onClick={() => handleEditClick(occ)}
                            title="Editar ocorrência"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all inline-flex items-center cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : canEdit && (
                        <button
                          onClick={() => handleEditClick(occ)}
                          title="Editar ocorrência"
                          className="p-1.5 text-brand-blue hover:text-white hover:bg-brand-blue rounded transition-all duration-150 inline-flex items-center cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })
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
          <div className="flex items-center gap-3">
            <span>
              Mostrando {filteredOccurrences.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + itemsPerPage, filteredOccurrences.length)} de {filteredOccurrences.length} entradas
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1.5 rounded border transition-colors ${
                    currentPage === pageNum
                      ? 'border-brand-blue bg-brand-blue text-white font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};