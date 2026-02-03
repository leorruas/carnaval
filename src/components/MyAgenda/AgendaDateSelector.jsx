import { getDateTheme } from '../../utils/themeUtils';

const AgendaDateSelector = ({ navigationDates, selectedDate, onDateSelect }) => {
    return (
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pb-4 pt-4 -mx-6 px-6 mb-6">
            <div className="flex justify-start gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth">
                {(navigationDates || []).map(date => {
                    const isSelected = selectedDate === date;
                    const theme = getDateTheme(date);
                    return (
                        <button
                            key={date}
                            onClick={() => onDateSelect(date)}
                            className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all border shrink-0 font-bricolage ${isSelected
                                ? `text-white scale-105`
                                : `bg-muted/20 hover:bg-primary/10 hover:text-primary border-transparent`
                                }`}
                            style={isSelected ? { backgroundColor: theme.color, borderColor: theme.color } : {}}
                        >
                            <span className="text-sm font-black">{date.split('-')[2]}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest">{new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default AgendaDateSelector;
