'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Asset, Occurrence } from '@/mockData';
import { mockAssets } from '@/mockData';
import { Card, Button } from '@/components/UI';
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  Clock,
  Upload,
  FileText,
  Image,
  X,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Wrench,
  ShieldCheck,
  RefreshCw,
  Building2,
  HardHat
} from 'lucide-react';
import { getCurrentTimestamp, formatTimestamp, generateOccurrenceId } from '@/lib/utils/timestamp';

interface NovaOcorrenciaViewProps {
  assets: Asset[];
  occurrences: Occurrence[];
  setView: (view: string) => void;
  onRegisterOccurrence: (occurrence: Occurrence) => void;
}

// Tipos de ocorrência
const OCCURRENCE_TYPES = [
  { id: 'corretiva', label: 'Manutenção Corretiva', description: 'Falha / Quebra', icon: AlertTriangle },
  { id: 'preventiva', label: 'Manutenção Preventiva', description: 'Revisão', icon: RefreshCw },
  { id: 'substituicao', label: 'Substituição de Equipamento', description: 'Troca de ativo', icon: Wrench },
  { id: 'inspecao', label: 'Inspeção Estrutural', description: 'Vistoria técnica', icon: HardHat },
] as const;

type OccurrenceTypeId = typeof OCCURRENCE_TYPES[number]['id'];

