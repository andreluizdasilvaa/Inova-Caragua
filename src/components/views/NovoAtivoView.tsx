'use client';

import React, { useState, useCallback } from 'react';
import { Asset, CategoriaItem, StatusItem, EstadoConservacao } from '@/mockData';
import { Card, Button } from '@/components/UI';
import { 
  ArrowLeft, 
  CheckCircle, 
  Hash, 
  Tag, 
  FileText, 
  MapPin, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface NovoAtivoViewProps {
  setView: (view: string) => void;
  onRegisterAsset: (asset: Asset) => void;
  userRole?: 'MESTRE' | 'TRIAGEM' | 'ESCOLA';
  instituicaoId?: string;
  instituicaoNome?: string;
}

const CATEGORIA_OPTIONS: { value: CategoriaItem; label: string }[] = [
  { value: 'INFORMATICA', label: 'Informática' },
  { value: 'MOBILIARIO', label: 'Mobiliário' },
  { value: 'ELETRODOMESTICO', label: 'Eletrodoméstico' },
  { value: 'CONECTIVIDADE', label: 'Conectividade' },
  { value: 'PREDIAL', label: 'Predial' },
  { value: 'OUTRO', label: 'Outro' },
];

const STATUS_OPTIONS: { value: StatusItem; label: string }[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
  { value: 'BAIXADO', label: 'Baixado' },
];

const LOCALIZACAO_OPTIONS = [
  'Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5',
  'Sala 6', 'Sala 7', 'Sala 8', 'Sala 9', 'Sala 10',
  'Sala 11', 'Sala 12', 'Sala de Informática',
  'Biblioteca', 'Secretaria', 'Diretoria',
  'Coordenação', 'Pátio', 'Refeitório',
  'Cozinha', 'Quadra', 'Laboratório',
  'Corredor', 'Depósito', 'Banheiro',
];

export const NovoAtivoView: React.FC<NovoAtivoViewProps> = ({
  setView,
  onRegisterAsset,
  userRole = 'ESCOLA',
  instituicaoId: propInstituicaoId,
  instituicaoNome,
}) => {
  // Form state
  const [numeroPatrimonio, setNumeroPatrimonio] = useState('');
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [descricaoAdicional, setDescricaoAdicional] = useState('');
  const [categoria, setCategoria] = useState<CategoriaItem>('INFORMATICA');
  const [localizacao, setLocalizacao] = useState('');
  const [showLocalizacaoDropdown, setShowLocalizacaoDropdown] = useState(false);
  const [status, setStatus] = useState<StatusItem>('ATIVO');
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [instituicaoId, setInstituicaoId] = useState(propInstituicaoId || '');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter localizacao options
  const filteredLocalizacoes = LOCALIZACAO_OPTIONS.filter(
    (loc) => loc.toLowerCase().includes(localizacao.toLowerCase())
  );

  const handleSubmit = () => {
    // Clear previous errors
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'O nome do item é obrigatório.';
    }

    if (userRole === 'MESTRE' && !instituicaoId.trim()) {
      newErrors.instituicaoId = 'Selecione a unidade escolar.';
    }

    if (!localizacao.trim()) {
      newErrors.localizacao = 'Informe a localização do ativo.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const newAsset: Asset = {
      id: numeroPatrimonio.trim() || `PAT-${Date.now()}`,
      nome: nome.trim(),
      categoria: categoria,
      numeroPatrimonio: numeroPatrimonio.trim() || null,
      numeroSerie: null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      estadoConservacao: 'NOVO',
      status: status,
      dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
      valorAquisicao: null,
      observacoes: descricaoAdicional.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      setorId: localizacao.trim() || 'setor_padrao',
      instituicaoId: userRole === 'MESTRE' ? instituicaoId : propInstituicaoId || 'inst_padrao',
      cadastradoPorId: null,
    };

    onRegisterAsset(newAsset);

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setView('inventario');
    }, 2500);
  };

  const formatDateForInput = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-16 right-4 bg-teal-900 text-white border border-teal-700 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-3 animate-fade-in max-w-sm">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">Ativo cadastrado com sucesso!</p>
            <p className="text-xs text-teal-300 mt-0.5 truncate font-medium">
              {nome || numeroPatrimonio || 'Novo item'}
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setView('inventario')} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Novo Ativo</h2>
          <p className="text-sm text-slate-400">Cadastre um novo item no inventário patrimonial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. IDENTIFICAÇÃO DO ATIVO */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Hash className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">1. Identificação do Ativo</h3>
            </div>

            {/* Chave de Patrimônio */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Chave de Patrimônio
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={numeroPatrimonio}
                  onChange={(e) => setNumeroPatrimonio(e.target.value)}
                  placeholder="Ex: PAT-2026-001"
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>
            </div>

            {/* Nome do Item */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Nome do Item <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ar Condicionado 12000 BTUs"
                  className={`w-full text-sm rounded border bg-slate-50 pl-10 pr-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold ${
                    errors.nome ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.nome && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />{errors.nome}
                </p>
              )}
            </div>

            {/* Marca / Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Marca</label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex: Consul"
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Modelo</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: Split Hi-Wall Eco"
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold"
                />
              </div>
            </div>
          </Card>

          {/* 2. CLASSIFICAÇÃO */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">2. Classificação</h3>
            </div>

            {/* Categoria do Ativo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Categoria do Ativo</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIA_OPTIONS.map(({ value, label }) => {
                  const isActive = categoria === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setCategoria(value)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-ice border-brand-blue ring-1 ring-brand-blue/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-brand-blue' : 'text-slate-700'}`}>
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status do Ativo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status do Ativo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {STATUS_OPTIONS.map(({ value, label }) => {
                  const isActive = status === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setStatus(value)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-ice border-brand-blue ring-1 ring-brand-blue/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-brand-blue' : 'text-slate-700'}`}>
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Localização do Ativo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Localização do Ativo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => {
                    setLocalizacao(e.target.value);
                    setShowLocalizacaoDropdown(true);
                  }}
                  onFocus={() => setShowLocalizacaoDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLocalizacaoDropdown(false), 200)}
                  placeholder="Ex: Sala 1, Secretaria, Pátio..."
                  className={`w-full text-sm rounded border bg-slate-50 pl-10 pr-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold ${
                    errors.localizacao ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  }`}
                />
                {showLocalizacaoDropdown && localizacao && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredLocalizacoes.length > 0 ? (
                      filteredLocalizacoes.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setLocalizacao(loc);
                            setShowLocalizacaoDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-semibold text-slate-700">{loc}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-slate-400">
                        Digite uma localização personalizada
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.localizacao && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />{errors.localizacao}
                </p>
              )}
            </div>

            {/* Data de Aquisição */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Data de Aquisição</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dataAquisicao}
                  onChange={(e) => setDataAquisicao(e.target.value)}
                  max={formatDateForInput()}
                  className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue transition-all font-semibold text-slate-700"
                />
              </div>
              <p className="text-[10px] text-slate-400">Deixe em branco caso a data exata seja desconhecida.</p>
            </div>
          </Card>

          {/* 3. INFORMAÇÕES ADICIONAIS */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">3. Informações Adicionais</h3>
            </div>

            {/* Descrição Adicional */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição Adicional</label>
              <textarea
                rows={4}
                value={descricaoAdicional}
                onChange={(e) => setDescricaoAdicional(e.target.value)}
                placeholder="Informações complementares sobre o ativo, como fornecedor, nota fiscal, observações técnicas..."
                className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar - Resumo */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4 sticky top-20">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">Resumo do Cadastro</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patrimônio</span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-0.5 truncate">
                  {numeroPatrimonio || '—'}
                </p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{nome || '—'}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
                <p className="text-sm font-bold text-brand-blue mt-0.5">
                  {CATEGORIA_OPTIONS.find((c) => c.value === categoria)?.label || categoria}
                </p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localização</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{localizacao || '—'}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label || status}
                </p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data de Aquisição</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {dataAquisicao ? new Date(dataAquisicao).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-brand-blue hover:bg-brand-teal text-sm py-3 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5" /> Cadastrar Ativo
                </span>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};