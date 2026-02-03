import { ArrowLeft } from 'lucide-react';

const SharedAgendaError = ({ error, onBack }) => {
    if (!error) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <ArrowLeft className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black font-bricolage text-foreground mb-2">Ops!</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">{error}</p>
            <button
                onClick={onBack}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
                Voltar para minha agenda
            </button>
        </div>
    );
};

export default SharedAgendaError;
