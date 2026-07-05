import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Criando ocorrências para itens em manutenção...');
    
    // Find a user to act as the creator of these tickets
    const user = await prisma.usuario.findFirst({
        where: { ativo: true },
        select: { id: true }
    });

    if (!user) {
        console.error('Nenhum usuário ativo encontrado no banco para criar os chamados.');
        return;
    }

    // Find all items that are in maintenance
    const itemsEmManutencao = await prisma.item.findMany({
        where: {
            status: 'EM_MANUTENCAO'
        },
        include: {
            setor: true
        }
    });

    console.log(`Encontrados ${itemsEmManutencao.length} itens em manutenção.`);

    let criados = 0;

    for (const item of itemsEmManutencao) {
        // Find institution ID from item directly or via its sector
        const instId = item.instituicaoId || item.setor?.instituicaoId;

        if (!instId) {
            console.log(`Item ${item.id} não possui instituição vinculada. Pulando...`);
            continue;
        }

        // Create the occurrence
        await prisma.ocorrencia.create({
            data: {
                titulo: `Manutenção - ${item.nome}`,
                descricao: `Chamado gerado automaticamente para o item que está em manutenção. Patrimônio: ${item.numeroPatrimonio || 'N/A'} - Categoria: ${item.categoria}`,
                tipoSolicitacao: 'REPARO',
                status: 'ABERTA',
                instituicaoId: instId,
                setorId: item.setorId,
                itemId: item.id,
                criadoPorId: user.id,
                prioridade: 'MEDIA'
            }
        });
        
        criados++;
    }

    console.log(`Concluído! ${criados} chamados criados com sucesso.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
