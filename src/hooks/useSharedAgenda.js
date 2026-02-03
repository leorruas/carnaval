import { useState, useEffect } from 'react';
import { getSharedAgenda, getPublicAgenda } from '../services/shareService';

export const useSharedAgenda = (publicUid, shareId) => {
    const [sharedData, setSharedData] = useState(null);
    const [isLoadingShared, setIsLoadingShared] = useState(false);

    useEffect(() => {
        const fetchShared = async () => {
            if (publicUid) {
                setIsLoadingShared(true);
                try {
                    const data = await getPublicAgenda(publicUid);
                    if (data) setSharedData({ ...data, isLive: true });
                } catch (error) {
                    console.error("Failed to load public agenda", error);
                } finally {
                    setIsLoadingShared(false);
                }
                return;
            }

            if (shareId) {
                setIsLoadingShared(true);
                try {
                    const data = await getSharedAgenda(shareId);
                    if (data) setSharedData({ ...data, isLive: false });
                } catch (error) {
                    console.error("Failed to load shared agenda", error);
                } finally {
                    setIsLoadingShared(false);
                }
            }
        };

        if (publicUid || shareId) fetchShared();
    }, [shareId, publicUid]);

    return { sharedData, isLoadingShared, setSharedData };
};
