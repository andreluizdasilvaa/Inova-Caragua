import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
    console.log('Buscando itens com [SEED MAPA] no nome...');
    
    const count = await prisma.item.count({
        where: {
            nome: {
                contains: '[SEED MAPA]',
                mode: 'insensitive' // Ignora maiúsculas/minúsculas
            }
        }
    });

    if (count > 0) {
        console.log(`Encontrados ${count} itens. Apagando...`);
        const result = await prisma.item.deleteMany({
            where: {
                nome: {
                    contains: '[SEED MAPA]',
                    mode: 'insensitive'
                }
            }
        });
        console.log(`Deletados ${result.count} itens.`);
    } else {
        console.log('Nenhum item com [SEED MAPA] encontrado no banco de dados.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
