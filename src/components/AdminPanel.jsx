import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { collection, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const AdminPanel = ({ isOpen, onClose }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID being processed

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        console.log("AdminPanel: Listening for suggestions...");

        const q = collection(db, 'suggested_blocks');
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log("AdminPanel: Snapshot received", querySnapshot.size);
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setSuggestions(list);
            setLoading(false);
        }, (error) => {
            console.error("AdminPanel Error:", error);
            setLoading(false);
            alert("Erro de conexão com Admin Panel.");
        });

        return () => unsubscribe();
    }, [isOpen]);

    const handleApprove = async (suggestion) => {
        setProcessing(suggestion.id);
        try {
            // 1. Add to approved_blocks with SAME ID to prevent duplicates
            const { id, suggestedBy, suggestedByName, suggestedByEmail, createdAt, status, ...blockData } = suggestion;

            // Use setDoc to ensure idempotency
            await setDoc(doc(db, 'approved_blocks', id), {
                ...blockData,
                source: 'user_suggestion',
                approvedAt: new Date().toISOString(),
                originalId: id
            });

            // 2. Delete from suggested_blocks
            await deleteDoc(doc(db, 'suggested_blocks', id));

            // 3. Remove from UI (optimistic update happened? No, we wait for confirmation but don't want to get stuck)
            // The snapshot listener might update it, but let's ensure local state is clean
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error approving block:", error);
            alert("Erro ao aprovar. Verifique sua conexão.");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id) => {
        setProcessing(id);
        try {
            await deleteDoc(doc(db, 'suggested_blocks', id));
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error rejecting block:", error);
            alert("Erro ao rejeitar.");
        } finally {
            setProcessing(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <div className="bg-background w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
                    {/* Header */}
                    <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/20">
                        <h2 className="text-xl font-black italic tracking-tight">
                            Painel <span className="text-primary NOT-italic">Admin</span>
                        </h2>
                        <div className="flex gap-2">

                            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                <X className="w-5 h-5 opacity-60" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin opacity-50" /></div>
                        ) : suggestions.length === 0 ? (
                            <div className="text-center py-10 opacity-40 text-sm font-bold uppercase tracking-widest">Nenhuma sugestão pendente</div>
                        ) : (
                            suggestions.map(s => (
                                <div key={s.id} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-black text-lg">{s.nome}</h3>
                                        <div className="text-xs text-muted-foreground space-y-1 mt-1">
                                            <p><span className="font-bold">Quando:</span> {s.data} às {s.horario}</p>
                                            <p><span className="font-bold">Onde:</span> {s.endereco} ({s.bairro})</p>
                                            <p><span className="font-bold">Por:</span> {s.suggestedByName} ({s.suggestedByEmail})</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 self-end md:self-center">
                                        <button
                                            onClick={() => handleReject(s.id)}
                                            disabled={processing === s.id}
                                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {processing === s.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(s)}
                                            disabled={processing === s.id}
                                            className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {processing === s.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminPanel;
