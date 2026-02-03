import { saveUserData } from '../services/syncService';

/**
 * Merges local user data with cloud user data and saves back to cloud.
 * Deduplicates favorites and friends.
 * 
 * @param {string} userId - Current authenticated user ID
 * @param {Object} localData - { favorites: [], friends: [] }
 * @param {Object} cloudData - { favorites: [], friends: [] }
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} The merged data { favorites, friends }
 */
export const mergeUserData = async (userId, localData = {}, cloudData = {}, displayName = 'Folião') => {
    const localFavs = Array.isArray(localData.favorites) ? localData.favorites : [];
    const cloudFavs = Array.isArray(cloudData.favorites) ? cloudData.favorites : [];

    const localFriends = Array.isArray(localData.friends) ? localData.friends : [];
    const cloudFriends = Array.isArray(cloudData.friends) ? cloudData.friends : [];

    // --- Merge Favorites ---
    const favMap = new Map();
    // Prioritize cloud info but keep order if possible
    cloudFavs.forEach(item => { if (item && item.id) favMap.set(item.id, item); });
    localFavs.forEach(item => { if (item && item.id && !favMap.has(item.id)) favMap.set(item.id, item); });
    const mergedFavorites = Array.from(favMap.values());

    // --- Merge Friends ---
    const friendMap = new Map();
    // Key by shareId
    cloudFriends.forEach(item => { if (item && item.shareId) friendMap.set(item.shareId, item); });
    localFriends.forEach(item => { if (item && item.shareId && !friendMap.has(item.shareId)) friendMap.set(item.shareId, item); });
    const mergedFriends = Array.from(friendMap.values());

    // --- Check for changes ---
    const cloudFavIds = new Set(cloudFavs.map(f => f.id));
    const hasFavUpdates = mergedFavorites.some(item => !cloudFavIds.has(item.id));

    const cloudFriendIds = new Set(cloudFriends.map(f => f.shareId));
    const hasFriendUpdates = mergedFriends.some(item => !cloudFriendIds.has(item.shareId));

    if (hasFavUpdates || hasFriendUpdates) {
        console.log(`[Migration] Merging data. Favorites: ${localFavs.length}L/${cloudFavs.length}C -> ${mergedFavorites.length}. Friends: ${localFriends.length}L/${cloudFriends.length}C -> ${mergedFriends.length}`);

        await saveUserData(userId, {
            favorites: mergedFavorites,
            friends: mergedFriends
        }, displayName);
    }

    return {
        favorites: mergedFavorites,
        friends: mergedFriends
    };
};

