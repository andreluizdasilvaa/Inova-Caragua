'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Asset, CategoriaItem, EstadoConservacao, StatusItem } from '@/types';
import { api } from '@/lib/api';
import { Card, Button } from '@/components/UI';
import * as XLSX from 'xlsx';
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
  Upload,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Trash2,
  Loader2,
  Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoteViewProps {
  assets: Asset[];
  setView: (view: string) => void;
  onGenerateBatch: (newAssets: Asset[]) => void;
  instituicaoId?: string;
  userRole?: 'MESTRE' | 'TRIAGEM' | 'ESCOLA';
  instituicaoNome?: string;
}

interface ParsedRow {
  nome: string;
  categoria: string;
  numeroPatrimonio: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  estadoConservacao: string;
  status: string;
  dataAquisicao: string;
  valorAquisicao: string;
  observacoes: string;
}

interface RowValidation {
  row: ParsedRow;
  index: number;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

type ActiveTab = 'sequencia' | 'importar';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: StatusItem; label: string }[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
  { value: 'BAIXADO', label: 'Baixado' },
];

const VALID_CATEGORIAS: Record<string, string> = {
  'INFORMATICA': 'INFORMATICA',
  'INFORMÁTICA': 'INFORMATICA',
  'MOBILIARIO': 'MOBILIARIO',
  'MOBILIÁRIO': 'MOBILIARIO',
  'ELETRODOMESTICO': 'ELETRODOMESTICO',
  'ELETRODOMÉSTICO': 'ELETRODOMESTICO',
  'CONECTIVIDADE': 'CONECTIVIDADE',
  'PREDIAL': 'PREDIAL',
  'OUTRO': 'OUTRO',
};

const VALID_ESTADOS: Record<string, string> = {
  'NOVO': 'NOVO',
  'BOM': 'BOM',
  'REGULAR': 'REGULAR',
  'RUIM': 'RUIM',
  'INSERVIVEL': 'INSERVIVEL',
  'INSERVÍVEL': 'INSERVIVEL',
};

const VALID_STATUS: Record<string, string> = {
  'ATIVO': 'ATIVO',
  'EM_MANUTENCAO': 'EM_MANUTENCAO',
  'EM_MANUTENÇÃO': 'EM_MANUTENCAO',
  'EM MANUTENCAO': 'EM_MANUTENCAO',
  'EM MANUTENÇÃO': 'EM_MANUTENCAO',
  'BAIXADO': 'BAIXADO',
};

const CATEGORIA_LABELS: Record<string, string> = {
  INFORMATICA: 'Informática',
  MOBILIARIO: 'Mobiliário',
  ELETRODOMESTICO: 'Eletrodoméstico',
  CONECTIVIDADE: 'Conectividade',
  PREDIAL: 'Predial',
  OUTRO: 'Outro',
};

const ESTADO_LABELS: Record<string, string> = {
  NOVO: 'Novo',
  BOM: 'Bom',
  REGULAR: 'Regular',
  RUIM: 'Ruim',
  INSERVIVEL: 'Inservível',
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Ativo',
  EM_MANUTENCAO: 'Em Manutenção',
  BAIXADO: 'Baixado',
};

// ─── Template Generation ──────────────────────────────────────────────────────

const TEMPLATE_HEADERS = [
  'Nome *',
  'Categoria',
  'Nº Patrimônio',
  'Nº Série',
  'Marca',
  'Modelo',
  'Estado de Conservação',
  'Status',
  'Data de Aquisição',
  'Valor de Aquisição (R$)',
  'Observações',
];

