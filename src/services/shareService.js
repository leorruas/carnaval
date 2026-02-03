import { db } from './firebase';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'shared_agendas';

/**
 * Creates a shared agenda document in Firestore.
 * @param {string} userId - The user's ID (or null/anonymous ID).
 * @param {string} userName - The user's display name.
 * @param {Array<number>} blockIds - List of block IDs to share.
 * @returns {Promise<string>} - The ID of the created document (the share token).
 */
export const createShareLink = async (userId, userName, blockIds) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ownerId: userId,
            ownerName: userName,
            blocks: blockIds,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating share link:', error);
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