// Interface para arquivos anexados
interface AttachedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const NovaOcorrenciaView: React.FC<NovaOcorrenciaViewProps> = ({
  assets,
  occurrences,
  setView,
  onRegisterOccurrence
}) => {
  // === Estado do formulário ===
  
  // 1. Identificação do Item
  const [searchMode, setSearchMode] = useState<'patrimony' | 'name'>('patrimony');
  const [patrimonyQuery, setPatrimonyQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [showPatrimonyDropdown, setShowPatrimonyDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // 2. Detalhe da Ocorrência
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceTypeId>('corretiva');
  const [occurrenceDate, setOccurrenceDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [occurrenceTime, setOccurrenceTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [description, setDescription] = useState('');
  
  // 3. Anexos
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 4. Estado de submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Patrimônios filtrados para o dropdown
  const filteredPatrimonies = useMemo(() => {
    if (!patrimonyQuery) return assets;
    const q = patrimonyQuery.toLowerCase();
    return assets.filter(a => 
      a.patrimony.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  }, [assets, patrimonyQuery]);

  // Assets filtrados por nome/localização
  const filteredByName = useMemo(() => {
    if (!nameQuery) return assets;
    const q = nameQuery.toLowerCase();
    return assets.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q)
    );
  }, [assets, nameQuery]);

  // Timestamp formatado atual
  const currentTimestamp = useMemo(() => {
    const [year, month, day] = occurrenceDate.split('-').map(Number);
    const [hours, minutes] = occurrenceTime.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    return formatTimestamp(date);
  }, [occurrenceDate, occurrenceTime]);

  // Validação do formulário
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedAsset && !nameQuery) {
      newErrors.asset = 'Selecione ou busque um ativo para registrar a ocorrência.';
    }
    
    if (!description.trim()) {
      newErrors.description = 'A descrição detalhada é obrigatória.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedAsset, nameQuery, description]);

  // Handlers
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setPatrimonyQuery(asset.patrimony);
    setNameQuery(asset.name);
    setShowPatrimonyDropdown(false);
  };

  const handleClearAsset = () => {
    setSelectedAsset(null);
    setPatrimonyQuery('');
    setNameQuery('');
  };

  const processFiles = (files: File[]) => {
    const validFiles: AttachedFile[] = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`O arquivo "${file.name}" excede o limite de 10MB.`);
        continue;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`O arquivo "${file.name}" não é um tipo permitido. Use JPG, PNG ou PDF.`);
        continue;
      }
      
      const attachedFile: AttachedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
      };
      
      // Gerar preview para imagens
      if (file.type.startsWith('image/')) {
        attachedFile.preview = URL.createObjectURL(file);
      }
      
      validFiles.push(attachedFile);
    }
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const [year, month, day] = occurrenceDate.split('-').map(Number);
    const [hours, minutes] = occurrenceTime.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    
    const typeLabel = OCCURRENCE_TYPES.find(t => t.id === occurrenceType)?.label || occurrenceType;
    
    const newOccurrence: Occurrence = {
      id: generateOccurrenceId(occurrences.map(o => o.id)),
      school: selectedAsset?.location || 'Não especificada',
      category: typeLabel,
      priority: 'Média',
      status: 'Aberto',
      date: formatTimestamp(dateObj),
      description: description.trim(),
      reportedBy: 'Usuário do Sistema',
      reportedAtTime: currentTimestamp,
      assetName: selectedAsset?.name || nameQuery || 'Não especificado',
      assetPatrimony: selectedAsset?.patrimony,
      attachments: attachedFiles.map(f => f.name),
    };
    
    // Simular delay de registro
    setTimeout(() => {
      onRegisterOccurrence(newOccurrence);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setView('ocurrencias');
      }, 2000);
    }, 800);
  };

  const getOccurrenceTypeIcon = (typeId: OccurrenceTypeId) => {
    const type = OCCURRENCE_TYPES.find(t => t.id === typeId);
    if (!type) return AlertTriangle;
    return type.icon;
  };

  return (
    <div className="space-y-5">
      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="fixed top-16 right-4 bg-teal-900 text-white border border-teal-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">Ocorrência registrada com sucesso!</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('ocurrencias')}
          className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Nova Ocorrência</h2>
          <p className="text-sm text-slate-400">Registre um novo chamado de manutenção ou inspeção.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* === COLUNA PRINCIPAL (8 Cols) === */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. IDENTIFICAÇÃO DO ITEM */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Search className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">1. Identificação do Item</h3>
            </div>

            {/* Toggle de modo de busca */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 w-fit">
              <button
                onClick={() => { setSearchMode('patrimony'); setSelectedAsset(null); setPatrimonyQuery(''); setNameQuery(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  searchMode === 'patrimony' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Chave de Patrimônio
              </button>
              <button
                onClick={() => { setSearchMode('name'); setSelectedAsset(null); setPatrimonyQuery(''); setNameQuery(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  searchMode === 'name' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Nome / Localização
              </button>
            </div>

            {searchMode === 'patrimony' ? (
              /* Busca por Patrimônio com Autocomplete */
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Digite o código do patrimônio ou nome do ativo..."
                    value={patrimonyQuery}
                    onChange={(e) => {
                      setPatrimonyQuery(e.target.value);
                      setSelectedAsset(null);
                      setShowPatrimonyDropdown(true);
                    }}
                    onFocus={() => setShowPatrimonyDropdown(true)}
                    className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-400 font-semibold"
                  />
                  {patrimonyQuery && (
                    <button
                      onClick={handleClearAsset}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown de autocomplete */}
                {showPatrimonyDropdown && patrimonyQuery && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {filteredPatrimonies.length > 0 ? (
                      filteredPatrimonies.map((asset) => (
                        <button
                          key={asset.patrimony}
                          onClick={() => handleSelectAsset(asset)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold text-brand-blue">{asset.patrimony}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">{asset.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{asset.name}</p>
                          <p className="text-xs text-slate-500">{asset.location}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-slate-400">
                        Nenhum ativo encontrado para &ldquo;{patrimonyQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Ativo selecionado */}
                {selectedAsset && (
                  <div className="mt-2.5 p-3 bg-brand-ice border border-brand-blue/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-blue/10 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-brand-blue" />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-brand-blue">{selectedAsset.patrimony}</span>
                          <p className="text-sm font-bold text-slate-800">{selectedAsset.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{selectedAsset.location}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Busca por Nome / Localização */
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome do equipamento, marca, modelo ou local..."
                    value={nameQuery}
                    onChange={(e) => {
                      setNameQuery(e.target.value);
                      setSelectedAsset(null);
                    }}
                    className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-400 font-semibold"
                  />
                </div>

                {/* Resultados da busca rápida */}
                {nameQuery && !selectedAsset && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {filteredByName.length > 0 ? (
                      filteredByName.map((asset) => (
                        <button
                          key={asset.patrimony}
                          onClick={() => handleSelectAsset(asset)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">{asset.name}</span>
                            <span className="font-mono text-xs text-slate-400">{asset.patrimony}</span>
                          </div>
                          <p className="text-xs text-slate-500">{asset.location} • {asset.brand} {asset.model}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-slate-400">
                        Nenhum ativo encontrado. Você pode registrar a ocorrência informando o nome manualmente.
                      </div>
                    )}
                  </div>
                )}

                {/* Ativo selecionado ou nome manual */}
                {selectedAsset ? (
                  <div className="p-3 bg-brand-ice border border-brand-blue/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-blue/10 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-brand-blue" />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-brand-blue">{selectedAsset.patrimony}</span>
                          <p className="text-sm font-bold text-slate-800">{selectedAsset.name}</p>
                        </div>
                      </div>
                      <button onClick={handleClearAsset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : nameQuery && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700">
                      Item sem patrimônio cadastrado. A ocorrência será registrada com o nome: <strong>{nameQuery}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {errors.asset && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errors.asset}
              </p>
            )}
          </Card>

          {/* 2. DETALHE DA OCORRÊNCIA */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">2. Detalhe da Ocorrência</h3>
            </div>

            {/* Tipo de Ocorrência */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tipo de Ocorrência
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {OCCURRENCE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = occurrenceType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setOccurrenceType(type.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-ice border-brand-blue ring-1 ring-brand-blue/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-brand-blue' : 'text-slate-700'}`}>
                        {type.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data / Hora */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Data / Hora do Registro
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-blue transition-all text-left cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 flex-1">{currentTimestamp}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showDateTimePicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Data</label>
                        <input
                          type="date"
                          value={occurrenceDate}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setOccurrenceDate(e.target.value)}
                          className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Horário</label>
                        <input
                          type="time"
                          value={occurrenceTime}
                          onChange={(e) => setOccurrenceTime(e.target.value)}
                          className="w-full text-sm rounded border border-slate-200 bg-slate-50 p-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowDateTimePicker(false)}
                        className="text-xs py-1.5 px-3"
                      >
                        Confirmar Data/Hora
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição Detalhada */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Descrição Detalhada <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema observado, condições do equipamento e possíveis impactos nas atividades escolares..."
                className={`w-full text-sm border rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium placeholder:text-slate-400 resize-none ${
                  errors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                }`}
              />
              <div className="flex items-center justify-between">
                {errors.description ? (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-slate-400 font-medium">{description.length} caracteres</span>
              </div>
            </div>
          </Card>

          {/* 3. ANEXOS */}
          <Card className="p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Upload className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">3. Anexos</h3>
              <span className="text-xs text-slate-400 font-medium ml-auto">JPG, PNG, PDF • Máx. 10MB</span>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-blue bg-brand-ice'
                  : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-brand-blue' : 'text-slate-300'}`} />
              <p className="text-sm font-semibold text-slate-600">
                {isDragging ? 'Solte os arquivos aqui...' : 'Arraste fotos ou relatórios aqui'}
              </p>
              <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
            </div>

            {/* Lista de arquivos anexados */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">
                  {attachedFiles.length} arquivo(s) anexado(s)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 group"
                    >
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-7 h-7 text-rose-500 shrink-0" />
                      ) : file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-7 h-7 rounded object-cover shrink-0" />
                      ) : (
                        <Image className="w-7 h-7 text-slate-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* === COLUNA LATERAL (4 Cols) - Resumo e Ação === */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4 sticky top-20">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">Resumo do Registro</h3>
            </div>

            <div className="space-y-3">
              {/* Item selecionado */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {selectedAsset?.name || nameQuery || '—'}
                </p>
                {selectedAsset && (
                  <p className="font-mono text-xs text-slate-500">{selectedAsset.patrimony}</p>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Tipo */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {OCCURRENCE_TYPES.find(t => t.id === occurrenceType)?.label}
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Data/Hora */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data/Hora</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{currentTimestamp}</p>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Anexos */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anexos</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {attachedFiles.length > 0 ? `${attachedFiles.length} arquivo(s)` : 'Nenhum'}
                </p>
              </div>
            </div>

            {/* Botão de Registro */}
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-brand-blue hover:bg-brand-teal text-sm py-3 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5" />
                  Registrar Ocorrência
                </span>
              )}
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};