const INSTRUCTIONS_DATA = [
  ['INSTRUÇÕES PARA PREENCHIMENTO DA PLANILHA DE IMPORTAÇÃO EM LOTE'],
  [''],
  ['Preencha a aba "Dados" com as informações dos itens patrimoniais a serem importados.'],
  ['Campos marcados com * são obrigatórios.'],
  ['Nas colunas com dropdown, selecione um dos valores válidos apresentados.'],
  [''],
  ['COLUNAS:'],
  ['Coluna', 'Obrigatória', 'Descrição', 'Valores Válidos'],
  ['Nome *', 'SIM', 'Nome do equipamento/item', 'Texto livre (ex: Monitor LG 19)'],
  ['Categoria', 'NÃO (padrão: OUTRO)', 'Categoria do item', 'INFORMATICA, MOBILIARIO, ELETRODOMESTICO, CONECTIVIDADE, PREDIAL, OUTRO'],
  ['Nº Patrimônio', 'NÃO', 'Número de patrimônio único', 'Texto livre (deve ser único)'],
  ['Nº Série', 'NÃO', 'Número de série do equipamento', 'Texto livre'],
  ['Marca', 'NÃO', 'Fabricante/marca', 'Texto livre (ex: LG, Samsung, Dell)'],
  ['Modelo', 'NÃO', 'Modelo do equipamento', 'Texto livre (ex: Split Eco 12000)'],
  ['Estado de Conservação', 'NÃO (padrão: BOM)', 'Condição física do item', 'NOVO, BOM, REGULAR, RUIM, INSERVIVEL'],
  ['Status', 'NÃO (padrão: ATIVO)', 'Situação operacional', 'ATIVO, EM_MANUTENCAO, BAIXADO'],
  ['Data de Aquisição', 'NÃO', 'Data de compra/recebimento', 'Formato DD/MM/AAAA'],
  ['Valor de Aquisição (R$)', 'NÃO', 'Valor de compra', 'Número (ex: 1500.00)'],
  ['Observações', 'NÃO', 'Informações adicionais', 'Texto livre'],
];

function generateXlsxTemplate() {
  const wb = XLSX.utils.book_new();

  // Instructions sheet
  const wsInstructions = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_DATA);
  wsInstructions['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 40 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

  // Values sheet (hidden, for dropdowns)
  const valuesData = [
    ['Categorias', 'Estados', 'Status'],
    ['INFORMATICA', 'NOVO', 'ATIVO'],
    ['MOBILIARIO', 'BOM', 'EM_MANUTENCAO'],
    ['ELETRODOMESTICO', 'REGULAR', 'BAIXADO'],
    ['CONECTIVIDADE', 'RUIM', ''],
    ['PREDIAL', 'INSERVIVEL', ''],
    ['OUTRO', '', ''],
  ];
  const wsValues = XLSX.utils.aoa_to_sheet(valuesData);
  XLSX.utils.book_append_sheet(wb, wsValues, 'Valores');

  // Data sheet (main)
  // Start with example row to guide users
  const exampleRow = [
    'Monitor LG 24"', 'INFORMATICA', 'PAT-2026-001', 'SN-ABC123',
    'LG', '24MP400', 'NOVO', 'ATIVO', '15/03/2026', '899.90', 'Sala de informática'
  ];
  const wsData = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, exampleRow]);
  wsData['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 18 }, // Categoria
    { wch: 18 }, // Patrimônio
    { wch: 18 }, // Série
    { wch: 15 }, // Marca
    { wch: 18 }, // Modelo
    { wch: 22 }, // Estado
    { wch: 18 }, // Status
    { wch: 18 }, // Data
    { wch: 22 }, // Valor
    { wch: 30 }, // Obs
  ];

  // Add data validations (dropdowns) for enum columns
  // SheetJS supports data validation via the '!dataValidation' property
  const maxRows = 1000; // Cover enough rows for validation

  if (!wsData['!dataValidation']) wsData['!dataValidation'] = [];

  // Categoria dropdown (column B, index 1)
  wsData['!dataValidation'].push({
    sqref: `B2:B${maxRows}`,
    type: 'list',
    formula1: 'Valores!$A$2:$A$7',
    showDropDown: true,
    showErrorMessage: true,
    errorTitle: 'Valor Inválido',
    error: 'Selecione uma categoria válida da lista.',
  });

  // Estado de Conservação dropdown (column G, index 6)
  wsData['!dataValidation'].push({
    sqref: `G2:G${maxRows}`,
    type: 'list',
    formula1: 'Valores!$B$2:$B$6',
    showDropDown: true,
    showErrorMessage: true,
    errorTitle: 'Valor Inválido',
    error: 'Selecione um estado de conservação válido da lista.',
  });

  // Status dropdown (column H, index 7)
  wsData['!dataValidation'].push({
    sqref: `H2:H${maxRows}`,
    type: 'list',
    formula1: 'Valores!$C$2:$C$4',
    showDropDown: true,
    showErrorMessage: true,
    errorTitle: 'Valor Inválido',
    error: 'Selecione um status válido da lista.',
  });

  XLSX.utils.book_append_sheet(wb, wsData, 'Dados');

  // Hide the "Valores" sheet
  if (wb.Workbook === undefined) wb.Workbook = {};
  if (wb.Workbook.Sheets === undefined) wb.Workbook.Sheets = [];
  // Sheets order: Instruções(0), Valores(1), Dados(2)
  while (wb.Workbook.Sheets.length < 3) wb.Workbook.Sheets.push({});
  wb.Workbook.Sheets[1].Hidden = 1; // 1 = hidden

  // Set Dados as active sheet
  if (wb.Workbook.Views === undefined) wb.Workbook.Views = [];
  wb.Workbook.Views[0] = { RTL: false };

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_importacao_itens.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

