/**
 * Seed de Instituições - Caraguatatuba
 *
 * Fonte: "Lista escolas.xlsx"
 * Colunas usadas: NOME OFICIAL, BAIRRO, ENDEREÇO, EMAIL, TELEFONE, LATITUDE, LONGITUDE
 *
 * Mapeamento de TipoInstituicao (enum do schema.prisma):
 *   CRECHE  → prefixo "CRECHE"
 *   EMEI    → prefixo "EMEI" puro (sem EMEF)
 *   EMEF    → prefixo "EMEF" puro (sem EMEI) e "CEFI"
 *   EMEIF   → "EMEI/EMEF" e "CIEFI" (combinados / inclusão)
 *   OUTRO   → demais (CEI, CRIES, BIBLIOTECA, etc.)
 *
 * ⚠️  ATENÇÃO — o que você pode precisar ajustar:
 *   1. Se o enum TipoInstituicao mudar no schema.prisma, revise a função mapTipo() abaixo.
 *   2. As coordenadas do Excel estão em graus decimais × 1.000.000 (inteiros).
 *      O seed já divide por 1e6 para converter para Float. Se o formato mudar, ajuste toCoord().
 *   3. O upsert usa o campo "nome" como identificador. Se houver código INEP disponível,
 *      troque o where: { nome } por where: { codigoInep } para maior robustez.
 */

import 'dotenv/config' // carrega o .env antes de qualquer outro import
import { TipoInstituicao } from '../src/generated/client'
import prisma from '../src/lib/prisma'

