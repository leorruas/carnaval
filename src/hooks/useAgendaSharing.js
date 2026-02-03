import { useState } from 'react';

export const useAgendaSharing = (auth, setIsLoginModalOpen) => {
    const [isSharing, setIsSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleShare = async () => {
        const user = auth.currentUser;
        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }
        const liveLink = `${window.location.origin}/agenda?uid=${user.uid}`;
        try {
            setIsSharing(true);
            if (navigator.share) {
                await navigator.share({
                    title: `Agenda de ${user.displayName || 'Amigo'} - Carnaval BH`,
                    url: liveLink,
                });
            } else {
                await navigator.clipboard.writeText(liveLink);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error sharing live link:', error);
            alert('Erro ao sincronizar dados. Tente novamente.');
        } finally {
            setIsSharing(false);
        }
    };

    return {
        isSharing,
        shareSuccess,
        handleShare
    };
};
