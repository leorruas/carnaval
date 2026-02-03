import { motion } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';

const NextBlockCard = ({ nextBlock, nextBlockTheme }) => {
    if (!nextBlock || !nextBlockTheme) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
            style={{ backgroundColor: nextBlockTheme.color }}
        >
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-white/80">
                    <span className="text-xs font-black uppercase tracking-widest">Próximo Bloco</span>
                </div>
                <h3 className="text-2xl font-black mb-1">{nextBlock.nome}</h3>
                <p className="text-white/90 text-sm">{formatDate(nextBlock.data)} às {nextBlock.horario}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </motion.div>
    );
};

export default NextBlockCard;
