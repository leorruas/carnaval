import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { withRetry } from '../utils/withRetry';

const USERS_COLLECTION = 'users';

/**
 * Saves user data (favorites and friends) to Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @param {Object} data - Data to save { favorites, friends }.
 * @param {string} userName - User's display name.
 */
export const saveUserData = async (userId, { favorites, friends }, userName = 'Folião') => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const publicRef = doc(db, 'public_agendas', userId);

        const timestamp = new Date().toISOString();
        const blockIds = favorites ? favorites.map(f => f.id) : [];

        console.log(`[SyncService] Syncing data for ${userId}. Favorites: ${favorites?.length}, Friends: ${friends?.length}`);

        // 1. Save private user data (favorites + friends)
        const dataToSave = {
            updatedAt: timestamp
        };
        if (favorites) dataToSave.favorites = favorites;
        if (friends) dataToSave.friends = friends;

        console.log(`[SyncService] Saving private data for ${userId}...`);
        const privateSave = setDoc(userRef, dataToSave, { merge: true })
            .then(() => console.log(`[SyncService] Private data saved for ${userId}`))
            .catch(err => {
                console.error(`[SyncService] FAILED private save for ${userId}:`, err.message);
                throw err;
            });

        // 2. Sync to public agenda (Live Link) - ONLY favorites go public
        let publicSave = Promise.resolve();
        if (favorites) {
            console.log(`[SyncService] Syncing public agenda for ${userId}...`);
            publicSave = setDoc(publicRef, {
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
        }

        await Promise.all([privateSave, publicSave]);
        console.log(`[SyncService] All sync operations finished for ${userId}`);
    } catch (error) {
        console.error(`[SyncService] Error saving user data for ${userId}:`, error.message);
        throw error;
    }
};

/**
 * @deprecated Use saveUserData instead
 */
export const saveUserFavorites = async (userId, favorites, userName) => {
    return saveUserData(userId, { favorites }, userName);
};

/**
 * Fetches the user's data (favorites and friends) from Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @returns {Promise<Object|null>} - { favorites, friends } or null.
 */
export const getUserData = async (userId) => {
    return withRetry(async () => {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    favorites: data.favorites || [],
                    friends: data.friends || []
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error.message);
            throw error;
        }
    }, 2);
};

/**
 * @deprecated Use getUserData instead
 */
export const getUserFavorites = async (userId) => {
    const data = await getUserData(userId);
    return data ? data.favorites : null;
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
        // If document doesn't exist, use saveUserData
        if (error.code === 'not-found') {
            await saveUserData(userId, { favorites: isAdding ? [blockData] : [] });
        } else {
            console.error('Error toggling favorite in cloud:', error.message);
            throw error;
        }
    }
};
