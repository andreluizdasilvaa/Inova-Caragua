'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Asset, Occurrence, TipoSolicitacao } from '@/mockData';
import { Card, Button, TIPO_SOLICITACAO_LABEL } from '@/components/UI';
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  Upload,
  FileText,
  Image,
  X,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Wrench,
  RefreshCw,
  HardHat,
  Tractor
} from 'lucide-react';

interface NovaOcorrenciaViewProps {
  assets: Asset[];
  occurrences: Occurrence[];
  setView: (view: string) => void;
  onRegisterOccurrence: (occurrence: Occurrence) => void;
}

// Tipos de Solicitação
const SOLICITACAO_TYPES: { id: TipoSolicitacao; label: string; description: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'REPARO', label: 'Reparo', description: 'Falha / Quebra', icon: AlertTriangle },
  { id: 'SERVICO', label: 'Serviço', description: 'Mão de obra', icon: Wrench },
  { id: 'TROCA', label: 'Troca', description: 'Substituição', icon: RefreshCw },
  { id: 'REABASTECIMENTO', label: 'Reabastecimento', description: 'Insumos', icon: Tractor },
  { id: 'OUTRO', label: 'Outro', description: 'Demais solicitações', icon: HardHat },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [solicitacaoType, setSolicitacaoType] = useState<TipoSolicitacao>('REPARO');
  const [title, setTitle] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [description, setDescription] = useState('');
  
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Assets filtrados
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(a => 
      (a.numeroPatrimonio && a.numeroPatrimonio.toLowerCase().includes(q)) ||
      a.nome.toLowerCase().includes(q) ||
      (a.marca && a.marca.toLowerCase().includes(q))
    );
  }, [assets, searchQuery]);

  // Validação
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório.';
    }
    
    if (!description.trim()) {
      newErrors.description = 'A descrição detalhada é obrigatória.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres.';
    }
    
    if (!localizacao.trim()) {
      newErrors.localizacao = 'Informe a localização.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, localizacao]);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSearchQuery(`${asset.numeroPatrimonio || ''} - ${asset.nome}`);
    setShowAssetDropdown(false);
  };

  const handleClearAsset = () => {
    setSelectedAsset(null);
    setSearchQuery('');
  };

  const processFiles = (files: File[]) => {
    const validFiles: AttachedFile[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) continue;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      const attachedFile: AttachedFile = {
        name: file.name, size: file.size, type: file.type,
      };
      if (file.type.startsWith('image/')) attachedFile.preview = URL.createObjectURL(file);
      validFiles.push(attachedFile);
    }
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
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
    
    const newOccurrence: Occurrence = {
      id: `occ_${Date.now()}`,
      numero: occurrences.length + 1,
      titulo: title.trim(),
      descricao: description.trim(),
      tipoSolicitacao: solicitacaoType,
      status: 'ABERTA',
      prioridade: null,
      localizacaoDescricao: localizacao.trim(),
      numeroPatrimonioTexto: selectedAsset?.numeroPatrimonio || null,
      observacoesTriagem: null,
      observacoesMestre: null,
      motivoRecusa: null,
      prestadorServico: null,
      valorOrcamento: null,
      dataVisitaAgendada: null,
      dataConclusao: null,
      dataTriagem: null,
      dataAprovacao: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      instituicaoId: 'inst_padrao',
      setorId: null,
      itemId: selectedAsset?.id || null,
      criadoPorId: 'user_atual',
      triagemPorId: null,
      aprovadoPorId: null,
    };
    
    setTimeout(() => {
      onRegisterOccurrence(newOccurrence);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setView('ocorrencias');
      }, 2000);
    }, 800);
  };

  return (
    <div className="space-y-5">
      {showSuccess && (
        <div className="fixed top-16 right-4 bg-teal-900 text-white border border-teal-700 px-4 py-2.5 rounded shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-semibold">Ocorrência registrada com sucesso!</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setView('ocorrencias')} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Nova Ocorrência</h2>
          <p className="text-sm text-slate-400">Registre um novo chamado de manutenção ou inspeção.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. IDENTIFICAÇÃO */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Search className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">1. Identificação do Item</h3>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por patrimônio ou nome do ativo..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedAsset(null); setShowAssetDropdown(true); }}
                onFocus={() => setShowAssetDropdown(true)}
                className="w-full text-sm rounded border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-400 font-semibold"
              />
              {searchQuery && (
                <button onClick={handleClearAsset} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}

              {showAssetDropdown && searchQuery && !selectedAsset && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                    <button key={asset.id} onClick={() => handleSelectAsset(asset)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-brand-blue">{asset.numeroPatrimonio || asset.id}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{asset.nome}</p>
                    </button>
                  )) : (
                    <div className="px-4 py-4 text-center text-sm text-slate-400">Nenhum ativo encontrado</div>
                  )}
                </div>
              )}

              {selectedAsset && (
                <div className="mt-2.5 p-3 bg-brand-ice border border-brand-blue/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-brand-blue/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-brand-blue" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-brand-blue">{selectedAsset.numeroPatrimonio || selectedAsset.id}</span>
                        <p className="text-sm font-bold text-slate-800">{selectedAsset.nome}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 2. DETALHE */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">2. Detalhe da Ocorrência</h3>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tipo de Solicitação</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {SOLICITACAO_TYPES.map(({ id, label, description, icon: Icon }) => {
                  const isActive = solicitacaoType === id;
                  return (
                    <button key={id} onClick={() => setSolicitacaoType(id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isActive ? 'bg-brand-ice border-brand-blue ring-1 ring-brand-blue/30' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}>
                      <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-brand-blue' : 'text-slate-700'}`}>{label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Título <span className="text-rose-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vazamento no banheiro masculino"
                className={`w-full text-sm rounded border p-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-medium ${errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              />
              {errors.title && <p className="text-xs font-bold text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Localização <span className="text-rose-500">*</span></label>
              <input type="text" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Ex: Sala 04, Segundo andar"
                className={`w-full text-sm rounded border p-2.5 outline-none focus:ring-1 focus:ring-brand-blue transition-all font-medium ${errors.localizacao ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              />
              {errors.localizacao && <p className="text-xs font-bold text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{errors.localizacao}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição Detalhada <span className="text-rose-500">*</span></label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema..."
                className={`w-full text-sm border rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-blue transition-all bg-white font-medium resize-none ${errors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              />
              {errors.description && <p className="text-xs font-bold text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{errors.description}</p>}
            </div>
          </Card>

          {/* 3. ANEXOS */}
          <Card className="p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Upload className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">3. Anexos</h3>
              <span className="text-xs text-slate-400 font-medium ml-auto">JPG, PNG, PDF • Máx. 10MB</span>
            </div>

            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-brand-blue bg-brand-ice' : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50'}`}>
              <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} className="hidden" />
              <Upload className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-brand-blue' : 'text-slate-300'}`} />
              <p className="text-sm font-semibold text-slate-600">{isDragging ? 'Solte os arquivos aqui...' : 'Arraste fotos ou relatórios aqui'}</p>
              <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">{attachedFiles.length} arquivo(s) anexado(s)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 group">
                      {file.type === 'application/pdf' ? <FileText className="w-7 h-7 text-rose-500 shrink-0" />
                        : file.preview ? <img src={file.preview} alt={file.name} className="w-7 h-7 rounded object-cover shrink-0" />
                        : <Image className="w-7 h-7 text-slate-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button onClick={() => handleRemoveFile(index)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Resumo */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4 sticky top-20">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-slate-800">Resumo do Registro</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedAsset?.nome || '—'}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{TIPO_SOLICITACAO_LABEL[solicitacaoType] || solicitacaoType}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localização</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{localizacao || '—'}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anexos</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{attachedFiles.length > 0 ? `${attachedFiles.length} arquivo(s)` : 'Nenhum'}</p>
              </div>
            </div>

            <Button variant="secondary" onClick={handleSubmit} disabled={isSubmitting}
              className="w-full bg-brand-blue hover:bg-brand-teal text-sm py-3 mt-2">
              {isSubmitting ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registrando...</span>
              ) : (
                <span className="flex items-center gap-1.5"><CheckCircle className="w-5 h-5" /> Registrar Ocorrência</span>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};