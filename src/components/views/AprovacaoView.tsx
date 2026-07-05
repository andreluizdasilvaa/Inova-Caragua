'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, StatusOcorrencia, Prioridade, TipoSolicitacao, mockSchoolStats } from '@/mockData';
import { Card, Button, PriorityBadge, StatusBadge, TIPO_SOLICITACAO_LABEL, STATUS_OCORRENCIA_LABEL } from '@/components/UI';
import { 
  Search, 
  SlidersHorizontal, 
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  FileText,
  Edit,
  School,
  ArrowUpDown,
  User,
  X
} from 'lucide-react';

interface AprovacaoViewProps {
  occurrences: Occurrence[];
  onUpdateOccurrence: (occ: Occurrence) => void;
}

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

const STATUS_ACTIONS: { value: StatusOcorrencia; label: string; color: string }[] = [
  { value: 'APROVADA', label: 'Aprovar', color: 'text-teal-600 border-teal-300 hover:bg-teal-50' },
  { value: 'AGENDADA', label: 'Agendar', color: 'text-purple-600 border-purple-300 hover:bg-purple-50' },
  { value: 'EM_EXECUCAO', label: 'Em Execução', color: 'text-brand-blue border-brand-blue/30 hover:bg-brand-ice' },
  { value: 'CONCLUIDA', label: 'Concluir', color: 'text-teal-700 border-teal-400 hover:bg-teal-50' },
  { value: 'RECUSADA', label: 'Recusar', color: 'text-rose-600 border-rose-300 hover:bg-rose-50' },
  { value: 'CANCELADA', label: 'Cancelar', color: 'text-slate-600 border-slate-300 hover:bg-slate-50' },
];

