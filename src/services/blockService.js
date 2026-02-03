import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import blocosData from '../data/blocos.json';

const staticBlocks = Array.isArray(blocosData) ? blocosData : (blocosData?.default || []);

/**
 * Converte array de IDs de blocos em array de objetos de blocos completos.
 * Primeiro tenta buscar dos blocos estáticos (performance), depois do Firestore.
 * 
 * @param {Array<string|number>} blockIds - Array de IDs de blocos
 * @returns {Promise<Array<Object>>} - Array de objetos de blocos com todos os dados
 */
export const hydrateBlocks = async (blockIds) => {
    if (!Array.isArray(blockIds) || blockIds.length === 0) {
        return [];
    }

    console.log(`[BlockService] Hydrating ${blockIds.length} block IDs...`);

    // 1. Criar Map de blocos estáticos para lookup rápido
    const staticBlocksMap = new Map(
        staticBlocks.map(block => [String(block.id), block])
    );

    // 2. Tentar buscar dos blocos estáticos primeiro (mais rápido)
    const result = [];
    const missingIds = [];

    blockIds.forEach(id => {
        const normalizedId = String(id);
        if (staticBlocksMap.has(normalizedId)) {
            result.push(staticBlocksMap.get(normalizedId));
        } else {
            missingIds.push(normalizedId);
        }
    });

    console.log(`[BlockService] Found ${result.length} blocks in static data, ${missingIds.length} missing`);

    // 3. Se houver IDs faltando, buscar do Firestore (blocos dinâmicos)
    if (missingIds.length > 0) {
        try {
            const dynamicBlocks = await fetchDynamicBlocks(missingIds);
            result.push(...dynamicBlocks);
            console.log(`[BlockService] Fetched ${dynamicBlocks.length} blocks from Firestore`);
        } catch (error) {
            console.error('[BlockService] Error fetching dynamic blocks:', error);
            // Não throw - retornar os blocos que conseguimos
        }
    }

    return result;
};

/**
 * Busca blocos dinâmicos do Firestore em batches (limite de 10 por query).
 */
const fetchDynamicBlocks = async (blockIds) => {
    if (blockIds.length === 0) return [];

    // Safety check: Verificar se db está disponível
    if (!db) {
        console.warn('[BlockService] Firestore not available, skipping dynamic blocks');
        return [];
    }

    const BATCH_SIZE = 10;
    const batches = [];

    // Dividir em batches de 10
    for (let i = 0; i < blockIds.length; i += BATCH_SIZE) {
        batches.push(blockIds.slice(i, i + BATCH_SIZE));
    }

    console.log(`[BlockService] Fetching ${batches.length} batches from Firestore...`);

    try {
        // Executar queries em paralelo
        const batchPromises = batches.map(async (batch) => {
            try {
                const blocksCollection = collection(db, 'approved_blocks');
                const blocksQuery = query(
                    blocksCollection,
                    where('__name__', 'in', batch)
                );
                const snapshot = await getDocs(blocksQuery);

                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (batchError) {
                console.error('[BlockService] Error fetching batch:', batchError);
                return []; // Retornar array vazio para este batch
            }
        });

        const batchResults = await Promise.all(batchPromises);
        return batchResults.flat();
    } catch (error) {
        console.error('[BlockService] Error in fetchDynamicBlocks:', error);
        return [];
    }
};