// ---------------------------------------------------------------------------
// Dados extraídos da planilha "Lista escolas.xlsx"
// ---------------------------------------------------------------------------
const escolas: {
    nome: string
    bairro: string | null
    endereco: string | null
    email: string | null
    telefone: string | null
    lat: number | null
    lon: number | null
}[] = [
        { nome: 'CEFI PROF ADOLFINA LEONOR SOARES DOS SANTOS', bairro: 'Sumaré', endereco: 'Av. Siqueira Campos, 1257', email: 'emefadolfinacaraguatatuba@gmail.com', telefone: '3881-2521/3882-5195', lat: -23618520, lon: -45405210 },
        { nome: 'CEI/EMEI ADI ADRIANA APARECIDA CASSIANO', bairro: 'Perequê Mirim', endereco: 'Rua São Roque, 410', email: 'cei.adrianacassiano@gmail.com', telefone: '3887-1449', lat: -23693210, lon: -45441105 },
        { nome: 'EMEI/EMEF PROF AIDA DE ALMEIDA CASTRO GRAZIOLI', bairro: 'Rio do Ouro', endereco: 'Rua Francisco Ribeiro, 80', email: 'emefgraziolicaraguatatuba@gmail.com', telefone: '3882-2610', lat: -23612140, lon: -45431020 },
        { nome: 'EMEI/EMEF PROF ALAOR XAVIER JUNQUEIRA', bairro: 'Travessão', endereco: 'Rua José Ferreira dos Santos, 381', email: 'emefjunqueiracaraguatatuba@gmail.com', telefone: '3887-2612', lat: -23699850, lon: -45448510 },
        { nome: 'CEI/EMEI PROF ANA MARIA AULICINO', bairro: 'Jd. Califórnia', endereco: 'Rua Manoel Amaral, 51', email: 'ceicalifornia2023@gmail.com', telefone: '3883-1617', lat: -23625410, lon: -45420130 },
        { nome: 'EMEF PROF ANTONIA ANTUNES AROUCA', bairro: 'Massaguaçu', endereco: 'Rua Itália Baffi Magni, 583', email: 'emefaroucacaraguatatuba@gmail.com', telefone: '3884-3900', lat: -23568910, lon: -45312040 },
        { nome: 'CIEFI PROF ANTONIA RIBEIRO DA SILVA', bairro: 'Sumaré', endereco: 'Av. Siqueira Campos, 1257', email: 'ciasesumare@gmail.com', telefone: '3881-3712', lat: -23618520, lon: -45405210 },
        { nome: 'EMEF PROF ANTONIO DE FREITAS AVELAR', bairro: 'Jd. Califórnia', endereco: 'Rua Manoel Amaral, 400', email: 'emefavelarcaraguatatuba@gmail.com', telefone: '3882-5697', lat: -23625000, lon: -45420000 },
        { nome: 'CEI/EMEI PROF APARECIDA MARIA PIRES DE MENESES', bairro: 'Jd. Califórnia', endereco: 'Rua Francisco de Pádua, s/n', email: 'ceimenezes2019@gmail.com', telefone: '3883-1618', lat: -23624900, lon: -45419900 },
        { nome: 'EMEF PROF. AURACY MANSANO', bairro: 'Indaiá', endereco: 'Av. Santa Catarina, 1200', email: 'emefmansanocaraguatatuba@gmail.com', telefone: '3887-7800', lat: -23634000, lon: -45420000 },
        { nome: 'EMEI/EMEF BENEDITO INACIO SOARES', bairro: 'Martim de Sá', endereco: 'Rua Analândia, 200', email: 'emefbeneditocaraguatatuba@gmail.com', telefone: '3882-5699', lat: -23615500, lon: -45395500 },
        { nome: 'EMEI/EMEF PROF. BERNARDO FERREIRA LOUZADA', bairro: 'Porto Novo', endereco: 'Av. Ezequiel da Silva Barreto, 500', email: 'emeflouzadacaraguatatuba@gmail.com', telefone: '3887-3837', lat: -23688500, lon: -45441500 },
        { nome: 'EMEI/EMEF CARLOS ALTERO ORTEGA', bairro: 'Jetuba', endereco: 'Rua Seishi Yoshimoto, 400', email: 'emefcarlosortegacaraguatatuba@gmail.com', telefone: '3884-2922', lat: -23582500, lon: -45346000 },
        { nome: 'EMEF DR. CARLOS DE ALMEIDA RODRIGUES', bairro: 'Centro', endereco: 'Rua Santos Dumont, 100', email: 'emefcarlosrodriguescaraguatatuba@gmail.com', telefone: '3882-1068', lat: -23620000, lon: -45412000 },
        { nome: 'CEI/EMEI PROF CELIA ROCHA LOBO', bairro: 'Jd. Califórnia', endereco: 'Rua Francisco de Pádua, 100', email: 'ceicelia.lobo@gmail.com', telefone: '3883-1619', lat: -23624800, lon: -45419800 },
        { nome: 'EMEF PROF DEBORA VALLE DA SILVA PILON', bairro: 'Tabatinga', endereco: 'Rua Benedito Serrado, 200', email: 'emefdeboracaraguatatuba@gmail.com', telefone: '3884-2092', lat: -23555500, lon: -45285500 },
        { nome: 'CEI PROF DIOMAR BERTI FRANZOLIN', bairro: 'Tinga', endereco: 'Av. Marechal Deodoro da Fonseca, 800', email: 'ceidiomarcaraguatatuba@gmail.com', telefone: '3886-2055', lat: -23632000, lon: -45423000 },
        { nome: 'CEI DO BAIRRO POIARES', bairro: 'Poiares', endereco: 'Rua Principal, s/n', email: 'ceipoiares@gmail.com', telefone: '3889-3536', lat: -23583000, lon: -45347500 },
        { nome: 'CEI EMEI DO SUMARE', bairro: 'Sumaré', endereco: 'Av. Siqueira Campos, 900', email: 'ceisumare@gmail.com', telefone: '3881-3714', lat: -23618100, lon: -45405000 },
        { nome: 'CEI/EMEI PROF EDITH CASTRO DE MORAIS', bairro: 'Indaiá', endereco: 'Av. Santa Catarina, 600', email: 'ceiemeiprofedit@gmail.com', telefone: '3887-7823', lat: -23634200, lon: -45421000 },
        { nome: 'CIEFI PROF EDNA MARIA NOGUEIRA FERRAZ', bairro: 'Massaguaçu', endereco: 'Rua Itália Baffi Magni, 400', email: 'ciasemassaguacu@gmail.com', telefone: '3884-3901', lat: -23568700, lon: -45312000 },
        { nome: 'CEI PROF ELISA BUTSCHKAU', bairro: 'Jd. Califórnia', endereco: 'Rua Manoel Amaral, 200', email: 'ceiprofelisa@gmail.com', telefone: '3883-1620', lat: -23625200, lon: -45420200 },
        { nome: 'CEI ESTER NUNES DE SOUZA', bairro: 'Porto Novo', endereco: 'Av. Ezequiel da Silva Barreto, 300', email: 'ceiestercaraguatatuba@gmail.com', telefone: '3887-3838', lat: -23688200, lon: -45441200 },
        { nome: 'EMEF PROF. EUCLYDES FERREIRA', bairro: 'Massaguaçu', endereco: 'Rua Itália Baffi Magni, 700', email: 'emefeuclydescara@gmail.com', telefone: '3884-3902', lat: -23568600, lon: -45311800 },
        { nome: 'CEI/EMEI PROF. FRANCISCO ASSIS DE CARVALHO', bairro: 'Sumaré', endereco: 'Av. Siqueira Campos, 1100', email: 'ceiemeifcoassis@gmail.com', telefone: '3881-2522', lat: -23618300, lon: -45405100 },
        { nome: 'EMEF PROF GERALDO DE LIMA', bairro: 'Jaraguazinho', endereco: 'Rua José Neder, 200', email: 'emefgeraldolima@gmail.com', telefone: '3887-8088', lat: -23628700, lon: -45424700 },
        { nome: 'CRECHE GOLFINHO AMIGO', bairro: 'Golfinhos', endereco: 'Av. Emílio Manzano Lhorente, 500', email: 'crecheamigo@gmail.com', telefone: '3881-3714', lat: -23666200, lon: -45430700 },
        { nome: 'CIEFI GOVERNADOR ADHEMAR PEREIRA DE BARROS', bairro: 'Tinga', endereco: 'Rua Antonio dos Santos, 200', email: 'ciasesadhemar@gmail.com', telefone: '3882-6091', lat: -23631200, lon: -45422600 },
        { nome: 'CEI PROF HONORINA PACHECO CORREA', bairro: 'Ipiranga', endereco: 'Av. Brasil, 1200', email: 'ceihonorinaipiranga@gmail.com', telefone: '3883-9789', lat: -23602700, lon: -45390700 },
        { nome: 'EMEF PROF JANE URBANO FOCESI', bairro: 'Jd. Gaivotas', endereco: 'Rua Pica-Pau, 300', email: 'emefjanecaraguatatuba@gmail.com', telefone: '3887-7463', lat: -23645200, lon: -45428200 },
        { nome: 'EMEI/EMEF PROF. JOAO BAPTISTA GARDELIN', bairro: 'Tabatinga', endereco: 'Rua Benedito Serrado, 400', email: 'emefgardelincaraguatatuba@gmail.com', telefone: '3884-2093', lat: -23555200, lon: -45284800 },
        { nome: 'EMEI/EMEF PROF JOAO BENEDITO MARCONDES', bairro: 'Praia das Palmeiras', endereco: 'Rua Aldo Marcucci, 100', email: 'emefmarcondescaraguatatuba@gmail.com', telefone: '3888-4187', lat: -23655200, lon: -45429200 },
        { nome: 'CEI/EMEI JOAO LINO DA CRUZ', bairro: 'Morro do Algodão', endereco: 'Travessa Cinco, 50', email: 'ceijoaolino@gmail.com', telefone: '3888-3224', lat: -23672000, lon: -45433000 },
        { nome: 'EMEI/EMEF JOAO THIMOTEO DO ROSARIO', bairro: 'Jaraguazinho', endereco: 'Rua José Neder, 50', email: 'emefjoaothimoteocaraguatatuba@gmail.com', telefone: '3887-8089', lat: -23628300, lon: -45424300 },
        { nome: 'EMEF PROF JORGE PASSOS', bairro: 'Estrela D Alva', endereco: 'Rua Antonio Nardi, 400', email: 'emefjorgepassos@gmail.com', telefone: '3883-3478', lat: -23611200, lon: -45425700 },
        { nome: 'CEI/EMEI PROF JOSIANE APARECIDA RAMOS', bairro: 'Golfinhos', endereco: 'Av. Emílio Manzano Lhorente, 670', email: 'ceigolfinho@educacaocaraguatatuba.com.br', telefone: '3881-3713', lat: -23666000, lon: -45430500 },
        { nome: 'CEI/EMEI LEONOR MENDES DE BARROS', bairro: 'Travessão', endereco: 'Rua Joao Carlos Balio, 240', email: 'ceileonor.travessao@gmail.com', telefone: '3887-6108/3888-2845', lat: -23699000, lon: -45447500 },
        { nome: 'EMEI/EMEF PROF. LUCIO JACINTO DOS SANTOS', bairro: 'Tinga', endereco: 'Rua Denilza Sebastiana dos Santos, 75', email: 'emefjacintocaraguatatuba@gmail.com', telefone: '3881-1313/3883-4533', lat: -23631000, lon: -45422500 },
        { nome: 'EMEF PROF LUIZ RIBEIRO MUNIZ', bairro: 'Martim de Sá', endereco: 'Rua Analândia, 355', email: 'emefmunizcaraguatatuba@gmail.com', telefone: '3882-5698', lat: -23615000, lon: -45395000 },
        { nome: 'EMEF PROF. LUIZ SILVAR DO PRADO', bairro: 'Casa Branca', endereco: 'Rua José Pedro de Oliveira Barbosa, 805', email: 'emef.luizsilvar@caraguatatuba.sp.gov.br', telefone: '3886-9931/3883-8341', lat: -23608000, lon: -45388000 },
        { nome: 'CEI/EMEI PROF MAIRA MARQUES DE OLIVEIRA', bairro: 'Massaguaçu', endereco: 'Rua José Geronimo Soares, s/n.', email: 'ceimassagua25@gmail.com', telefone: '3884-5672', lat: -23568200, lon: -45312500 },
        { nome: 'EMEF PROF MARIA APARECIDA DE CARVALHO', bairro: 'Tinga', endereco: 'Av. Marechal Deodoro da Fonseca, 1155', email: 'emefmariacarvalhocaraguatatuba@gmail.com', telefone: '3886-2050', lat: -23632500, lon: -45423500 },
        { nome: 'EMEF PROF MARIA APARECIDA UJIO', bairro: 'Porto Novo', endereco: 'Av. Ezequiel da Silva Barreto, 285', email: 'maria.ujio@educacaocaraguatatuba.com.br', telefone: '3887-3836/3887-6320', lat: -23688000, lon: -45441000 },
        { nome: 'CIEFI PROF MARIA CARLITA SARAIVA GUEDES', bairro: 'Morro do Algodão', endereco: 'Travessa Cinco, 75', email: 'cei.mariacarlita@gmail.com', telefone: '3888-3223', lat: -23671800, lon: -45432800 },
        { nome: 'EMEI MARIA DE LOURDES LUCARELLI PEREZ', bairro: 'Indaiá', endereco: 'Av. Santa Catarina, 455', email: 'emeiperezcaraguatatuba@gmail.com', telefone: '3887-7822', lat: -23634500, lon: -45420800 },
        { nome: 'CEI/EMEI PROF MARIA ELMA MANSANO', bairro: 'Tinga', endereco: 'Av. Marechal Deodoro da Fonseca, 1155', email: 'ceimansano@gmail.com', telefone: '3886-2054/3886-2076', lat: -23632500, lon: -45423500 },
        { nome: 'CEI/EMEI PROF MARIA EUGENIA ARANHA CHODOUNSKY', bairro: 'Casa Branca', endereco: 'Rua José Pedro de Oliveira Barbosa, s/n', email: 'ceiemeimariaeugenia@gmail.com', telefone: '3886-9932', lat: -23608200, lon: -45388200 },
        { nome: 'EMEF PROF MARIA MORAES DE OLIVEIRA', bairro: 'Jd. Gaivotas', endereco: 'Rua Pica-Pau, 495', email: 'emefgaivotascaraguatatuba@gmail.com', telefone: '3887-7462', lat: -23645000, lon: -45428000 },
        { nome: 'CEI/EMEI PROF MARIA ONICIE DIAS PEREIRA', bairro: 'Jaraguazinho', endereco: 'Rua José Neder, 100', email: 'ceimariaonicie@gmail.com', telefone: '3887-8087', lat: -23628500, lon: -45424500 },
        { nome: 'EMEI/EMEF PROF MARIA THEREZA DE SOUZA CASTRO', bairro: 'Jetuba', endereco: 'Rua Seishi Yoshimoto, 120', email: 'emefcastrocaraguatatuba@gmail.com', telefone: '3884-2921', lat: -23582000, lon: -45345500 },
        { nome: 'EMEI/EMEF MASAKO SONE', bairro: 'Pegorelli', endereco: 'Trav. Caminho Grande, 50', email: 'emefsonecaraguatatuba@gmail.com', telefone: '3887-2444', lat: -23708000, lon: -45452000 },
        { nome: 'CRECHE MEI MEI DE CARAGUATATUBA', bairro: 'Morro do Algodão', endereco: 'Rua Antonio Teles de Souza, 64', email: 'memeimorrodoalgodao@gmail.com', telefone: '12 99202-5047', lat: -23671500, lon: -45432500 },
        { nome: 'CEI/EMEI MESSIAS MENDES DE SOUZA', bairro: 'Ipiranga', endereco: 'Av. Brasil, 1350', email: 'ceiemeimessiasipiranga@gmail.com', telefone: '3883-9788', lat: -23602500, lon: -45390500 },
        { nome: 'EMEF PROF. OSWALDO FERREIRA', bairro: 'Casa Branca', endereco: 'Rua José Pedro de Oliveira Barbosa, 190', email: 'emefferreiracaraguatatuba@gmail.com', telefone: '3882-1067', lat: -23607500, lon: -45387500 },
        { nome: 'EMEI/EMEF PEDRO JOAO DE OLIVEIRA', bairro: 'Tabatinga', endereco: 'Rua Benedito Serrado, 130', email: 'emefoliveiracaraguatatuba@gmail.com', telefone: '3884-2091', lat: -23555000, lon: -45285000 },
        { nome: 'CEI/EMEI PROF REGINA CELIA SANTOS CHAPIRA BLAUSTEIN', bairro: 'Travessão', endereco: 'Rua Jacupiranga, 155', email: 'ceiregina.travessao@gmail.com', telefone: '3887-6422', lat: -23699500, lon: -45447800 },
        { nome: 'EMEF EJA PROF RICARDO LUQUES SAMMARCO SERRA', bairro: 'Praia das Palmeiras', endereco: 'Rua Aldo Marcucci, 300', email: 'emefserracaraguatatuba@gmail.com', telefone: '3888-4186', lat: -23655000, lon: -45429000 },
        { nome: 'CEI/EMEI PROF SANTINA NARDI MARQUES', bairro: 'Estrela D Alva', endereco: 'Rua Antonio Nardi, 200', email: 'ceisantinanardicaraguatatuba@gmail.com', telefone: '3883-3477', lat: -23611000, lon: -45425500 },
        { nome: 'CEI/EMEI SEVERINO VITORIANO DOS SANTOS', bairro: 'Jd. Gaivotas', endereco: 'Av. Cardeal, 574', email: 'ceiemeiseverino@gmail.com', telefone: '3887-3047', lat: -23645500, lon: -45428500 },
        { nome: 'CEI/EMEI STELA DA SILVA', bairro: 'Travessão', endereco: 'Rua Joao Carlos Balio, 355', email: 'cei.stelasilva@caraguatatuba.sp.gov.br', telefone: '3887-1030', lat: -23699200, lon: -45447700 },
        { nome: 'CEI PROF TELMA DO AMARANTE VEIGA SANTOS', bairro: 'Tinga', endereco: 'Rua Antonio dos Santos, 70', email: 'cei.telmaveiga@caraguatatuba.sp.gov.br', telefone: '3882-6090', lat: -23631500, lon: -45422800 },
        { nome: 'CEI/EMEI PROF THEREZA YANESSE SCHMIDT CARDOZO', bairro: 'Porto Novo', endereco: 'Av. Ezequiel da Silva Barreto, 200', email: 'ceiportonovo.caragua@gmail.com', telefone: '3887-1565', lat: -23687800, lon: -45440800 },
        { nome: 'CEI/EMEI PROF VERA DA SILVA SANTOS', bairro: 'Jetuba', endereco: 'Av. Azaleias, 418', email: 'cemeifazendinha@gmail.com', telefone: '3889-3535', lat: -23583500, lon: -45347000 },
        { nome: 'CEI EMEI INSPETORA WALDETE FERREIRA DE SOUZA', bairro: 'Pegorelli', endereco: 'Rua Circular, 10', email: 'cei.waldetesouza@educacaocaraguatatuba.com.br', telefone: '3887-1036/3887-1047', lat: -23708500, lon: -45452500 },
        { nome: 'CIEFI WILSON FRANCISCO VALENTE - SUMARE', bairro: 'Sumaré', endereco: 'Av. Siqueira Campos, 705', email: 'ciasesumare@gmail.com', telefone: '3881-3716', lat: -23618000, lon: -45404800 },
        { nome: 'EMEI/EMEF PROF. YASUTADA NASU', bairro: 'Perequê Mirim', endereco: 'Av. Pedro Gonçalves, 685', email: 'emeiyasutadacaraguatatuba@gmail.com', telefone: '3887-6039', lat: -23695100, lon: -45443000 },
        // Unidades sem endereço completo na planilha (campos null aceitos pelo schema)
        { nome: 'CRIES CASA BRANCA', bairro: null, endereco: null, email: null, telefone: null, lat: -23608000, lon: -45388000 },
        { nome: 'CRIES TINGA', bairro: null, endereco: null, email: null, telefone: null, lat: -23631000, lon: -45422500 },
        { nome: 'CRIES PEREQUE MIRIM', bairro: null, endereco: null, email: null, telefone: null, lat: -23693200, lon: -45441100 },
        { nome: 'BIBLIOTECA AFONSO SCHIMDT', bairro: 'Centro', endereco: 'R. Santa Cruz, 396', email: 'biblioteca.municipal@caraguatatuba.sp.gov.br', telefone: '3882-1216', lat: -23622000, lon: -45412000 },
        { nome: 'BIBLIOTECA CECILIA MEIRELES', bairro: 'Travessão', endereco: 'Rua Joao Carlos Balio, 240', email: 'biblioteca.municipal@caraguatatuba.sp.gov.br', telefone: '3882-1217', lat: -23699000, lon: -45447500 },
    ]

