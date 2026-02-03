import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MapPin, Calendar, Clock, AlignLeft } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const SuggestBlockModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        nome: '',
        data: '',
        horario: '',
        bairro: '',
        endereco: '',
        descricao: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            setError("Você precisa estar logado para sugerir um bloco.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Race condition to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('A conexão está lenta. Verifique sua internet e tente novamente.')), 30000)
            );

            const submissionPromise = addDoc(collection(db, 'suggested_blocks'), {
                ...formData,
                suggestedBy: auth.currentUser.uid,
                suggestedByName: auth.currentUser.displayName || 'Anônimo',
                suggestedByEmail: auth.currentUser.email,
                createdAt: serverTimestamp(),
                status: 'pending'
            });

            await Promise.race([submissionPromise, timeoutPromise]);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setFormData({ nome: '', data: '', horario: '', bairro: '', endereco: '', descricao: '' });
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Error suggesting block:", err);
            setError(err.message || "Erro ao enviar sugestão. Verifique sua conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-background w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/20">
                        <h2 className="text-xl font-black italic tracking-tight">
                            Sugerir <span className="text-primary NOT-italic">Bloco</span>
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X className="w-5 h-5 opacity-60" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {success ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-green-600">Enviado!</h3>
                                <p className="text-sm text-muted-foreground">Sua sugestão foi enviada para análise.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Nome do Bloco</label>
                                        <input
                                            required
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            placeholder="Ex: Tchanzinho Zona Norte"
                                            className="w-full bg-muted/30 border-transparent focus:border-primary/50 focus:bg-background rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60 flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                                            <input
                                                required
                                                type="date"
                                                name="data"
                                                value={formData.data}
                                                onChange={handleChange}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary/50 focus:bg-background rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60 flex items-center gap-1"><Clock className="w-3 h-3" /> Horário</label>
                                            <input
                                                required
                                                type="time"
                                                name="horario"
                                                value={formData.horario}
                                                onChange={handleChange}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary/50 focus:bg-background rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</label>
                                        <input
                                            placeholder="Bairro"
                                            name="bairro"
                                            value={formData.bairro}
                                            onChange={handleChange}
                                            className="w-full bg-muted/30 border-transparent focus:border-primary/50 focus:bg-background rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none mb-2"
                                        />
                                        <input
                                            required
                                            placeholder="Endereço / Ponto de Referência"
                                            name="endereco"
                                            value={formData.endereco}
                                            onChange={handleChange}
                                            className="w-full bg-muted/30 border-transparent focus:border-primary/50 focus:bg-background rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
                                    </button>
                                    <p className="text-center text-[10px] text-muted-foreground mt-3 opacity-60">
                                        Os blocos sugeridos passarão por aprovação.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SuggestBlockModal;
