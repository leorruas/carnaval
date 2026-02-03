import { motion } from 'framer-motion';
import { getDateTheme } from '../../utils/themeUtils';

const DateScrollSelector = ({ navigationDates, selectedDate, activeTab, onDateSelect }) => {

    // Only show if we have dates
    if (!navigationDates || navigationDates.length <= 1) return null;

    return (
        <div className="relative group/scroll">
            <button
                onClick={() => {
                    const el = document.getElementById('date-scroll-container');
                    if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10 pointer-events-none group-hover/scroll:pointer-events-auto"
            >
                <span className="text-lg leading-none mb-0.5">‹</span>
            </button>

            <motion.div
                id="date-scroll-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-3 overflow-x-auto hide-scrollbar px-4 md:px-16 pb-2 scroll-smooth"
            >
                {navigationDates.map(date => {
                    // Selected if it matches state AND we are in a mode that uses selection (Calendar or Favorites)
                    const isSelected = selectedDate === date && (activeTab === 'calendar' || activeTab === 'favorites');
                    const theme = getDateTheme(date);
                    return (
                        <button
                            key={date}
                            data-date={date}
                            onClick={() => onDateSelect(date)}
                            className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all group border shrink-0 font-bricolage ${isSelected
                                ? `text-white scale-105`
                                : `bg-muted/20 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/20 border-transparent`
                                }`}
                            style={isSelected ? {
                                backgroundColor: theme.color,
                                borderColor: theme.color,
                            } : {}}
                        >
                            <span className="text-sm font-black">{date.split('-')[2]}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                                {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                            </span>
                        </button>
                    );
                })}
            </motion.div>

            <button
                onClick={() => {
                    const el = document.getElementById('date-scroll-container');
                    if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10 pointer-events-none group-hover/scroll:pointer-events-auto"
            >
                <span className="text-lg leading-none mb-0.5">›</span>
            </button>
        </div>
    );
};

export default DateScrollSelector;