function generateCsvTemplate() {
  const rows = [TEMPLATE_HEADERS.join(';')];
  // Add example row
  rows.push([
    'Monitor LG 24"', 'INFORMATICA', 'PAT-2026-001', 'SN-ABC123',
    'LG', '24MP400', 'NOVO', 'ATIVO', '15/03/2026', '899.90', 'Sala de informática'
  ].join(';'));
  
  const csvContent = '\uFEFF' + rows.join('\r\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_importacao_itens.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── File Parsing ─────────────────────────────────────────────────────────────

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const HEADER_MAP: Record<string, keyof ParsedRow> = {
  'nome': 'nome',
  'categoria': 'categoria',
  'npatrimonio': 'numeroPatrimonio',
  'nºpatrimonio': 'numeroPatrimonio',
  'numeropatrimonio': 'numeroPatrimonio',
  'patrimonio': 'numeroPatrimonio',
  'nserie': 'numeroSerie',
  'nºserie': 'numeroSerie',
  'numeroserie': 'numeroSerie',
  'serie': 'numeroSerie',
  'marca': 'marca',
  'modelo': 'modelo',
  'estadodeconservacao': 'estadoConservacao',
  'estadoconservacao': 'estadoConservacao',
  'estado': 'estadoConservacao',
  'conservacao': 'estadoConservacao',
  'status': 'status',
  'datadeaquisicao': 'dataAquisicao',
  'dataaquisicao': 'dataAquisicao',
  'data': 'dataAquisicao',
  'valordeaquisicaor': 'valorAquisicao',
  'valoraquisicaor': 'valorAquisicao',
  'valordeaquisicao': 'valorAquisicao',
  'valoraquisicao': 'valorAquisicao',
  'valorr': 'valorAquisicao',
  'valor': 'valorAquisicao',
  'observacoes': 'observacoes',
  'observacao': 'observacoes',
  'obs': 'observacoes',
};

async function parseFile(file: File): Promise<ParsedRow[]> {
  const isCSV = file.name.toLowerCase().endsWith('.csv');

  if (isCSV) {
    return parseCsv(file);
  } else {
    return parseXlsx(file);
  }
}

async function parseXlsx(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Try "Dados" sheet first, then first sheet
  const sheetName = wb.SheetNames.includes('Dados') 
    ? 'Dados' 
    : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  return mapRowsToItems(rawData);
}

async function parseCsv(file: File): Promise<ParsedRow[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const rawData: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Support both ; and , separators
    const sep = line.includes(';') ? ';' : ',';
    rawData.push(line.split(sep).map(cell => cell.trim().replace(/^["']|["']$/g, '')));
  }

  return mapRowsToItems(rawData);
}

function mapRowsToItems(rawData: any[][]): ParsedRow[] {
  if (rawData.length < 2) return []; // Need at least header + 1 data row

  const headerRow = rawData[0];
  const columnMapping: (keyof ParsedRow | null)[] = headerRow.map((h: any) => {
    const normalized = normalizeHeader(String(h));
    return HEADER_MAP[normalized] || null;
  });

  const items: ParsedRow[] = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Skip empty rows
    const hasData = row.some((cell: any) => cell !== undefined && cell !== null && String(cell).trim() !== '');
    if (!hasData) continue;

    const item: ParsedRow = {
      nome: '',
      categoria: '',
      numeroPatrimonio: '',
      numeroSerie: '',
      marca: '',
      modelo: '',
      estadoConservacao: '',
      status: '',
      dataAquisicao: '',
      valorAquisicao: '',
      observacoes: '',
    };

    columnMapping.forEach((field, colIdx) => {
      if (field && row[colIdx] !== undefined && row[colIdx] !== null) {
        let value = row[colIdx];
        // Handle Date objects from Excel
        if (value instanceof Date) {
          const d = value.getDate().toString().padStart(2, '0');
          const m = (value.getMonth() + 1).toString().padStart(2, '0');
          const y = value.getFullYear();
          value = `${d}/${m}/${y}`;
        }
        item[field] = String(value).trim();
      }
    });

    items.push(item);
  }

  return items;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRows(rows: ParsedRow[]): RowValidation[] {
  const seenPatrimonios = new Map<string, number>();

  return rows.map((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!row.nome.trim()) {
      errors.push('Nome é obrigatório');
    }

    // Validate categoria
    if (row.categoria.trim()) {
      const normalized = VALID_CATEGORIAS[row.categoria.toUpperCase()];
      if (!normalized) {
        errors.push(`Categoria "${row.categoria}" inválida`);
      }
    }

    // Validate estado
    if (row.estadoConservacao.trim()) {
      const normalized = VALID_ESTADOS[row.estadoConservacao.toUpperCase()];
      if (!normalized) {
        errors.push(`Estado "${row.estadoConservacao}" inválido`);
      }
    }

    // Validate status
    if (row.status.trim()) {
      const normalized = VALID_STATUS[row.status.toUpperCase()];
      if (!normalized) {
        errors.push(`Status "${row.status}" inválido`);
      }
    }

    // Check patrimônio duplicates within batch
    if (row.numeroPatrimonio.trim()) {
      const pat = row.numeroPatrimonio.trim();
      if (seenPatrimonios.has(pat)) {
        errors.push(`Nº patrimônio "${pat}" duplicado (mesma planilha, linha ${seenPatrimonios.get(pat)! + 1})`);
      } else {
        seenPatrimonios.set(pat, index);
      }
    }

    // Validate date format
    if (row.dataAquisicao.trim()) {
      const dateStr = row.dataAquisicao.trim();
      const brMatch = dateStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
      const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!brMatch && !isoMatch) {
        errors.push('Data de aquisição em formato inválido (use DD/MM/AAAA)');
      }
    }

    // Validate valor
    if (row.valorAquisicao.trim()) {
      const val = parseFloat(row.valorAquisicao.replace(',', '.').replace(/[^\d.]/g, ''));
      if (isNaN(val)) {
        errors.push('Valor de aquisição inválido');
      }
    }

    // Warnings for missing optional fields
    if (!row.categoria.trim()) warnings.push('Categoria não informada (será "OUTRO")');
    if (!row.estadoConservacao.trim()) warnings.push('Estado não informado (será "BOM")');
    if (!row.status.trim()) warnings.push('Status não informado (será "ATIVO")');

    return {
      row,
      index,
      errors,
      warnings,
      isValid: errors.length === 0,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LoteView: React.FC<LoteViewProps> = ({
  assets,
  setView,
  onGenerateBatch,
  instituicaoId: propInstituicaoId,
  userRole = 'ESCOLA',
  instituicaoNome,
}) => {
  // ── Tab State ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('sequencia');

  // ── Sequence Tab State (original) ──
  const [prefix, setPrefix] = useState('PAT-2026-');
  const [quantity, setQuantity] = useState(6);
  const [startSequence, setStartSequence] = useState(1);
  const [assetName, setAssetName] = useState('');
  const [assetMarca, setAssetMarca] = useState('');
  const [assetModelo, setAssetModelo] = useState('');
  const [assetCategory, setAssetCategory] = useState<CategoriaItem>('INFORMATICA');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetStatus, setAssetStatus] = useState<StatusItem>('ATIVO');

  // ── Import Tab State ──
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [validations, setValidations] = useState<RowValidation[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { index: number; message: string }[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Shared State ──
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

  // ── Sequence Tab Logic ──
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

  // ── Import Tab Logic ──
  const handleFileSelect = useCallback(async (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      triggerToast('Formato inválido. Use .xlsx, .xls ou .csv');
      return;
    }

    setImportFile(file);
    setIsParsing(true);
    setImportResult(null);

    try {
      const rows = await parseFile(file);
      setParsedRows(rows);
      setValidations(validateRows(rows));
    } catch (err) {
      console.error('Error parsing file:', err);
      triggerToast('Erro ao ler o arquivo. Verifique o formato.');
      setParsedRows([]);
      setValidations([]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const clearImport = useCallback(() => {
    setParsedRows([]);
    setValidations([]);
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const validCount = useMemo(() => validations.filter(v => v.isValid).length, [validations]);
  const errorCount = useMemo(() => validations.filter(v => !v.isValid).length, [validations]);

  const handleImportConfirm = useCallback(async () => {
    const resolvedInstituicaoId = isMestre ? instituicaoId : (propInstituicaoId || '');

    if (!resolvedInstituicaoId) {
      triggerToast('Selecione uma instituição antes de importar');
      return;
    }

    const validItems = validations
      .filter(v => v.isValid)
      .map(v => ({
        nome: v.row.nome,
        categoria: v.row.categoria.trim() ? VALID_CATEGORIAS[v.row.categoria.toUpperCase()] || 'OUTRO' : 'OUTRO',
        numeroPatrimonio: v.row.numeroPatrimonio || null,
        numeroSerie: v.row.numeroSerie || null,
        marca: v.row.marca || null,
        modelo: v.row.modelo || null,
        estadoConservacao: v.row.estadoConservacao.trim() ? VALID_ESTADOS[v.row.estadoConservacao.toUpperCase()] || 'BOM' : 'BOM',
        status: v.row.status.trim() ? VALID_STATUS[v.row.status.toUpperCase()] || 'ATIVO' : 'ATIVO',
        dataAquisicao: v.row.dataAquisicao || null,
        valorAquisicao: v.row.valorAquisicao ? parseFloat(v.row.valorAquisicao.replace(',', '.').replace(/[^\d.]/g, '')) : null,
        observacoes: v.row.observacoes || null,
      }));

    if (validItems.length === 0) {
      triggerToast('Nenhum item válido para importar');
      return;
    }

    setIsImporting(true);
    try {
      const result = await api.items.createBatch(validItems, resolvedInstituicaoId);
      setImportResult(result);
      if (result.created > 0) {
        triggerToast(`${result.created} iten${result.created === 1 ? '' : 's'} importado${result.created === 1 ? '' : 's'} com sucesso!`);
      }
    } catch (err) {
      console.error('Error importing batch:', err);
      triggerToast('Erro ao importar itens. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  }, [validations, instituicaoId, propInstituicaoId, isMestre]);

  // ── Render ──
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

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setView('inventario')} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Geração de Ativos em Lote</h2>
          <p className="text-sm text-slate-400">Crie sequências de patrimônios ou importe dados de uma planilha.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('sequencia')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'sequencia'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          Geração por Sequência
        </button>
        <button
          onClick={() => setActiveTab('importar')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'importar'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Importar Planilha
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Sequence Tab (Original) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sequencia' && (
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Import Tab */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'importar' && (
        <div className="space-y-4">
          {/* School Selector for MESTRE (same as sequence tab) */}
          {isMestre && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-bold text-slate-800">Unidade Escolar de Destino</h3>
                </div>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input type="text" readOnly value={selectedSchoolName}
                    onFocus={() => setShowSchoolDropdown(true)}
                    placeholder="Selecione a escola de destino..."
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
            </Card>
          )}

          {/* Step 1: Download Template */}
          <Card className="p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-black">1</div>
              <h3 className="text-sm font-bold text-slate-800">Baixar Template</h3>
              <span className="text-xs text-slate-400 ml-auto">Preencha o template com os dados dos itens</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={generateXlsxTemplate}
                className="group flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-ice/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Template Excel (.xlsx)</p>
                  <p className="text-xs text-slate-400 mt-0.5">Com dropdowns e instruções pré-configurados</p>
                </div>
                <Download className="w-4 h-4 text-slate-400 ml-auto shrink-0 group-hover:text-brand-blue transition-colors" />
              </button>

              <button
                onClick={generateCsvTemplate}
                className="group flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-ice/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Template CSV (.csv)</p>
                  <p className="text-xs text-slate-400 mt-0.5">Formato simplificado, separador ponto-e-vírgula</p>
                </div>
                <Download className="w-4 h-4 text-slate-400 ml-auto shrink-0 group-hover:text-brand-blue transition-colors" />
              </button>
            </div>
          </Card>

          {/* Step 2: Upload */}
          <Card className="p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                importFile ? 'bg-teal-600 text-white' : 'bg-brand-blue text-white'
              }`}>2</div>
              <h3 className="text-sm font-bold text-slate-800">Upload do Arquivo</h3>
              {importFile && (
                <button onClick={clearImport} className="ml-auto text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>

            {!importFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-brand-blue bg-brand-ice/40 scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-brand-blue' : 'text-slate-300'} transition-colors`} />
                <p className="text-sm font-bold text-slate-600">
                  Arraste o arquivo aqui ou <span className="text-brand-blue underline">clique para selecionar</span>
                </p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Formatos aceitos: .xlsx, .xls, .csv — Máximo de 500 itens por importação
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{importFile.name}</p>
                  <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                </div>
                {isParsing ? (
                  <Loader2 className="w-5 h-5 text-brand-blue animate-spin shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                )}
              </div>
            )}
          </Card>

          {/* Step 3: Preview & Confirm */}
          {parsedRows.length > 0 && !isParsing && (
            <Card className="p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-black">3</div>
                <h3 className="text-sm font-bold text-slate-800">Pré-visualização e Validação</h3>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                  <p className="text-2xl font-black text-slate-800">{parsedRows.length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total de Linhas</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200 text-center">
                  <p className="text-2xl font-black text-teal-700">{validCount}</p>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mt-0.5">Válidos</p>
                </div>
                <div className={`rounded-lg p-3 border text-center ${
                  errorCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-2xl font-black ${errorCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>{errorCount}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${errorCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Com Erros</p>
                </div>
              </div>

              {/* Import Result (shown after importing) */}
              {importResult && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  importResult.errors.length > 0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-teal-50 border-teal-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {importResult.errors.length > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {importResult.created} iten{importResult.created === 1 ? '' : 's'} importado{importResult.created === 1 ? '' : 's'} com sucesso
                        {importResult.errors.length > 0 && `, ${importResult.errors.length} erro${importResult.errors.length === 1 ? '' : 's'}`}
                      </p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {importResult.errors.slice(0, 5).map((err, idx) => (
                            <p key={idx} className="text-xs text-amber-700">
                              Linha {err.index + 1}: {err.message}
                            </p>
                          ))}
                          {importResult.errors.length > 5 && (
                            <p className="text-xs text-amber-600 font-bold">
                              ...e mais {importResult.errors.length - 5} erro(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3 w-10">Status</th>
                      <th className="py-2.5 px-3">Nome</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Patrimônio</th>
                      <th className="py-2.5 px-3">Marca</th>
                      <th className="py-2.5 px-3">Modelo</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Data Aquisição</th>
                      <th className="py-2.5 px-3">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {validations.map((v) => (
                      <tr key={v.index} className={`transition-colors ${
                        !v.isValid ? 'bg-rose-50/50' : v.warnings.length > 0 ? 'bg-amber-50/30' : 'hover:bg-slate-50/70'
                      }`}>
                        <td className="py-2 px-3 text-slate-400 font-mono">{v.index + 1}</td>
                        <td className="py-2 px-3">
                          {!v.isValid ? (
                            <div className="group relative">
                              <XCircle className="w-4 h-4 text-rose-500" />
                              <div className="absolute z-50 left-6 top-0 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1.5 max-w-xs shadow-lg whitespace-pre-line">
                                {v.errors.join('\n')}
                              </div>
                            </div>
                          ) : v.warnings.length > 0 ? (
                            <div className="group relative">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <div className="absolute z-50 left-6 top-0 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1.5 max-w-xs shadow-lg whitespace-pre-line">
                                {v.warnings.join('\n')}
                              </div>
                            </div>
                          ) : (
                            <CheckCircle className="w-4 h-4 text-teal-500" />
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 max-w-[180px] truncate">{v.row.nome || <span className="text-rose-400 italic">vazio</span>}</td>
                        <td className="py-2 px-3">{v.row.categoria ? (CATEGORIA_LABELS[VALID_CATEGORIAS[v.row.categoria.toUpperCase()] || ''] || v.row.categoria) : <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3 font-mono">{v.row.numeroPatrimonio || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.marca || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.modelo || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.estadoConservacao ? (ESTADO_LABELS[VALID_ESTADOS[v.row.estadoConservacao.toUpperCase()] || ''] || v.row.estadoConservacao) : <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.status ? (STATUS_LABELS[VALID_STATUS[v.row.status.toUpperCase()] || ''] || v.row.status) : <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.dataAquisicao || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2 px-3">{v.row.valorAquisicao || <span className="text-slate-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Errors/Warnings Legend */}
              <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-teal-500" /> Válido</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Aviso (campo opcional vazio)</span>
                <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-500" /> Erro (não será importado)</span>
              </div>

              {/* Info Banner */}
              {errorCount > 0 && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Apenas os <span className="font-bold">{validCount} itens válidos</span> serão importados. 
                    Corrija os erros na planilha e faça um novo upload para importar os itens restantes.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                <Button
                  variant="secondary"
                  onClick={handleImportConfirm}
                  disabled={validCount === 0 || isImporting || importResult !== null}
                  className="bg-brand-blue hover:bg-brand-teal text-xs py-2.5 px-5"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Importando...
                    </>
                  ) : importResult ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Importação Concluída
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1.5" />
                      Importar {validCount} {validCount === 1 ? 'Item' : 'Itens'}
                    </>
                  )}
                </Button>

                {importResult && (
                  <Button variant="outline" onClick={() => { clearImport(); }} className="text-xs py-2.5 px-5">
                    Nova Importação
                  </Button>
                )}

                <Button variant="outline" onClick={clearImport} className="text-xs py-2.5 px-5 ml-auto">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Descartar
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};