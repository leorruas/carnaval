import { saveUserFavorites } from '../services/syncService';

/**
 * Merges local favorites with cloud favorites and saves back to cloud.
 * Deduplicates by block ID.
 * 
 * @param {string} userId - Current authenticated user ID
 * @param {Array} localFavs - Array of block IDs from local storage
 * @param {Array} cloudFavs - Array of block IDs from Firestore
 * @param {string} displayName - User display name
 * @returns {Promise<Array>} The merged array of block IDs
 */
export const mergeFavorites = async (userId, localFavs = [], cloudFavs = [], displayName = 'Folião') => {
    const cloudList = Array.isArray(cloudFavs) ? cloudFavs : [];
    const localList = Array.isArray(localFavs) ? localFavs : [];

    // Create a map keyed by ID for deduplication
    const map = new Map();

    // Prioritize cloud info but keep order if possible
    cloudList.forEach(item => {
        if (item && item.id) map.set(item.id, item);
    });

    localList.forEach(item => {
        if (item && item.id && !map.has(item.id)) {
            map.set(item.id, item);
        }
    });

    const mergedList = Array.from(map.values());

    // Only save if we actually have new items compared to cloud
    const cloudIds = new Set(cloudList.map(f => f.id));
    const hasUpdates = mergedList.some(item => !cloudIds.has(item.id));

    if (hasUpdates) {
        console.log(`[Migration] Merging ${localList.length} local and ${cloudList.length} cloud. New total: ${mergedList.length}`);
        // We only trigger the save, but we don't necessarily block the app for it
        // saveUserFavorites internally does the public sync too
        await saveUserFavorites(userId, mergedList, displayName);
    }

    return mergedList;
};