export const AprovacaoView: React.FC<AprovacaoViewProps> = ({
  occurrences,
  onUpdateOccurrence
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('AGUARDANDO_APROVACAO');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todas');
  const [selectedSchool, setSelectedSchool] = useState<string>('Todas');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [expandedOcc, setExpandedOcc] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingOcc, setSchedulingOcc] = useState<Occurrence | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleResponsible, setScheduleResponsible] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const statusList: StatusOcorrencia[] = ['ABERTA', 'AGUARDANDO_CORRECAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'RECUSADA', 'CANCELADA'];
  const tiposList: TipoSolicitacao[] = ['SERVICO', 'REPARO', 'TROCA', 'REABASTECIMENTO', 'OUTRO'];

  const schoolMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockSchoolStats.forEach(s => { map[s.instituicaoId] = s.nomeInstituicao; });
    occurrences.forEach(o => {
      if (!map[o.instituicaoId]) {
        map[o.instituicaoId] = o.instituicaoId;
      }
    });
    return map;
  }, [occurrences]);

  const schoolOptions = useMemo(() => {
    const ids = [...new Set(occurrences.map(o => o.instituicaoId))];
    return ids.map(id => ({ id, nome: schoolMap[id] || id }));
  }, [occurrences, schoolMap]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredOccurrences = useMemo(() => {
    let result = occurrences.filter((occ) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        `#${occ.numero}`.includes(q) ||
        occ.titulo.toLowerCase().includes(q) ||
        occ.descricao.toLowerCase().includes(q) ||
        (occ.localizacaoDescricao && occ.localizacaoDescricao.toLowerCase().includes(q));

      const matchesStatus = selectedStatus === 'Todas' || occ.status === selectedStatus;
      const matchesTipo = selectedTipo === 'Todas' || occ.tipoSolicitacao === selectedTipo;
      const matchesSchool = selectedSchool === 'Todas' || occ.instituicaoId === selectedSchool;

      return matchesSearch && matchesStatus && matchesTipo && matchesSchool;
    });

    result.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [occurrences, searchQuery, selectedStatus, selectedTipo, selectedSchool, sortOrder]);

  const handleStatusChange = (occ: Occurrence, newStatus: StatusOcorrencia) => {
    const feedback = actionFeedback[occ.id] || '';
    
    if (newStatus === 'AGENDADA') {
      setSchedulingOcc(occ);
      setScheduleDate('');
      setScheduleTime('');
      setScheduleResponsible('');
      setScheduleNotes('');
      setShowScheduleModal(true);
      return;
    }
    
    const updated: Occurrence = {
      ...occ,
      status: newStatus,
      dataAprovacao: newStatus === 'APROVADA' || newStatus === 'RECUSADA' ? new Date() : occ.dataAprovacao,
      dataConclusao: newStatus === 'CONCLUIDA' ? new Date() : occ.dataConclusao,
      observacoesMestre: feedback || occ.observacoesMestre,
    };

    onUpdateOccurrence(updated);
    triggerToast(`Ocorrência #${occ.numero} → ${STATUS_LABEL[newStatus]}`);
    setExpandedOcc(null);
    setActionFeedback(prev => ({ ...prev, [occ.id]: '' }));
  };

  const handleConfirmSchedule = () => {
    if (!schedulingOcc || !scheduleDate || !scheduleTime || !scheduleResponsible) {
      triggerToast('Preencha todos os campos obrigatórios');
      return;
    }
    
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const feedback = actionFeedback[schedulingOcc.id] || '';
    
    const updated: Occurrence = {
      ...schedulingOcc,
      status: 'AGENDADA',
      dataAprovacao: new Date(),
      dataVisitaAgendada: scheduleDateTime,
      prestadorServico: scheduleResponsible,
      observacoesMestre: scheduleNotes || feedback || schedulingOcc.observacoesMestre,
    };

    onUpdateOccurrence(updated);
    triggerToast(`Ocorrência #${schedulingOcc.numero} → Agendada para ${formatDate(scheduleDateTime)}`);
    setShowScheduleModal(false);
    setSchedulingOcc(null);
    setExpandedOcc(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('AGUARDANDO_APROVACAO');
    setSelectedTipo('Todas');
    setSelectedSchool('Todas');
    setSortOrder('recent');
  };

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Aprovação de Ocorrências</h2>
          <p className="text-sm text-slate-400">Aprove, agende e gerencie o andamento dos chamados de infraestrutura.</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
          <span>Painel de Filtros</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <School className="w-3.5 h-3.5" />
              Unidade Escolar
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              <option value="Todas">Todas as Escolas</option>
              {schoolOptions.map(({ id, nome }) => (
                <option key={id} value={id}>{nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar por Data
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="w-full text-sm rounded border border-slate-200 bg-slate-50 py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all text-slate-700 font-semibold"
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs py-1.5 px-3">
            Limpar Filtros
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredOccurrences.length > 0 ? (
          filteredOccurrences.map((occ) => {
            const isExpanded = expandedOcc === occ.id;
            return (
              <Card key={occ.id} className="overflow-hidden">
                <div 
                  className="px-4 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedOcc(isExpanded ? null : occ.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-mono text-sm font-bold text-slate-500 shrink-0">#{occ.numero}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{occ.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {occ.localizacaoDescricao || 'Local não informado'} • {formatDate(occ.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={occ.status} />
                    <PriorityBadge priority={occ.prioridade} />
                    <Edit className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</p>
                        <p className="text-sm text-slate-700 bg-white rounded p-3 border border-slate-200 leading-relaxed">
                          {occ.descricao}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informações</p>
                        <div className="bg-white rounded p-3 border border-slate-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tipo:</span>
                            <span className="font-bold text-slate-700">{TIPO_LABEL[occ.tipoSolicitacao]}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Localização:</span>
                            <span className="font-bold text-slate-700">{occ.localizacaoDescricao || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Criado em:</span>
                            <span className="font-bold text-slate-700">{formatDate(occ.createdAt)}</span>
                          </div>
                          {occ.observacoesTriagem && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-xs text-slate-400 block mb-1">Obs. da Triagem:</span>
                              <p className="text-sm text-slate-600 italic">&ldquo;{occ.observacoesTriagem}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Alterar Status da Ocorrência
                      </p>
                      
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Observação (opcional)..."
                          value={actionFeedback[occ.id] || ''}
                          onChange={(e) => setActionFeedback(prev => ({ ...prev, [occ.id]: e.target.value }))}
                          className="w-full text-sm rounded border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-medium"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {STATUS_ACTIONS.map(({ value, label, color }) => (
                          <button
                            key={value}
                            onClick={() => handleStatusChange(occ, value)}
                            className={`px-3 py-1.5 text-xs font-bold rounded border bg-white transition-all cursor-pointer hover:shadow-sm ${color}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-10 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
            <p className="text-base font-semibold text-slate-400">Nenhuma ocorrência encontrada</p>
            <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros para encontrar resultados.</p>
          </Card>
        )}
      </div>

      <div className="text-xs font-bold text-slate-400 text-right">
        Exibindo {filteredOccurrences.length} de {occurrences.length} ocorrências
      </div>

      {showScheduleModal && schedulingOcc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900">Agendar Visita Técnica</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ocorrência</p>
                <p className="text-sm font-bold text-slate-800">#{schedulingOcc.numero} - {schedulingOcc.titulo}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Data da Visita <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm rounded border border-slate-200 bg-white px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Horário <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 bg-white px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Responsável / Equipe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Equipe de Manutenção Predial"
                  value={scheduleResponsible}
                  onChange={(e) => setScheduleResponsible(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 bg-white px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações (opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre o agendamento..."
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancelar
              </Button>
              <Button variant="secondary" onClick={handleConfirmSchedule} className="flex-1 bg-brand-blue hover:bg-brand-teal">
                <Calendar className="w-4 h-4 mr-1.5" />
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};