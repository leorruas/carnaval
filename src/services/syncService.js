import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Saves the user's entire favorites list to Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @param {Array<Object>} favorites - Array of favorite block objects {id, addedAt, ...}.
 */
export const saveUserFavorites = async (userId, favorites) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await setDoc(userRef, {
            favorites,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user favorites:', error);
        throw error;
    }
};

/**
 * Fetches the user's favorites from Firestore.
 * @param {string} userId - The user's Firebase UID.
 * @returns {Promise<Array<Object>|null>} - The favorites array or null.
 */
export const getUserFavorites = async (userId) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data().favorites || [];
        }
        return null;
    } catch (error) {
        console.error('Error getting user favorites:', error);
        throw error;
    }
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
            console.error('Error toggling favorite in cloud:', error);
            throw error;
        }
    }
};
