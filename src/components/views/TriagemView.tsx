'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, SchoolStats, Prioridade, StatusOcorrencia, TipoSolicitacao } from '@/types';
import { OccurrenceHistory } from '@/types';
import { Card, Button, PriorityBadge, StatusBadge, STATUS_OCORRENCIA_LABEL } from '@/components/UI';
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
  X
} from 'lucide-react';
import { mockAssetHistory, mockSchoolStats } from '@/mockData';

interface TriagemViewProps {
  occurrences: Occurrence[];
  selectedOccurrence: Occurrence | null;
  setSelectedOccurrence: (occ: Occurrence) => void;
  onUpdateOccurrence: (occ: Occurrence) => void;
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
  onUpdateOccurrence
}) => {
  // If nothing is selected, default to the first pending occurrence
  const currentOcc = selectedOccurrence || occurrences[0] || null;

  // Active inputs states for Triage actions
  const [triagePriority, setTriagePriority] = useState<Prioridade | null>(currentOcc?.prioridade || null);
  const [triageFeedback, setTriageFeedback] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync state when selected occurrence changes
  React.useEffect(() => {
    if (currentOcc) {
      setTriagePriority(currentOcc.prioridade);
      setTriageFeedback('');
    }
  }, [currentOcc]);

  // Fetch school stats dynamically
  const schoolStats = useMemo<SchoolStats>(() => {
    if (!currentOcc) return { instituicaoId: '', nomeInstituicao: '', openCount: 0, similarCases30d: 0 };
    return mockSchoolStats.find(s => s.instituicaoId === currentOcc.instituicaoId) || {
      instituicaoId: currentOcc.instituicaoId,
      nomeInstituicao: currentOcc.instituicaoId,
      openCount: 6,
      similarCases30d: 1
    };
  }, [currentOcc]);

  // Fetch asset histories dynamically
  const assetHistoryList = useMemo<OccurrenceHistory[]>(() => {
    if (!currentOcc || !currentOcc.itemId) return [];
    const key = currentOcc.itemId.replace('#', '').trim();
    return mockAssetHistory[key] || [];
  }, [currentOcc]);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '—';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = (newStatus: StatusOcorrencia) => {
    if (!currentOcc) return;
    
    const updated: Occurrence = {
      ...currentOcc,
      prioridade: triagePriority,
      status: newStatus,
      dataTriagem: newStatus === 'AGUARDANDO_APROVACAO' || newStatus === 'APROVADA' ? new Date() : currentOcc.dataTriagem,
      observacoesTriagem: triageFeedback || currentOcc.observacoesTriagem,
    };

    onUpdateOccurrence(updated);
    setToastMessage(`Ocorrência #${currentOcc.numero} atualizada! Novo status: ${STATUS_OCORRENCIA_LABEL[newStatus]}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Central de Triagem</h2>
          <p className="text-sm text-slate-400">Avalie, priorize e encaminhe relatórios de infraestrutura para equipes técnicas.</p>
        </div>
      </div>

      {/* Main Toast Notifications */}
      {showToast && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Two Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start h-[calc(100vh-8.5rem)] min-h-[460px]">
        
        {/* LEFT PANE: Fila de Triagem (4 Cols) */}
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

          {/* List queue items container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {occurrences
              .filter(o => o.status === 'ABERTA' || o.status === 'AGUARDANDO_APROVACAO' || o.status === 'AGUARDANDO_CORRECAO')
              .map((occ) => {
              const isSelected = currentOcc?.id === occ.id;
              return (
                <div
                  key={occ.id}
                  onClick={() => setSelectedOccurrence(occ)}
                  className={`border rounded p-3 cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-brand-ice border-brand-blue shadow-sm ring-1 ring-brand-blue/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {occ.status === 'ABERTA' && !isSelected && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  )}
                  
                  <div className="flex justify-between items-center mb-1.5 pr-3">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white text-brand-navy' : 'bg-slate-100 text-slate-500'
                    }`}>
                      #{occ.numero}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(occ.createdAt)}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {occ.titulo}
                  </h4>

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
          </div>
        </div>

        {/* RIGHT PANE: Detalhes da Triagem e Formulário (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full gap-4 overflow-y-auto pr-1">
          {currentOcc ? (
            <>
              {/* Bento Row 1: Details & Context side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Occurrence Detail Card */}
                <Card className="p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        #{currentOcc.numero}
                      </span>
                      <StatusBadge status={currentOcc.status} />
                    </div>
                    
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {currentOcc.titulo}
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-300" />
                      Criado por: <span className="font-bold text-slate-600">{currentOcc.criadoPorId}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {formatDate(currentOcc.createdAt)}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 font-medium leading-relaxed max-h-[120px] overflow-y-auto">
                    &ldquo;{currentOcc.descricao}&rdquo;
                  </div>

                  {/* Image Gallery - mostra se a ocorrência tiver imagens */}

                  {currentOcc.anexos && currentOcc.anexos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        
                          Imagens da Ocorrência ({currentOcc.anexos.length})

                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentOcc.anexos.map((anexo) => (
                          <div key={anexo.id} className="flex-shrink-0 w-24 h-24 border border-slate-200 rounded overflow-hidden relative">
                            <img
                              src={anexo.url}
                              alt={anexo.nomeArquivo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 shrink-0">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipo</span>
                      <span className="text-sm font-bold text-slate-700">
                        {TIPO_LABEL[currentOcc.tipoSolicitacao]}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Localização</span>
                      <span className="text-sm font-bold text-slate-700">
                        {currentOcc.localizacaoDescricao || 'Não informado'}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* 2. School Context statistics card */}
                <Card className="p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 shrink-0">
                    <School className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-sm font-bold text-slate-800">Contexto da Instituição</h3>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instituição</span>
                      <span className="text-sm font-bold text-brand-blue">{schoolStats.nomeInstituicao}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-100 rounded border border-slate-200 text-center flex flex-col justify-center">
                        <span className="text-xl font-black text-slate-800 leading-none">{schoolStats.openCount}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Chamados Abertos</span>
                      </div>

                      <div className="p-3 bg-rose-50 rounded border border-rose-200 text-center flex flex-col justify-center">
                        <span className="text-xl font-black text-rose-600 leading-none">{schoolStats.similarCases30d}</span>
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mt-1">Casos Similares</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>

              {/* Bento Row 2: Equipment History Table */}
              {currentOcc.itemId && assetHistoryList.length > 0 && (
                <Card className="overflow-hidden shrink-0">
                  <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-blue" />
                      Histórico do Ativo ({currentOcc.itemId})
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
                            <td className="py-2 px-4 text-slate-500 max-w-[280px] truncate" title={hist.comentario || ''}>
                              {hist.comentario || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Bento Row 3: Action Area / Form */}
              <Card className="p-4 flex flex-col justify-between shrink-0 relative">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 shrink-0">
                  <Gavel className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-bold text-slate-800">Ação de Triagem de Chamado</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  {/* Priority selector */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      1. Definir Nível de Prioridade
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['BAIXA', 'MEDIA', 'ALTA'] as Prioridade[]).map((p) => {
                        const active = triagePriority === p;
                        const colors: Record<string, string> = {
                          BAIXA: active ? 'bg-slate-100 border-slate-400 text-slate-800' : 'bg-white border-slate-200 text-slate-500',
                          MEDIA: active ? 'bg-amber-100 border-amber-400 text-amber-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                          ALTA: active ? 'bg-red-100 border-red-400 text-red-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                        };
                        const labels: Record<string, string> = {
                          BAIXA: 'Baixa',
                          MEDIA: 'Média',
                          ALTA: 'Alta',
                        };
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTriagePriority(p)}
                            className={`border rounded py-2 text-center text-xs font-bold transition-all cursor-pointer ${colors[p]}`}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current info */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      2. Informações da Solicitação
                    </label>
                    <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Tipo:</span>
                        <span className="text-xs font-bold text-slate-700">{TIPO_LABEL[currentOcc.tipoSolicitacao]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Status atual:</span>
                        <StatusBadge status={currentOcc.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Feedback text */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    3. Observações da Triagem (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={triageFeedback}
                    onChange={(e) => setTriageFeedback(e.target.value)}
                    placeholder="Ex: Verificar disjuntor, solicitar orçamento..."
                    className="w-full text-sm border border-slate-200 rounded p-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Submittal buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => handleAction('AGUARDANDO_CORRECAO')}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-2 px-3"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    <span>Solicitar Correção</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleAction('AGUARDANDO_APROVACAO')}
                    className="bg-brand-blue hover:bg-brand-teal text-xs py-2 px-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Enviar para Aprovação</span>
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