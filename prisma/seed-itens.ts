import 'dotenv/config'
import prisma from '../src/lib/prisma'
import { CategoriaItem, EstadoConservacao, StatusItem } from '../src/generated/client'

// ---------------------------------------------------------------------------
// Blueprints dos setores e itens padrão que toda escola deve ter
// ---------------------------------------------------------------------------
const blueprintSetores = [
  {
    nome: 'Secretaria',
    itens: [
      { nome: 'Computador Desktop', categoria: CategoriaItem.INFORMATICA, marca: 'Dell', modelo: 'Optiplex 3080', quantidade: 2 },
      { nome: 'Impressora Multifuncional', categoria: CategoriaItem.INFORMATICA, marca: 'Epson', modelo: 'EcoTank L4260' },
      { nome: 'Mesa de Escritório', categoria: CategoriaItem.MOBILIARIO, quantidade: 3 },
      { nome: 'Cadeira Giratória', categoria: CategoriaItem.MOBILIARIO, quantidade: 3 },
      { nome: 'Ar Condicionado 12000 BTUs', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'LG', modelo: 'Dual Inverter' },
    ]
  },
  {
    nome: 'Sala de Informática',
    itens: [
      { nome: 'Lousa Digital', categoria: CategoriaItem.INFORMATICA, marca: 'SmartBoard' },
      { nome: 'Roteador Wi-Fi', categoria: CategoriaItem.CONECTIVIDADE, marca: 'Cisco', modelo: 'Meraki' },
      { nome: 'Notebook Educacional', categoria: CategoriaItem.INFORMATICA, marca: 'Lenovo', modelo: 'ThinkPad', quantidade: 15 },
      { nome: 'Switch 24 Portas', categoria: CategoriaItem.CONECTIVIDADE, marca: 'Intelbras' },
    ]
  },
  {
    nome: 'Cozinha',
    itens: [
      { nome: 'Geladeira Duplex', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Brastemp', modelo: 'Frost Free' },
      { nome: 'Fogão Industrial 4 Bocas', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Metalmaq' },
      { nome: 'Freezer Horizontal', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Consul' },
      { nome: 'Liquidificador Industrial', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Skymsen' },
    ]
  },
  {
    nome: 'Pátio',
    itens: [
      { nome: 'Bebedouro Industrial', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Libell', quantidade: 2 },
      { nome: 'Extintor de Incêndio (Pó Químico)', categoria: CategoriaItem.PREDIAL, quantidade: 3 },
      { nome: 'Câmera de Segurança (CFTV)', categoria: CategoriaItem.PREDIAL, marca: 'Intelbras', quantidade: 4 },
    ]
  },
  {
    nome: 'Salas de Aula',
    itens: [
      { nome: 'Conjunto Carteira e Cadeira', categoria: CategoriaItem.MOBILIARIO, quantidade: 35 },
      { nome: 'Mesa do Professor', categoria: CategoriaItem.MOBILIARIO, quantidade: 2 },
      { nome: 'Lousa Branca', categoria: CategoriaItem.MOBILIARIO, quantidade: 2 },
      { nome: 'Ventilador de Parede', categoria: CategoriaItem.ELETRODOMESTICO, marca: 'Ventisol', quantidade: 4 },
      { nome: 'Projetor Multimídia', categoria: CategoriaItem.INFORMATICA, marca: 'Epson', modelo: 'PowerLite' },
    ]
  }
]

// ---------------------------------------------------------------------------
// Funções auxiliares de geração
// ---------------------------------------------------------------------------

function getEstadoEStatus(): { estado: EstadoConservacao, status: StatusItem } {
    // 60% BOM, 20% REGULAR, 10% NOVO, 5% RUIM, 5% INSERVIVEL
    const r = Math.random();
    if (r < 0.1) return { estado: EstadoConservacao.NOVO, status: StatusItem.ATIVO };
    if (r < 0.7) return { estado: EstadoConservacao.BOM, status: StatusItem.ATIVO };
    if (r < 0.9) return { estado: EstadoConservacao.REGULAR, status: StatusItem.ATIVO };
    if (r < 0.95) return { estado: EstadoConservacao.RUIM, status: StatusItem.EM_MANUTENCAO };
    return { estado: EstadoConservacao.INSERVIVEL, status: StatusItem.BAIXADO };
}

// Para garantir unicidade do patrimônio
let patrimoniosGerados = new Set<string>();
function gerarPatrimonio(): string {
    let pat = '';
    do {
        // Ex: PAT-592843
        pat = 'PAT-' + Math.floor(100000 + Math.random() * 900000).toString();
    } while (patrimoniosGerados.has(pat));
    patrimoniosGerados.add(pat);
    return pat;
}

// ---------------------------------------------------------------------------
// Seed Principal
// ---------------------------------------------------------------------------
async function main() {
    console.log('Iniciando seed de setores e itens para as instituições...');

    // Busca todas as escolas já cadastradas pelo seed.ts original
    const instituicoes = await prisma.instituicao.findMany();

    if (instituicoes.length === 0) {
        console.log('❌ Nenhuma instituição encontrada no banco. Rode o "npm run db:seed" primeiro.');
        return;
    }

    // Carrega patrimônios já existentes no banco para não colidir
    const itensExistentes = await prisma.item.findMany({ select: { numeroPatrimonio: true } });
    for (const it of itensExistentes) {
        if (it.numeroPatrimonio) patrimoniosGerados.add(it.numeroPatrimonio);
    }

    let itensCriados = 0;
    let setoresCriados = 0;

    for (const inst of instituicoes) {
        process.stdout.write(`Escola: ${inst.nome.substring(0, 30)}... `);

        for (const bp of blueprintSetores) {
            // 1. Garante que o setor existe
            let setor = await prisma.setor.findFirst({
                where: { nome: bp.nome, instituicaoId: inst.id }
            });

            if (!setor) {
                setor = await prisma.setor.create({
                    data: {
                        nome: bp.nome,
                        instituicaoId: inst.id,
                        descricao: `Setor padrão: ${bp.nome}`
                    }
                });
                setoresCriados++;
            }

            // 2. Prepara os itens a serem criados em lote para este setor
            const novosItens = [];
            for (const itemBp of bp.itens) {
                const qtd = itemBp.quantidade || 1;
                
                for (let i = 0; i < qtd; i++) {
                    const condicao = getEstadoEStatus();
                    
                    // Gera data de aquisição aleatória (entre 2018 e hoje)
                    const dataAquisicao = new Date(
                        2018 + Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 12),
                        Math.floor(Math.random() * 28) + 1
                    );

                    // Valor simbólico aproximado (ex: R$ 500,00 a R$ 3500,00)
                    const valorAquisicao = 100 + Math.floor(Math.random() * 4000);

                    novosItens.push({
                        nome: itemBp.nome,
                        categoria: itemBp.categoria,
                        numeroPatrimonio: gerarPatrimonio(),
                        marca: itemBp.marca || null,
                        modelo: itemBp.modelo || null,
                        estadoConservacao: condicao.estado,
                        status: condicao.status,
                        dataAquisicao: dataAquisicao,
                        valorAquisicao: valorAquisicao,
                        setorId: setor.id,
                    });
                    itensCriados++;
                }
            }

            // 3. Insere os itens no banco
            await prisma.item.createMany({
                data: novosItens,
                skipDuplicates: true // Garante que não falha se algo duplicar
            });
        }
        console.log('✅ OK');
    }

    console.log(`\n🎉 Seed de Inventário concluído com sucesso!`);
    console.log(`- Setores novos: ${setoresCriados}`);
    console.log(`- Itens criados: ${itensCriados}`);
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed de itens:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
