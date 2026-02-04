import { useState, useEffect, useMemo } from 'react';
import { getPublicAgenda } from '../services/shareService';

const CACHE_KEY = 'friends_agenda_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useFriendsAgendas = (friendsList) => {
    const [friendsAgendas, setFriendsAgendas] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Create stable key from friends list to prevent infinite loops
    const friendsKey = useMemo(() => {
        if (!friendsList || friendsList.length === 0) return '';
        return friendsList.map(f => f.shareId || f.uid).sort().join(',');
    }, [friendsList]);

    useEffect(() => {
        if (!friendsKey) {
            setFriendsAgendas({});
            return;
        }

        const fetchAgendas = async () => {
            setIsLoading(true);
            const now = Date.now();
            let cache = {};

            try {
                const stored = localStorage.getItem(CACHE_KEY);
                if (stored) {
                    cache = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error parsing friends agenda cache', e);
            }

            const newAgendas = {};
            let hasUpdates = false;

            const promises = friendsList.map(async (friend) => {
                const friendId = friend.shareId || friend.uid;
                if (!friendId) return;

                // Check cache
                if (
                    cache[friendId] &&
                    cache[friendId].timestamp &&
                    now - cache[friendId].timestamp < CACHE_DURATION
                ) {
                    newAgendas[friendId] = cache[friendId].data;
                    return;
                }

                // Fetch fresh data
                try {
                    const data = await getPublicAgenda(friendId);
                    if (data) {
                        newAgendas[friendId] = data;
                        cache[friendId] = {
                            timestamp: now,
                            data: data
                        };
                        hasUpdates = true;
                    }
                } catch (error) {
                    // Fail silently for individual friends
                    console.warn(`Failed to fetch agenda for friend ${friendId}`, error);
                }
            });

            await Promise.all(promises);

            if (hasUpdates) {
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
                } catch (e) {
                    console.error('Error saving friends agenda cache', e);
                }
            }

            setFriendsAgendas(newAgendas);
            setIsLoading(false);
        };

        fetchAgendas();
    }, [friendsKey]); // Use stable key instead of array

    return { friendsAgendas, isLoading };
};