// ---------------------------------------------------------------------------
// ⚠️  Mapeamento de tipo
// Se o enum TipoInstituicao for modificado no schema.prisma, atualize esta função.
// ---------------------------------------------------------------------------
function mapTipo(nome: string): TipoInstituicao {
    const n = nome.toUpperCase()
    if (n.startsWith('CRECHE')) return TipoInstituicao.CRECHE
    if (/^EMEI(?!\/)/.test(n)) return TipoInstituicao.EMEI
    if (/^EMEF/.test(n) || n.startsWith('CEFI')) return TipoInstituicao.EMEF
    if (n.startsWith('EMEI/EMEF') || n.startsWith('CIEFI')) return TipoInstituicao.EMEIF
    return TipoInstituicao.OUTRO
}

// ---------------------------------------------------------------------------
// ⚠️  Conversão de coordenadas
// O Excel armazena graus decimais × 1.000.000 como inteiros (ex: -23618520).
// Se a planilha já estiver em Float, remova a divisão por 1_000_000.
// ---------------------------------------------------------------------------
function toCoord(raw: number | null): number | null {
    if (raw === null) return null
    return raw / 1_000_000
}

async function main() {
    console.log('Iniciando seed de instituicoes...')

    // upsert nao funciona com "nome" pois nao e campo @unique no schema.
    // Usamos findFirst + update/create como alternativa segura.
    // ⚠️  Quando o codigo INEP estiver disponivel, substitua por upsert com where: { codigoInep }
    for (const escola of escolas) {
        const dados = {
            bairro: escola.bairro,
            endereco: escola.endereco,
            telefone: escola.telefone,
            latitude: toCoord(escola.lat),
            longitude: toCoord(escola.lon),
            tipo: mapTipo(escola.nome),
        }

        const existente = await prisma.instituicao.findFirst({
            where: { nome: escola.nome },
            select: { id: true },
        })

        if (existente) {
            await prisma.instituicao.update({
                where: { id: existente.id },
                data: dados,
            })
        } else {
            await prisma.instituicao.create({
                data: { nome: escola.nome, ativo: true, ...dados },
            })
        }

        console.log('  OK: ' + escola.nome)
    }

    console.log('\nSeed concluido - ' + escolas.length + ' instituicoes inseridas/atualizadas.')
}

main()
    .catch((e) => {
        console.error('Erro no seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
