const HomeSuggestionFooter = ({ onSuggest }) => {
    return (
        <div className="py-12 text-center pb-20">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-4">
                Não encontrou seu bloco?
            </p>
            <button
                onClick={onSuggest}
                className="bg-muted/30 hover:bg-muted text-foreground px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
            >
                Sugerir Adição
            </button>
        </div>
    );
};

export default HomeSuggestionFooter;
