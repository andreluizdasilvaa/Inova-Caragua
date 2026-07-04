'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, AssetHistory, SchoolStats } from '@/mockData';
import { Card, Button, PriorityBadge, StatusBadge } from '@/components/UI';
import { 
  Tv, 
  MapPin, 
  Clock, 
  User, 
  Paperclip, 
  History, 
  School,
  AlertTriangle,
  CheckCircle,
  FileText,
  Gavel,
  Reply
} from 'lucide-react';
import { mockAssetHistory, mockSchoolStats } from '@/mockData';

interface TriagemViewProps {
  occurrences: Occurrence[];
  selectedOccurrence: Occurrence | null;
  setSelectedOccurrence: (occ: Occurrence) => void;
  onUpdateOccurrence: (occ: Occurrence) => void;
}

export const TriagemView: React.FC<TriagemViewProps> = ({
  occurrences,
  selectedOccurrence,
  setSelectedOccurrence,
  onUpdateOccurrence
}) => {
  // If nothing is selected, default to the first pending occurrence
  const currentOcc = selectedOccurrence || occurrences[0] || null;

  // Active inputs states for Triage actions
  const [triagePriority, setTriagePriority] = useState<any>(currentOcc?.priority || 'Média');
  const [triageCategory, setTriageCategory] = useState(currentOcc?.category || 'Audiovisual');
  const [triageFeedback, setTriageFeedback] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync state when selected occurrence changes
  React.useEffect(() => {
    if (currentOcc) {
      setTriagePriority(currentOcc.priority);
      setTriageCategory(currentOcc.category);
      setTriageFeedback('');
    }
  }, [currentOcc]);

  // Fetch school stats dynamically
  const schoolStats = useMemo<SchoolStats>(() => {
    if (!currentOcc) return { school: '', openCount: 0, similarCases30d: 0 };
    return mockSchoolStats.find(s => s.school === currentOcc.school) || {
      school: currentOcc.school,
      openCount: 6,
      similarCases30d: 1
    };
  }, [currentOcc]);

  // Fetch asset histories dynamically
  const assetHistoryList = useMemo<AssetHistory[]>(() => {
    if (!currentOcc || !currentOcc.assetPatrimony) return [];
    // Clean patrimony strings
    const key = currentOcc.assetPatrimony.replace('#', '').trim();
    return mockAssetHistory[key] || [
      {
        date: '02/01/2026',
        occurrence: 'Vistoria rotineira',
        resolution: 'Equipamento lubrificado e testado.',
        technician: 'Felipe M.'
      }
    ];
  }, [currentOcc]);

  const handleAction = (status: 'Aberto' | 'Em Andamento' | 'Resolvido') => {
    if (!currentOcc) return;
    
    const updated: Occurrence = {
      ...currentOcc,
      priority: triagePriority,
      category: triageCategory,
      status: status,
    };

    onUpdateOccurrence(updated);
    setToastMessage(`Ocorrência ${currentOcc.id} atualizada com sucesso! Novo status: ${status}.`);
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
              {occurrences.filter(o => o.status === 'Aberto').length} Pendentes
            </span>
          </div>

          {/* List queue items container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {occurrences.map((occ) => {
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
                  {occ.status === 'Aberto' && !isSelected && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  )}
                  
                  <div className="flex justify-between items-center mb-1.5 pr-3">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white text-brand-navy' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {occ.id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{occ.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {occ.description}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-semibold">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{occ.school}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                    <PriorityBadge priority={occ.priority} />
                    <span className="text-xs font-mono font-medium text-slate-400">{occ.category}</span>
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
                        {currentOcc.id}
                      </span>
                      <StatusBadge status={currentOcc.status} />
                    </div>
                    
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {currentOcc.description.split('.')[0]}
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-300" />
                      Aberto por: <span className="font-bold text-slate-600">{currentOcc.reportedBy}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 font-medium leading-relaxed max-h-[120px] overflow-y-auto">
                    &ldquo;{currentOcc.description}&rdquo;
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 shrink-0">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Categoria</span>
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Tv className="w-4 h-4 text-slate-400" />
                        {currentOcc.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Anexos</span>
                      {currentOcc.attachments && currentOcc.attachments.length > 0 ? (
                        <div className="flex gap-1.5">
                          {currentOcc.attachments.map((file, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer">
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              {file}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sem anexos</span>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 2. School Context statistics card */}
                <Card className="p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4 shrink-0">
                    <School className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-sm font-bold text-slate-800">Contexto Escolar</h3>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade</span>
                      <span className="text-sm font-bold text-brand-blue">{schoolStats.school}</span>
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
              {currentOcc.assetPatrimony && (
                <Card className="overflow-hidden shrink-0">
                  <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-blue" />
                      Histórico do Ativo: {currentOcc.assetName} ({currentOcc.assetPatrimony})
                    </h3>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Garantia Expira em Breve
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2 px-4">Data</th>
                          <th className="py-2 px-4">Ocorrência</th>
                          <th className="py-2 px-4">Resolução</th>
                          <th className="py-2 px-4">Técnico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                        {assetHistoryList.map((hist, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2 px-4 text-slate-800">{hist.date}</td>
                            <td className="py-2 px-4 font-semibold text-slate-900">{hist.occurrence}</td>
                            <td className="py-2 px-4 text-slate-500 max-w-[280px] truncate" title={hist.resolution}>
                              {hist.resolution}
                            </td>
                            <td className="py-2 px-4 text-slate-700">{hist.technician}</td>
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
                      {['Baixa', 'Média', 'Alta'].map((p) => {
                        const active = triagePriority === p;
                        const colors = {
                          Baixa: active ? 'bg-slate-100 border-slate-400 text-slate-800' : 'bg-white border-slate-200 text-slate-500',
                          Média: active ? 'bg-amber-100 border-amber-400 text-amber-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500',
                          Alta: active ? 'bg-red-100 border-red-400 text-red-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500'
                        };
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTriagePriority(p as any)}
                            className={`border rounded py-2 text-center text-xs font-bold transition-all cursor-pointer ${colors[p as 'Baixa'|'Média'|'Alta']}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category confirmation */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      2. Confirmar Categoria de Atendimento
                    </label>
                    <select
                      value={triageCategory}
                      onChange={(e) => setTriageCategory(e.target.value)}
                      className="w-full text-sm rounded border border-slate-200 bg-white py-2 px-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                    >
                      <option value="Audiovisual">Audiovisual - Projetores</option>
                      <option value="Elétrica">Elétrica - Tomadas/Rede</option>
                      <option value="Hidráulica">Hidráulica - Encanamentos</option>
                      <option value="Climatização">Climatização - Ar Condicionado</option>
                      <option value="Segurança">Segurança - Câmeras</option>
                      <option value="Estrutural">Infraestrutura Geral</option>
                    </select>
                  </div>
                </div>

                {/* Optional Feedback text */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    3. Notas Adicionais ou Solicitação de Detalhes (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={triageFeedback}
                    onChange={(e) => setTriageFeedback(e.target.value)}
                    placeholder="Ex: Por favor, verifique se o disjuntor do corredor correspondente não desarmou..."
                    className="w-full text-sm border border-slate-200 rounded p-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Submittal buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => handleAction('Aberto')}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-2 px-3"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    <span>Devolver para Escola</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleAction('Em Andamento')}
                    className="bg-brand-blue hover:bg-brand-teal text-xs py-2 px-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Confirmar e Enviar para Equipe Técnica</span>
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