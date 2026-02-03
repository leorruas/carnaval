import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const FilterModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-8"
        >
            <div className="flex justify-between items-center mb-12 font-bricolage">
                <h2 className="text-3xl font-black italic">Filtros<span className="text-primary NOT-italic">.</span></h2>
                <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-12">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Em breve</h3>
                    <p className="text-sm opacity-60">Filtros por bairro, horário e estilo musical estão sendo implementados!</p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-auto w-full py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest"
            >
                Aplicar
            </button>
        </motion.div>
    );
};

export default FilterModal;
