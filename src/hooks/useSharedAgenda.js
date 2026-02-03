import { useState, useEffect } from 'react';
import { getSharedAgenda, getPublicAgenda } from '../services/shareService';
import { useFirestoreReady } from './useFirestoreReady';

export const useSharedAgenda = (publicUid, shareId) => {
    const [sharedData, setSharedData] = useState(null);
    const [isLoadingShared, setIsLoadingShared] = useState(false);
    const [sharedError, setSharedError] = useState(null);
    const { isReady, isOnline } = useFirestoreReady();

    useEffect(() => {
        const fetchShared = async () => {
            // Aguardar Firestore estar pronto
            if (!isReady) {
                console.log('[useSharedAgenda] Waiting for Firestore to be ready...');
                setIsLoadingShared(true);
                return;
            }

            // Verificar conexão de internet
            if (!isOnline) {
                setSharedError('Você está offline. Conecte-se à internet para visualizar agendas compartilhadas.');
                setIsLoadingShared(false);
                return;
            }

            console.log(`[useSharedAgenda] Starting fetch with: uid=${publicUid}, shareId=${shareId}`);
            setIsLoadingShared(true);
            setSharedError(null);

            try {
                if (publicUid) {
                    const data = await getPublicAgenda(publicUid);
                    if (data) {
                        setSharedData({
                            ...data,
                            id: data.id || publicUid,
                            blocks: data.blocks || [],
                            isLive: true
                        });
                    } else {
                        setSharedError('Agenda não encontrada ou privada');
                    }
                } else if (shareId) {
                    const data = await getSharedAgenda(shareId);
                    if (data) {
                        setSharedData({
                            ...data,
                            id: data.id || shareId,
                            blocks: data.blocks || data.favoriteBlocks || [],
                            isLive: false
                        });
                    } else {
                        setSharedError('Link expirado ou inválido');
                    }
                }
            } catch (error) {
                console.error("Failed to load shared agenda", error);
                setSharedError(error.message || 'Erro de conexão com o servidor');
            } finally {
                setIsLoadingShared(false);
            }
        };

        if (publicUid || shareId) fetchShared();
    }, [shareId, publicUid, isReady, isOnline]);

    return { sharedData, isLoadingShared, sharedError, setSharedData, isLive: sharedData?.isLive };
};
