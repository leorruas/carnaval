import { Search } from 'lucide-react';

const HomeEmptyState = ({ onSuggest }) => {
    return (
        <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center opacity-40">
                <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-muted-foreground opacity-40">Nenhum bloco encontrado</p>
            <button
                onClick={onSuggest}
                className="text-primary text-xs font-black uppercase tracking-widest hover:underline mt-4"
            >
                Sugerir um bloco
            </button>
        </div>
    );
};

export default HomeEmptyState;
