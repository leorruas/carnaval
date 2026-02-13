import { Share2, Download, Image as ImageIcon } from 'lucide-react';
import PropTypes from 'prop-types';

const AgendaActions = ({ onShare, onShareStory, onExport, isSharing, shareSuccess, hasBlocks }) => {
    return (
        <div className="flex flex-col gap-3 mb-8">
            <div className="flex gap-3">
                <button
                    onClick={onShare}
                    disabled={isSharing}
                    className={`flex-1 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${shareSuccess
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Share2 className={`w-4 h-4 ${isSharing ? 'animate-spin' : ''}`} />
                    {isSharing ? 'Gerando...' : shareSuccess ? 'Copiado!' : 'Compartilhar Link'}
                </button>
                <button
                    onClick={onExport}
                    disabled={!hasBlocks}
                    className="flex-1 py-4 px-2 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" /> Colocar na minha agenda
                </button>
            </div>

            <button
                onClick={onShareStory}
                disabled={!hasBlocks}
                className="w-full py-4 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
                <ImageIcon className="w-4 h-4" /> Compartilhar Story
            </button>
        </div>
    );
};

AgendaActions.propTypes = {
    onShare: PropTypes.func.isRequired,
    onShareStory: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    isSharing: PropTypes.bool.isRequired,
    shareSuccess: PropTypes.bool.isRequired,
    hasBlocks: PropTypes.bool.isRequired
};

export default AgendaActions;
