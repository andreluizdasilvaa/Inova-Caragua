'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, Asset, Prioridade, StatusOcorrencia, StatusItem, mockOccurrences, mockAssets, mockSchoolStats, CategoriaItem } from '@/mockData';
import { Card } from '@/components/UI';
import { 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  MapPin,
  FileText,
  School,
  Info,
  Clock,
  Ban,
  CalendarCheck
} from "lucide-react";

const PRIORIDADE_BADGE = (priority: Prioridade | null) => {
  if (!priority) {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-slate-50 text-slate-500 border border-slate-150"><Clock className="w-3 h-3 text-slate-400 shrink-0" />Pendente</span>;
  }
  if (priority === 'ALTA' || priority === 'URGENTE') {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-red-50 text-red-700 border border-red-150"><AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />{priority === 'URGENTE' ? 'Urgente' : 'Alta'}</span>;
  }
  if (priority === 'MEDIA') {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-150"><Info className="w-3 h-3 text-amber-600 shrink-0" />Média</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150"><Clock className="w-3 h-3 text-slate-500 shrink-0" />Baixa</span>;
};

const STATUS_BADGE = (status: StatusOcorrencia) => {
  if (status === 'ABERTA') return <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">Aberta</span>;
  if (status === 'EM_EXECUCAO') return <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-brand-ice text-brand-blue border border-blue-150">Em Execução</span>;
  if (status === 'CONCLUIDA') return <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-bold rounded bg-teal-50 text-teal-700 border border-teal-150"><CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />Concluída</span>;
  if (status === 'AGUARDANDO_APROVACAO') return <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-150"><Clock className="w-3 h-3 text-amber-600 shrink-0" />Aguardando</span>;
  if (status === 'APROVADA') return <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-bold rounded bg-blue-50 text-blue-700 border border-blue-150"><CheckCircle className="w-3 h-3 text-blue-600 shrink-0" />Aprovada</span>;
  return <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">{status}</span>;
};

const ASSET_STATUS_CONFIG: Record<StatusItem, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  ATIVO: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200', label: 'Ativo' },
  EM_MANUTENCAO: { icon: <Wrench className="w-4 h-4" />, color: 'text-brand-blue', bgColor: 'bg-brand-ice border-blue-150', label: 'Em Manutenção' },
  BAIXADO: { icon: <Ban className="w-4 h-4" />, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', label: 'Baixado' },
};

const CATEGORIA_CRITICA: CategoriaItem[] = ['INFORMATICA', 'CONECTIVIDADE', 'PREDIAL'];

export const SchoolDashboardView: React.FC = () => {
  const schools = useMemo(() => {
    return [...new Set(mockSchoolStats.map(s => s.nomeInstituicao))];
  }, []);

  const [selectedSchoolName, setSelectedSchoolName] = useState(schools[0] || 'E.M. Machado de Assis');

  const selectedSchool = useMemo(() => {
    return mockSchoolStats.find(s => s.nomeInstituicao === selectedSchoolName);
  }, [selectedSchoolName]);

  // Filter occurrences by selected institution
  const schoolOccurrences = useMemo(() => {
    if (!selectedSchool) return [];
    return mockOccurrences.filter(o => o.instituicaoId === selectedSchool.instituicaoId);
  }, [selectedSchool]);

  const stats = useMemo(() => {
    const open = schoolOccurrences.filter(o => o.status === 'ABERTA' || o.status === 'AGUARDANDO_CORRECAO').length;
    const inProgress = schoolOccurrences.filter(o => ['EM_EXECUCAO', 'AGENDADA', 'APROVADA', 'AGUARDANDO_APROVACAO'].includes(o.status)).length;
    const resolved = schoolOccurrences.filter(o => o.status === 'CONCLUIDA').length;
    return { open, inProgress, resolved };
  }, [schoolOccurrences]);

  const recentProblems = useMemo(() => {
    return [...schoolOccurrences].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [schoolOccurrences]);

  const criticalAssets = useMemo(() => {
    return mockAssets.filter(a => 
      CATEGORIA_CRITICA.includes(a.categoria) && a.status !== 'BAIXADO'
    );
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* School Selector & Stats Cards */}
      <div className="flex flex-col md:flex-row gap-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <Card className="p-4 flex items-center gap-3 border-rose-200">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-rose-700 leading-none">{stats.open}</span>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mt-0.5">Ocorrências Abertas</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 border-amber-200">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-amber-700 leading-none">{stats.inProgress}</span>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-0.5">Em Atendimento</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 border-teal-200">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-teal-700 leading-none">{stats.resolved}</span>
              <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mt-0.5">Resolvidos</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-blue" />
              Problemas Recentes - {selectedSchoolName}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              {recentProblems.length} no total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Nº</th>
                  <th className="py-2.5 px-4">Título</th>
                  <th className="py-2.5 px-4">Local</th>
                  <th className="py-2.5 px-4">Prioridade</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {recentProblems.map((occ) => (
                  <tr key={occ.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{occ.numero}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-[200px] truncate" title={occ.titulo}>
                      {occ.titulo}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-slate-500">{occ.localizacaoDescricao || '—'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">{PRIORIDADE_BADGE(occ.prioridade)}</td>
                    <td className="py-2.5 px-4">{STATUS_BADGE(occ.status)}</td>
                    <td className="py-2.5 px-4 text-slate-500">{formatDate(occ.createdAt)}</td>
                  </tr>
                ))}
                {recentProblems.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400">Nenhuma ocorrência encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Ativos Críticos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Informática, conectividade e predial</p>
          </div>

          <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto">
            {criticalAssets.map((asset) => {
              const config = ASSET_STATUS_CONFIG[asset.status];
              return (
                <div key={asset.id} className={`border rounded p-3 flex items-center gap-3 transition-colors ${config.bgColor}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color} bg-white border ${config.bgColor.split(' ')[1] || 'border-slate-200'}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">
                        {asset.numeroPatrimonio || asset.id}
                      </span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                        asset.status === 'ATIVO' ? 'bg-teal-50 text-teal-700 border-teal-150' :
                        asset.status === 'EM_MANUTENCAO' ? 'bg-brand-ice text-brand-blue border-blue-150' :
                        'bg-red-50 text-red-700 border-red-150'
                      }`}>{config.label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1 truncate">{asset.nome}</p>
                  </div>
                </div>
              );
            })}
            {criticalAssets.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">Nenhum ativo crítico encontrado.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};