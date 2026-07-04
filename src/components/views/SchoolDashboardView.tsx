'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, Asset, AssetStatus, mockOccurrences, mockAssets, mockSchoolStats } from '@/mockData';
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
  Clock
} from "lucide-react";

type AssetStatusIcon = { icon: React.ReactNode; color: string; bgColor: string; label: string };

const assetStatusConfig: Record<AssetStatus, AssetStatusIcon> = {
  'Operacional': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200', label: 'Operacional' },
  'Em Manutenção': { icon: <Wrench className="w-4 h-4" />, color: 'text-brand-blue', bgColor: 'bg-brand-ice border-blue-150', label: 'Em Manutenção' },
  'Danificado': { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', label: 'Danificado' },
};

const getPriorityBadge = (priority: string) => {
  if (priority === 'Alta') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-150">
        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
        Alta
      </span>
    );
  }
  if (priority === 'Média') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-150">
        <Info className="w-3 h-3 text-amber-600 shrink-0" />
        Média
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
      Baixa
    </span>
  );
};

const getStatusBadge = (status: string) => {
  if (status === 'Aberto') {
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
        Aberto
      </span>
    );
  }
  if (status === 'Em Andamento') {
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold rounded bg-brand-ice text-brand-blue border border-blue-150">
        Em Andamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-150">
      <CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />
      Resolvido
    </span>
  );
};

export const SchoolDashboardView: React.FC = () => {
  // Get all unique schools from occurrences
  const schools = useMemo(() => {
    return [...new Set(mockOccurrences.map(o => o.school))];
  }, []);

  const [selectedSchool, setSelectedSchool] = useState(schools[0] || 'E.M. Machado de Assis');

  // Filter occurrences by selected school
  const schoolOccurrences = useMemo(() => {
    return mockOccurrences.filter(o => o.school === selectedSchool);
  }, [selectedSchool]);

  // Stats
  const stats = useMemo(() => {
    const open = schoolOccurrences.filter(o => o.status === 'Aberto').length;
    const inProgress = schoolOccurrences.filter(o => o.status === 'Em Andamento').length;
    const resolvedThisMonth = schoolOccurrences.filter(o => o.status === 'Resolvido').length;
    return { open, inProgress, resolvedThisMonth };
  }, [schoolOccurrences]);

  // Recent problems sorted by date (most recent first)
  const recentProblems = useMemo(() => {
    return [...schoolOccurrences]
      .sort((a, b) => {
        const dateA = new Date(a.reportedAtTime || a.date);
        const dateB = new Date(b.reportedAtTime || b.date);
        return dateB.getTime() - dateA.getTime();
      });
  }, [schoolOccurrences]);

  // Critical assets - linked to this school via assetPatrimony
  const criticalAssets = useMemo(() => {
    const schoolAssetPatrimonies = new Set(
      schoolOccurrences
        .filter(o => o.assetPatrimony)
        .map(o => o.assetPatrimony!.replace('#', '').trim())
    );

    const assets = mockAssets.filter(a => schoolAssetPatrimonies.has(a.patrimony));
    const criticalCategories = ['Segurança', 'Elétrica', 'Estrutural', 'Climatização'];
    const criticalByCategory = mockAssets.filter(a => criticalCategories.includes(a.category));

    const allUniqueAssets = new Map<string, Asset>();
    [...assets, ...criticalByCategory].forEach(a => allUniqueAssets.set(a.patrimony, a));

    return Array.from(allUniqueAssets.values());
  }, [schoolOccurrences]);

  return (
    <div className="space-y-5">
      {/* School Selector & Stats Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* School Info Card */}
        <Card className="p-4 md:w-72 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <School className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Unidade Escolar</h3>
          </div>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full text-sm rounded border border-slate-200 bg-white py-2 px-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
          >
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escola Selecionada</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedSchool}</p>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <Card className="p-4 flex items-center gap-3 border-rose-200">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0 border border-rose-150">
              <FileText className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-rose-700 leading-none">{stats.open}</span>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Ocorrências Abertas</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3 border-amber-200">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0 border border-amber-150">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-amber-700 leading-none">{stats.inProgress}</span>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Em Manutenção</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3 border-teal-200">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0 border border-teal-150">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-teal-700 leading-none">{stats.resolvedThisMonth}</span>
              <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mt-0.5">Resolvidos no Mês</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content: Recent Problems + Critical Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Problems List (2/3 width) */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-blue" />
              Problemas Recentes - {selectedSchool}
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
              {recentProblems.length} no total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Patrimônio</th>
                  <th className="py-2.5 px-4">Local / Ativo</th>
                  <th className="py-2.5 px-4">Problema Relatado</th>
                  <th className="py-2.5 px-4">Severidade</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {recentProblems.map((occ) => (
                  <tr key={occ.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {occ.assetPatrimony || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{occ.assetName || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 max-w-[220px] truncate text-slate-500" title={occ.description}>
                      {occ.description}
                    </td>
                    <td className="py-2.5 px-4">
                      {getPriorityBadge(occ.priority)}
                    </td>
                    <td className="py-2.5 px-4">
                      {getStatusBadge(occ.status)}
                    </td>
                  </tr>
                ))}
                {recentProblems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Nenhuma ocorrência encontrada para esta escola.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Critical Assets Status (1/3 width) */}
        <Card className="overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Status dos Ativos Críticos
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Segurança, elétrica, estrutura e climatização</p>
          </div>

          <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto">
            {criticalAssets.map((asset) => {
              const config = assetStatusConfig[asset.status];
              return (
                <div
                  key={asset.patrimony}
                  className={`border rounded p-3 flex items-center gap-3 transition-colors ${config.bgColor}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color} bg-white border ${config.bgColor.split(' ')[1] || 'border-slate-200'}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">
                        {asset.patrimony}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                        asset.status === 'Operacional' ? 'bg-teal-50 text-teal-700 border-teal-150' :
                        asset.status === 'Em Manutenção' ? 'bg-brand-ice text-brand-blue border-blue-150' :
                        'bg-red-50 text-red-700 border-red-150'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1 truncate">{asset.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-500">{asset.location}</span>
                    </div>
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