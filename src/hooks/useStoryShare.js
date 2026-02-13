import { useState } from 'react';
import { toBlob } from 'html-to-image';

export const useStoryShare = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generateAndShare = async (elementRef) => {
        if (!elementRef.current) {
            setError('Elemento de preview não encontrado.');
            return;
        }

        try {
            setIsGenerating(true);
            setError(null);

            // Wait a bit for any pending styles/images to load if needed
            // but html-to-image usually handles this.
            const blob = await toBlob(elementRef.current, {
                pixelRatio: 2, // Better quality for stories
                skipFonts: false,
            });

            if (!blob) throw new Error('Falha ao gerar imagem.');

            const file = new File([blob], 'meus-blocos-carnaval.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Meus Blocos do Carnaval BH',
                    text: 'Confira minha agenda pro Carnaval! 🎊',
                });
            } else {
                // Fallback to download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'meus-blocos-carnaval.png';
                link.click();
                URL.revokeObjectURL(url);
            }

            return true;
        } catch (err) {
            console.error('Error generating image:', err);
            setError('Não foi possível gerar a imagem. Tente novamente.');
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        error,
        generateAndShare
    };
};
