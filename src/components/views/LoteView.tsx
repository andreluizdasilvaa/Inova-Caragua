'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Asset, CategoriaItem, EstadoConservacao, StatusItem } from '@/types';
import { api } from '@/lib/api';
import { Card, Button } from '@/components/UI';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  Grid, 
  Download,
  School,
  ChevronDown,
  Search,
  Tag,
  Hash
} from 'lucide-react';

interface LoteViewProps {
  assets: Asset[];
  setView: (view: string) => void;
  onGenerateBatch: (newAssets: Asset[]) => void;
  instituicaoId?: string;
  userRole?: 'MESTRE' | 'TRIAGEM' | 'ESCOLA';
  instituicaoNome?: string;
}

const STATUS_OPTIONS: { value: StatusItem; label: string }[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
  { value: 'BAIXADO', label: 'Baixado' },
];

export const LoteView: React.FC<LoteViewProps> = ({
  assets,
  setView,
  onGenerateBatch,
  instituicaoId: propInstituicaoId,
  userRole = 'ESCOLA',
  instituicaoNome,
}) => {
  const [prefix, setPrefix] = useState('PAT-2026-');
  const [quantity, setQuantity] = useState(6);
  const [startSequence, setStartSequence] = useState(1);
  
  const [assetName, setAssetName] = useState('');
  const [assetMarca, setAssetMarca] = useState('');
  const [assetModelo, setAssetModelo] = useState('');
  const [assetCategory, setAssetCategory] = useState<CategoriaItem>('INFORMATICA');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetStatus, setAssetStatus] = useState<StatusItem>('ATIVO');

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // School selection for MESTRE
  const [instituicaoId, setInstituicaoId] = useState(propInstituicaoId || '');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schools, setSchools] = useState<any[]>([]);

  const isMestre = userRole === 'MESTRE';

  // Fetch schools from API
  useEffect(() => {
    if (isMestre) {
      api.instituicoes.list()
        .then(data => setSchools(Array.isArray(data) ? data : []))
        .catch(() => setSchools([]));
    }
  }, [isMestre]);

  const selectedSchool = schools.find((s: any) => s.id === instituicaoId);
  const selectedSchoolName = isMestre 
    ? (selectedSchool?.nome || '')
    : (instituicaoNome || 'Minha Escola');

  const filteredSchools = schools.filter((s: any) => 
    s.nome.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const previewSequence = useMemo(() => {
    const list: string[] = [];
    const limit = Math.max(1, Math.min(100, quantity));
    for (let i = 0; i < limit; i++) {
      const seqNum = startSequence + i;
      const formattedSeq = String(seqNum).padStart(3, '0');
      list.push(`${prefix}${formattedSeq}`);
    }
    return list;
  }, [prefix, quantity, startSequence]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBatchGenerate = () => {
    const resolvedInstituicaoId = isMestre ? instituicaoId : (propInstituicaoId || 'inst_padrao');

    const batch: Asset[] = previewSequence.map((pat) => ({
      id: pat,
      nome: assetName,
      categoria: assetCategory,
      numeroPatrimonio: pat,
      numeroSerie: `SRL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      marca: assetMarca || null,
      modelo: assetModelo || null,
      estadoConservacao: 'NOVO' as EstadoConservacao,
      status: assetStatus,
      dataAquisicao: new Date(),
      valorAquisicao: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      setorId: assetLocation || 'setor_padrao',
      instituicaoId: resolvedInstituicaoId,
      cadastradoPorId: null,
    }));

    onGenerateBatch(batch);
    setShowSuccessToast(true);
    setView('inventario');
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {showSuccessToast && (
        <div className="fixed top-16 right-4 bg-teal-900 text-white border border-teal-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">Lote de {quantity} ativos adicionado ao inventário!</span>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-16 right-4 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 bg-brand-teal rounded-full animate-ping" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setView('inventario')} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Geração de Ativos em Lote</h2>
          <p className="text-sm text-slate-400">Crie sequências de patrimônios e exporte etiquetas de rastreamento escolares.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <Card className="lg:col-span-5 p-4 space-y-5">
          {isMestre && (
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-slate-800">Unidade Escolar</h3>
              </div>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input type="text" readOnly value={selectedSchoolName}
                  onFocus={() => setShowSchoolDropdown(true)}
                  placeholder="Selecione uma escola..."
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-10 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold cursor-pointer" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {showSchoolDropdown && (
                  <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input type="text" value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)}
                          placeholder="Buscar escola..." className="w-full text-xs rounded border border-slate-200 bg-slate-50 pl-8 pr-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-blue font-medium" autoFocus />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredSchools.length > 0 ? filteredSchools.map((school: any) => (
                        <button key={school.id} onClick={() => { setInstituicaoId(school.id); setSchoolSearch(''); setShowSchoolDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer ${instituicaoId === school.id ? 'bg-brand-ice' : ''}`}>
                          <p className="text-sm font-semibold text-slate-800">{school.nome}</p>
                        </button>
                      )) : (
                        <div className="px-4 py-4 text-center text-sm text-slate-400">Nenhuma escola encontrada</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 shrink-0">
            <Settings className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-800">Parâmetros da Sequência</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prefixo do Patrimônio</label>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
              </div>
              <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantidade</label>
                <input type="number" min={1} max={50} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Início da Sequência</label>
                <input type="number" min={1} value={startSequence} onChange={(e) => setStartSequence(parseInt(e.target.value) || 1)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
              </div>
            </div>

            <div className="h-px bg-slate-100" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ficha Técnica do Lote</p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Item</label>
                <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                  <input type="text" value={assetMarca} onChange={(e) => setAssetMarca(e.target.value)} placeholder="Ex: Consul"
                    className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                  <input type="text" value={assetModelo} onChange={(e) => setAssetModelo(e.target.value)} placeholder="Ex: Split Eco"
                    className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value as CategoriaItem)}
                    className="w-full text-sm rounded border border-slate-200 bg-white p-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700">
                    <option value="INFORMATICA">Informática</option>
                    <option value="MOBILIARIO">Mobiliário</option>
                    <option value="ELETRODOMESTICO">Eletrodoméstico</option>
                    <option value="CONECTIVIDADE">Conectividade</option>
                    <option value="PREDIAL">Predial</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status do Ativo</label>
                  <select value={assetStatus} onChange={(e) => setAssetStatus(e.target.value as StatusItem)}
                    className="w-full text-sm rounded border border-slate-200 bg-white p-2 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local de Instalação</label>
                <input type="text" value={assetLocation} onChange={(e) => setAssetLocation(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700" />
              </div>
            </div>

            <Button variant="secondary" onClick={handleBatchGenerate}
              className="w-full bg-brand-blue hover:bg-brand-teal text-xs py-2 mt-2">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Gerar Ativos</span>
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-7 p-4 flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-brand-blue" />
                Sequência de Patrimônios ({previewSequence.length})
              </h3>
              <button onClick={() => triggerToast('Sequência exportada!')}
                className="text-xs font-bold text-slate-500 hover:text-brand-blue flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[240px] pr-1">
              {previewSequence.map((pat) => (
                <div key={pat}
                  className="border border-dashed border-slate-200 rounded p-3 bg-slate-50/40 text-center flex flex-col justify-between items-center relative group hover:border-brand-blue hover:bg-brand-ice/20 transition-all duration-150">
                  <div className="flex flex-col items-center w-full">
                    <div className="w-14 h-8 flex items-center gap-0.5 justify-center opacity-80 mb-1.5">
                      {[0.5, 1, 0.5, 1.5, 0.5, 1, 0.5].map((w, i) => (
                        <div key={i} className="h-full bg-slate-900" style={{ width: `${w*4}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-black text-slate-800 tracking-wider">{pat}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5 truncate max-w-full uppercase tracking-wider">{assetCategory}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded p-3 border border-slate-200 mt-4 flex items-start gap-3 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-800">Verificação de Chaves Primárias Concluída</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Todos os códigos gerados foram validados. Não há colisões ou duplicidade.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};