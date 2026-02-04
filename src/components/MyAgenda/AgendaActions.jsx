import { Share2, Download } from 'lucide-react';

const AgendaActions = ({ onShare, onExport, isSharing, shareSuccess, hasBlocks }) => {
    return (
        <div className="flex gap-3 mb-8">
            <button
                onClick={onShare}
                disabled={isSharing}
                className={`flex-1 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${shareSuccess
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
            >
                <Share2 className={`w-4 h-4 ${isSharing ? 'animate-spin' : ''}`} />
                {isSharing ? 'Gerando...' : shareSuccess ? 'Copiado!' : 'Compartilhar'}
            </button>
            <button
                onClick={onExport}
                disabled={!hasBlocks}
                className="flex-1 py-4 px-2 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4" /> Colocar na minha agenda
            </button>
        </div>
    );
};

export default AgendaActions;
