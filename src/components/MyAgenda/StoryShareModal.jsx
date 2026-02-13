import { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStoryShare } from '../../hooks/useStoryShare';
import StoryPreview from './StoryPreview';
import { formatTime } from '../../utils/dateUtils';

const StoryShareModal = ({ isOpen, onClose, blocks, date }) => {
    const [selectedIds, setSelectedIds] = useState(() => {
        // Initially select up to 4 blocks
        return blocks.slice(0, 4).map(b => b.id);
    });
    const [view, setView] = useState(blocks.length > 4 ? 'select' : 'preview');
    const { isGenerating, error, generateAndShare } = useStoryShare();
    const previewRef = useRef(null);

    const toggleBlock = (id) => {
        setSelectedIds(current => {
            if (current.includes(id)) {
                return current.filter(itemId => itemId !== id);
            }
            if (current.length >= 4) return current;
            return [...current, id];
        });
    };

    const selectedBlocks = useMemo(() => {
        return blocks.filter(b => selectedIds.includes(b.id));
    }, [blocks, selectedIds]);

    const handleGenerate = async () => {
        const success = await generateAndShare(previewRef);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-muted w-full max-w-sm rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-foreground/5 max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-foreground/5 bg-muted/50">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Compartilhar Story</h2>
                        {blocks.length > 4 && (
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Máximo de 4 blocos</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {view === 'select' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="font-black text-sm uppercase opacity-60">Escolha seus favoritos</h3>
                                <span className={`text-xs font-black ${selectedIds.length === 4 ? 'text-primary' : 'opacity-40'}`}>
                                    {selectedIds.length}/4
                                </span>
                            </div>
                            <div className="grid gap-3">
                                {blocks.map(block => (
                                    <button
                                        key={block.id}
                                        onClick={() => toggleBlock(block.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedIds.includes(block.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-transparent bg-background/50 opacity-60'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.includes(block.id) ? 'bg-primary border-primary' : 'border-foreground/20'
                                            }`}>
                                            {selectedIds.includes(block.id) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black truncate">{block.nome}</p>
                                            <p className="text-[10px] font-bold opacity-40 uppercase">{formatTime(block.horario)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="aspect-[9/16] bg-background rounded-3xl overflow-hidden border border-foreground/5 shadow-inner relative group">
                                {/* A very scaled down version of the real preview for visual feedback */}
                                <div className="scale-[0.28] origin-top w-[1080px] h-[1920px] pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-background border border-foreground/10 rounded-[60px] overflow-hidden shadow-2xl z-10">
                                    {/* This renders the actual component but scaled down significantly */}
                                    {/* In a real scenario, we might want a simpler mock here for performance */}
                                    {date && <StoryPreview selectedBlocks={selectedBlocks} date={date} />}
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-muted/50 border-t border-foreground/5 flex gap-3">
                    {view === 'select' ? (
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => setView('preview')}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    ) : (
                        <>
                            {blocks.length > 4 && (
                                <button
                                    onClick={() => setView('select')}
                                    className="px-6 py-4 rounded-2xl border-2 border-foreground/5 font-black text-xs uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            )}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Gerando...
                                    </>
                                ) : 'Gerar Imagem'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* The hidden canvas for actual capture */}
            <div style={{ position: 'fixed', left: '-9999px', top: '0', pointerEvents: 'none' }}>
                {date && <StoryPreview selectedBlocks={selectedBlocks} date={date} forwardRef={previewRef} />}
            </div>
        </div>
    );
};

StoryShareModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    blocks: PropTypes.array.isRequired,
    date: PropTypes.string
};

export default StoryShareModal;
