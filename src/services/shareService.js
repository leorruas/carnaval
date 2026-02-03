import { db } from './firebase';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'shared_agendas';

/**
 * Wraps a promise with a timeout that rejects after the specified duration.
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise} - The original promise or a timeout rejection
 */
const withTimeout = (promise, timeoutMs = 10000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        )
    ]);
};

/**
 * Creates a shared agenda document in Firestore.
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

        // Check if Firestore is initialized
        if (!db) {
            throw new Error('Firestore is not initialized');
        }

        console.log('[ShareService] Creating share link...', { userId, userName, blockCount: blockIds.length });

        const docRef = await withTimeout(
            addDoc(collection(db, COLLECTION_NAME), {
                ownerId: userId,
                ownerName: userName,
                blocks: blockIds,
                createdAt: serverTimestamp(),
            }),
            10000 // 10 second timeout
        );

        console.log('[ShareService] Share link created successfully:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('[ShareService] Error creating share link:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * Retrieves a shared agenda from Firestore.
 * @param {string} shareId - The document ID.
 * @returns {Promise<Object|null>} - The agenda data or null if not found.
 */
export const getSharedAgenda = async (shareId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, shareId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log('No such document!');
            return null;
        }
    } catch (error) {
        console.error('Error getting shared agenda:', error);
        throw error;
    }
};
