import { db } from './firebase';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { withRetry } from '../utils/withRetry';
import { hydrateBlocks } from './blockService';

const COLLECTION_NAME = 'shared_agendas';

/**
 * Wraps a promise with a timeout that rejects after the specified duration.
 */
const withTimeout = (promise, timeoutMs = 10000, errorMessage = 'Operation timed out') => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        )
    ]);
};

/**
 * Retrieves a public agenda (Live Link) from Firestore.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object|null>} - The agenda data or null if not found.
 */
export const getPublicAgenda = async (userId) => {
    if (!userId) return null;

    return withRetry(async () => {
        try {
            console.log(`[ShareService] Fetching public agenda for: ${userId}...`);
            const docRef = doc(db, 'public_agendas', userId);

            const docSnap = await withTimeout(
                getDoc(docRef),
                10000,
                'Timeout ao buscar agenda pública'
            );

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log(`[ShareService] Public agenda found for: ${userId}, hydrating ${data.blocks?.length || 0} blocks...`);

                // ✨ HIDRATAR: Converter IDs em objetos completos
                const blockIds = data.blocks || [];
                const fullBlocks = await hydrateBlocks(blockIds);

                console.log(`[ShareService] Hydrated ${fullBlocks.length} blocks successfully`);

                return {
                    id: docSnap.id,
                    ...data,
                    blocks: fullBlocks  // ✅ Agora contém objetos, não IDs
                };
            } else {
                console.warn(`[ShareService] No public agenda found for uid: ${userId}`);
                return null;
            }
        } catch (error) {
            // Diferenciar tipos de erro
            if (error.message.includes('offline')) {
                throw new Error('Sem conexão com o servidor. Verifique sua internet.');
            } else if (error.message.includes('Timeout')) {
                throw new Error('Servidor demorou muito para responder. Tente novamente.');
            }
            console.error(`[ShareService] Error getting public agenda for ${userId}:`, error.message);
            throw error;
        }
    }, 2); // 2 retries (total 3 tentativas)
};

/**
 * Creates a shared agenda document in Firestore (Legacy Snapshot).
 * @param {string} userId - The user's ID (or null/anonymous ID).
 * @param {string} userName - The user's display name.
 * @param {Array<number>} blockIds - List of block IDs to share.
 * @returns {Promise<string>} - The ID of the created document (the share token).
 */
export const createShareLink = async (userId, userName, blockIds) => {
    try {
        // Validate inputs
        if (!userId || !userName || !Array.isArray(blockIds) || blockIds.length === 0) {
            throw new Error('Invalid parameters for share link creation');
        }

        console.log('[ShareService] Creating share link...', { userId, userName, blockCount: blockIds.length });

        const data = {
            ownerId: userId,
            ownerName: userName,
            blocks: blockIds,
            createdAt: serverTimestamp(),
        };

        const docRef = await withTimeout(
            addDoc(collection(db, COLLECTION_NAME), data),
            20000
        );

        console.log('[ShareService] Share link created successfully:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('[ShareService] Error creating share link:', error.message);
        throw error;
    }
};

/**
 * Retrieves a shared agenda from Firestore.
 * @param {string} shareId - The document ID.
 * @returns {Promise<Object|null>} - The agenda data or null if not found.
 */
export const getSharedAgenda = async (shareId) => {
    return withRetry(async () => {
        try {
            console.log(`[ShareService] Fetching shared snapshot: ${shareId}...`);
            const docRef = doc(db, COLLECTION_NAME, shareId);

            const docSnap = await withTimeout(
                getDoc(docRef),
                10000,
                'Timeout ao buscar agenda compartilhada'
            );

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log(`[ShareService] Shared snapshot found: ${shareId}, hydrating blocks...`);

                // ✨ HIDRATAR: Garantir consistência com Live Links
                const blockIds = data.blocks || [];
                const fullBlocks = await hydrateBlocks(blockIds);

                return {
                    id: docSnap.id,
                    ...data,
                    blocks: fullBlocks
                };
            } else {
                console.warn(`[ShareService] No shared snapshot found for id: ${shareId}`);
                return null;
            }
        } catch (error) {
            if (error.message.includes('offline')) {
                throw new Error('Sem conexão com o servidor. Verifique sua internet.');
            } else if (error.message.includes('Timeout')) {
                throw new Error('Servidor demorou muito para responder. Tente novamente.');
            }
            console.error(`[ShareService] Error getting shared agenda for ${shareId}:`, error.message);
            throw error;
        }
    }, 2);
};
