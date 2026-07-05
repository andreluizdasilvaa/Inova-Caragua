'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Occurrence, SchoolStats, Prioridade, StatusOcorrencia, TipoSolicitacao, OccurrenceHistory, PaginationInfo } from '@/types';
import { Card, Button, PriorityBadge, StatusBadge, STATUS_OCORRENCIA_LABEL } from '@/components/UI';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils/timestamp';
import { 
  MapPin, 
  Clock, 
  User, 
  History, 
  School,
  AlertTriangle,
  CheckCircle,
  FileText,
  Gavel,
  Reply,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';



interface TriagemViewProps {
  occurrences: Occurrence[];
  selectedOccurrence: Occurrence | null;
  setSelectedOccurrence: (occ: Occurrence) => void;
  onUpdateOccurrence: (occ: Occurrence) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

const TIPO_LABEL: Record<TipoSolicitacao, string> = {
  SERVICO: 'Serviço',
  REPARO: 'Reparo',
  TROCA: 'Troca',
  REABASTECIMENTO: 'Reabastecimento',
  OUTRO: 'Outro',
};

export const TriagemView: React.FC<TriagemViewProps> = ({
  occurrences,
  selectedOccurrence,
  setSelectedOccurrence,
  onUpdateOccurrence,
  pagination,
  onPageChange,
}) => {
  const currentOcc = selectedOccurrence || occurrences[0] || null;

  const [triagePriority, setTriagePriority] = useState<Prioridade | null>(currentOcc?.prioridade || null);
  const [triageTipo, setTriageTipo] = useState<TipoSolicitacao>(currentOcc?.tipoSolicitacao || 'REPARO');
  const [triageFeedback, setTriageFeedback] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [assetHistoryList, setAssetHistoryList] = useState<OccurrenceHistory[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{name: string; size: number; type: string; base64?: string}[]>([]);
  const [enviarEmail, setEnviarEmail] = useState(true);
  
  const [sortByRecent, setSortByRecent] = useState(false);
  const [sortByOldest, setSortByOldest] = useState(false);
  const [sortByUrgent, setSortByUrgent] = useState(false);
  const [sortByHigh, setSortByHigh] = useState(false);

  // Sync state when selected occurrence changes
  useEffect(() => {
    if (currentOcc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTriagePriority(currentOcc.prioridade);
      setTriageFeedback('');
      setAttachedFiles([]);
      
      // Fetch school stats
      if (currentOcc.instituicaoId) {
        api.instituicoes.get(currentOcc.instituicaoId)
          .then(data => {
            setSchoolStats({
              instituicaoId: data.id,
              nomeInstituicao: data.nome,
              openCount: data.openCount || 0,
              similarCases30d: 0,
            });
          })
          .catch(() => {
            setSchoolStats({
              instituicaoId: currentOcc.instituicaoId,
              nomeInstituicao: currentOcc.instituicaoId,
              openCount: 0,
              similarCases30d: 0,
            });
          });
      }

      // Fetch asset history
      if (currentOcc.itemId) {
        api.history.list(currentOcc.itemId)
          .then(data => setAssetHistoryList(data || []))
          .catch(() => setAssetHistoryList([]));
      } else {
        setAssetHistoryList([]);
      }
    }
  }, [currentOcc]);

  // Sort occurrences
  const sortedOccurrences = useMemo(() => {
    const pending = occurrences.filter(o => 
      o.status === 'ABERTA' || o.status === 'AGUARDANDO_APROVACAO' || o.status === 'AGUARDANDO_CORRECAO'
    );

    return [...pending].sort((a, b) => {
      if (sortByUrgent) {
        const aIsUrgent = a.prioridade === 'URGENTE';
        const bIsUrgent = b.prioridade === 'URGENTE';
        if (bIsUrgent && !aIsUrgent) return -1;
        if (!bIsUrgent && aIsUrgent) return 1;
      }

      if (sortByHigh) {
        const aIsHigh = a.prioridade === 'ALTA' || a.prioridade === 'URGENTE';
        const bIsHigh = b.prioridade === 'ALTA' || b.prioridade === 'URGENTE';
        if (bIsHigh && !aIsHigh) return -1;
        if (!bIsHigh && aIsHigh) return 1;
      }

      if (sortByRecent || sortByOldest) {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortByRecent ? dateB - dateA : dateA - dateB;
      }

      return 0;
    });
  }, [occurrences, sortByRecent, sortByOldest, sortByUrgent, sortByHigh]);

  const totalPages = pagination ? pagination.totalPages : Math.ceil(sortedOccurrences.length / 10);
  const currentPage = pagination ? pagination.page : 1;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  }, [totalPages, currentPage]);

  const handleAction = (newStatus: StatusOcorrencia) => {
    if (!currentOcc) return;
    
    const updated: Occurrence = {
      ...currentOcc,
      prioridade: triagePriority,
      tipoSolicitacao: triageTipo,
      status: newStatus,
      dataTriagem: newStatus === 'AGUARDANDO_APROVACAO' || newStatus === 'APROVADA' ? new Date() : currentOcc.dataTriagem,
      observacoesTriagem: newStatus === 'AGUARDANDO_APROVACAO' ? (triageFeedback || currentOcc.observacoesTriagem) : currentOcc.observacoesTriagem,
      // When sending back for correction, store the feedback as motivoRecusa
      motivoRecusa: newStatus === 'AGUARDANDO_CORRECAO' ? (triageFeedback || currentOcc.observacoesTriagem || '') : currentOcc.motivoRecusa,
      anexos: attachedFiles.length > 0 ? [
        ...(currentOcc.anexos || []),
        ...attachedFiles.map((f, idx) => ({
          id: `anexo_${Date.now()}_${idx}`,
          tipo: 'OUTRO',
          url: f.base64 || '',
          nomeArquivo: f.name,
          mimeType: f.type,
          tamanhoBytes: f.size
        }))
      ] : currentOcc.anexos,
      enviarEmail // extra property just to pass to API
    };

    onUpdateOccurrence(updated);
    setToastMessage(`Ocorrência #${currentOcc.numero} atualizada! Novo status: ${STATUS_OCORRENCIA_LABEL[newStatus]}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Central de Triagem</h2>
          <p className="text-sm text-slate-400">Avalie, priorize e encaminhe relatórios de infraestrutura para equipes técnicas.</p>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start h-[calc(100vh-8.5rem)] min-h-[460px]">
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
          <div className="py-3 px-4 border-b border-slate-150 bg-slate-50 shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-blue" />
              Fila de Triagem
            </h3>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              {occurrences.filter(o => o.status === 'ABERTA' || o.status === 'AGUARDANDO_APROVACAO').length} Pendentes
            </span>
          </div>

          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordenar por:</span>
            <button onClick={() => { setSortByRecent(!sortByRecent); if (!sortByRecent) setSortByOldest(false); }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ${sortByRecent ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue hover:text-brand-blue'}`}>
              <ArrowDown className="w-3.5 h-3.5" /> Mais Recentes
            </button>
            <button onClick={() => { setSortByOldest(!sortByOldest); if (!sortByOldest) setSortByRecent(false); }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ${sortByOldest ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue hover:text-brand-blue'}`}>
              <ArrowUp className="w-3.5 h-3.5" /> Mais Antigos
            </button>
            <button onClick={() => { setSortByUrgent(!sortByUrgent); if (!sortByUrgent) setSortByHigh(false); }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ${sortByUrgent ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:border-red-600 hover:text-red-600'}`}>
              <AlertTriangle className="w-3.5 h-3.5" /> Urgente
            </button>
            <button onClick={() => { setSortByHigh(!sortByHigh); if (!sortByHigh) setSortByUrgent(false); }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ${sortByHigh ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-500 hover:text-amber-600'}`}>
              <AlertTriangle className="w-3.5 h-3.5" /> Alta Prioridade
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {sortedOccurrences.map((occ) => {
              const isSelected = currentOcc?.id === occ.id;
              return (
                <div key={occ.id} onClick={() => setSelectedOccurrence(occ)}
                  className={`border rounded p-3 cursor-pointer transition-all duration-150 relative ${isSelected ? 'bg-brand-ice border-brand-blue shadow-sm ring-1 ring-brand-blue/30' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  {occ.status === 'ABERTA' && !isSelected && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                  <div className="flex justify-between items-center mb-1.5 pr-3">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white text-brand-navy' : 'bg-slate-100 text-slate-500'}`}>#{occ.numero}</span>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(occ.createdAt)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">{occ.titulo}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{occ.localizacaoDescricao || 'Local não especificado'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                    <PriorityBadge priority={occ.prioridade} />
                    <span className="text-xs font-mono font-medium text-slate-400">{TIPO_LABEL[occ.tipoSolicitacao]}</span>
                  </div>
                </div>
              );
            })}
            {sortedOccurrences.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">Nenhuma ocorrência pendente encontrada.</div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 bg-slate-50/80 px-3 py-2 flex items-center justify-between shrink-0">
              <div className="text-xs font-medium text-slate-500">
                Página {currentPage} de {totalPages}
                {pagination && (
                  <span className="ml-2">({pagination.totalCount} registros)</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-7 h-7 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {pageNumbers.map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      onClick={() => onPageChange?.(page)}
                      className={`w-7 h-7 text-xs font-medium rounded transition-all ${
                        currentPage === page
                          ? 'bg-brand-blue text-white'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={`ellipsis-${index}`} className="w-7 h-7 text-xs font-medium text-slate-400 flex items-center justify-center">
                      ...
                    </span>
                  )
                ))}
                
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-7 h-7 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col h-full gap-4 overflow-y-auto pr-1">
          {currentOcc ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">#{currentOcc.numero}</span>
                      <StatusBadge status={currentOcc.status} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">{currentOcc.titulo}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-300" /> Criado por: <span className="font-bold text-slate-600">{currentOcc.criadoPorId}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" /> {formatDate(currentOcc.createdAt)}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 font-medium leading-relaxed max-h-[120px] overflow-y-auto">
                    &ldquo;{currentOcc.descricao}&rdquo;
                  </div>
                  {currentOcc.anexos && currentOcc.anexos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imagens da Ocorrência ({currentOcc.anexos.length})</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentOcc.anexos.map((anexo: any) => (
                          <div key={anexo.id} className="flex-shrink-0 w-24 h-24 border border-slate-200 rounded overflow-hidden relative">
                            <img src={anexo.url} alt={anexo.nomeArquivo} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 shrink-0">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipo</span>
                      <span className="text-sm font-bold text-slate-700">{TIPO_LABEL[currentOcc.tipoSolicitacao]}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Localização</span>
                      <span className="text-sm font-bold text-slate-700">{currentOcc.localizacaoDescricao || 'Não informado'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 shrink-0">
                    <School className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-sm font-bold text-slate-800">Contexto da Instituição</h3>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instituição</span>
                      <span className="text-sm font-bold text-brand-blue">{schoolStats?.nomeInstituicao || 'Carregando...'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-100 rounded border border-slate-200 text-center flex flex-col justify-center">
                        <span className="text-xl font-black text-slate-800 leading-none">{schoolStats?.openCount || 0}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Chamados Abertos</span>
                      </div>
                      <div className="p-3 bg-rose-50 rounded border border-rose-200 text-center flex flex-col justify-center">
                        <span className="text-xl font-black text-rose-600 leading-none">{schoolStats?.similarCases30d || 0}</span>
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mt-1">Casos Similares</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {currentOcc.itemId && assetHistoryList.length > 0 && (
                <Card className="overflow-hidden shrink-0">
                  <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-blue" /> Histórico do Ativo ({currentOcc.itemId})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2 px-4">Data</th>
                          <th className="py-2 px-4">Status Anterior</th>
                          <th className="py-2 px-4">Status Novo</th>
                          <th className="py-2 px-4">Comentário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                        {assetHistoryList.map((hist, i) => (
                          <tr key={hist.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2 px-4 text-slate-800">{formatDate(hist.createdAt)}</td>
                            <td className="py-2 px-4 text-slate-500">{hist.statusAnterior ? STATUS_OCORRENCIA_LABEL[hist.statusAnterior] : '—'}</td>
                            <td className="py-2 px-4 font-semibold text-slate-900">{STATUS_OCORRENCIA_LABEL[hist.statusNovo]}</td>
                            <td className="py-2 px-4 text-slate-500 max-w-[280px] truncate" title={hist.comentario || ''}>{hist.comentario || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              <Card className="p-4 flex flex-col justify-between shrink-0 relative">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 shrink-0">
                  <Gavel className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-bold text-slate-800">Ação de Triagem de Chamado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. Definir Nível de Prioridade</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as Prioridade[]).map((p) => {
                        const active = triagePriority === p;
                        const colors: Record<string, string> = {
                          BAIXA: active ? 'bg-slate-100 border-slate-400 text-slate-800' : 'bg-white border-slate-200 text-slate-500',
                          MEDIA: active ? 'bg-amber-100 border-amber-400 text-amber-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                          ALTA: active ? 'bg-red-100 border-red-400 text-red-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                          URGENTE: active ? 'bg-purple-100 border-purple-400 text-purple-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                        };
                        const labels: Record<string, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', URGENTE: 'Urgente' };
                        return (
                          <button key={p} type="button" onClick={() => setTriagePriority(p)}
                            className={`border rounded py-2 text-center text-xs font-bold transition-all cursor-pointer ${colors[p]}`}>
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Tipo de Solicitação</label>
                    <select
                      value={triageTipo}
                      onChange={(e) => setTriageTipo(e.target.value as TipoSolicitacao)}
                      className="w-full text-sm rounded border border-slate-200 bg-white p-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                    >
                      {Object.entries(TIPO_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Status atual:</span>
                        <StatusBadge status={currentOcc.status} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. Observações da Triagem (Opcional)</label>
                  <textarea rows={2} value={triageFeedback} onChange={(e) => setTriageFeedback(e.target.value)}
                    placeholder="Ex: Verificar disjuntor, solicitar orçamento..."
                    className="w-full text-sm border border-slate-200 rounded p-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium placeholder:text-slate-400 resize-none" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">4. Anexos Adicionais (Base64)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="w-full text-sm border border-slate-200 rounded p-2 bg-white text-slate-700"
                    onChange={async (e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const validFiles: typeof attachedFiles = [];
                      for (const file of files) {
                        try {
                          const base64 = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          });
                          validFiles.push({ name: file.name, size: file.size, type: file.type, base64 });
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      setAttachedFiles(prev => [...prev, ...validFiles]);
                    }}
                  />
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="text-xs bg-slate-100 rounded px-2 py-1 flex items-center gap-1 border border-slate-200">
                          <span className="truncate max-w-[120px]">{f.name}</span>
                          <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-rose-700">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 mb-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enviarEmail} 
                      onChange={(e) => setEnviarEmail(e.target.checked)}
                      className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                    />
                    Enviar notificação por e-mail
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => handleAction('AGUARDANDO_CORRECAO')}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-2 px-3">
                    <Reply className="w-4 h-4 mr-1" /><span>Solicitar Correção</span>
                  </Button>
                  <Button variant="secondary" onClick={() => handleAction('AGUARDANDO_APROVACAO')}
                    className="bg-brand-blue hover:bg-brand-teal text-xs py-2 px-3">
                    <CheckCircle className="w-4 h-4 mr-1" /><span>Enviar para Aprovação</span>
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="w-14 h-14 stroke-1 text-slate-300 mb-2" />
              <p className="text-base font-semibold">Nenhum chamado de triagem selecionado.</p>
              <p className="text-sm">Selecione uma ocorrência na fila lateral para analisar os dados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};