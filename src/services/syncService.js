import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { withRetry } from '../utils/withRetry';

const USERS_COLLECTION = 'users';

/**
 * Saves the user's entire favorites list to Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @param {Array<Object>} favorites - Array of favorite block objects {id, addedAt, ...}.
 */
export const saveUserFavorites = async (userId, favorites, userName = 'Folião') => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const publicRef = doc(db, 'public_agendas', userId);

        const timestamp = new Date().toISOString();
        const blockIds = favorites.map(f => f.id);

        console.log(`[SyncService] Items to sync: ${favorites.length}. Payload size: approx ${JSON.stringify(favorites).length} bytes`);

        // 1. Save private user data
        console.log(`[SyncService] Saving private favorites for ${userId}...`);
        const privateSave = setDoc(userRef, {
            favorites,
            updatedAt: timestamp
        }, { merge: true })
            .then(() => console.log(`[SyncService] Private favorites saved for ${userId}`))
            .catch(err => {
                console.error(`[SyncService] FAILED private save for ${userId}:`, err.message);
                throw err;
            });

        // 2. Sync to public agenda (Live Link)
        console.log(`[SyncService] Syncing public agenda for ${userId}...`);
        const publicSave = setDoc(publicRef, {
            ownerId: userId,
            ownerName: userName,
            blocks: blockIds,
            updatedAt: timestamp
        }, { merge: true })
            .then(() => console.log(`[SyncService] Public agenda synced for ${userId}`))
            .catch(err => {
                console.error(`[SyncService] FAILED public sync for ${userId}:`, err.message);
                throw err;
            });

        await Promise.all([privateSave, publicSave]);
        console.log(`[SyncService] All sync operations finished for ${userId}`);
    } catch (error) {
        console.error(`[SyncService] Error saving user favorites for ${userId}:`, error.message);
        throw error;
    }
};

/**
 * Fetches the user's favorites from Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @returns {Promise<Array<Object>|null>} - The favorites array or null.
 */
export const getUserFavorites = async (userId) => {
    return withRetry(async () => {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                return docSnap.data().favorites || [];
            }
            return null;
        } catch (error) {
            console.error('Error getting user favorites:', error.message);
            throw error;
        }
    }, 2);
};

/**
 * Adds or removes a single block from favorites in Firestore.
 * Useful for incremental updates.
 * @param {string} userId 
 * @param {Object} blockData 
 * @param {boolean} isAdding 
 */
export const syncFavoriteToggle = async (userId, blockData, isAdding) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const update = isAdding
            ? { favorites: arrayUnion(blockData) }
            : { favorites: arrayRemove(blockData) };

        await updateDoc(userRef, {
            ...update,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        // If document doesn't exist, use setDoc
        if (error.code === 'not-found') {
            await saveUserFavorites(userId, isAdding ? [blockData] : []);
        } else {
            console.error('Error toggling favorite in cloud:', error.message);
            throw error;
        }
    }
};
