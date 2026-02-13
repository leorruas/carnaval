import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { collection, deleteDoc, doc, setDoc, onSnapshot, Timestamp, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import AdminReviews from './AdminReviews';
import { geocodeAddress } from '../services/geocodingService';

const AdminPanel = ({ isOpen, onClose, user }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID being processed
    const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' or 'reviews'

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
            // Attempt geocoding
            let coordinates = {};
            try {
                const result = await geocodeAddress(suggestion.endereco, suggestion.bairro);
                if (result) {
                    coordinates = {
                        latitude: String(result.latitude),
                        longitude: String(result.longitude)
                    };
                    console.log("[AdminPanel] Geocoding success:", coordinates);
                } else {
                    console.warn("[AdminPanel] Geocoding failed for address:", suggestion.endereco);
                }
            } catch (geoError) {
                console.error("[AdminPanel] Geocoding error:", geoError);
            }

            // 1. Add to approved_blocks with NEW badge fields and coordinates
            const { id, suggestedBy, suggestedByName, suggestedByEmail, createdAt, status, ...blockData } = suggestion;

            const approvedAt = new Date();
            const newBadgeUntil = new Date(approvedAt);
            newBadgeUntil.setDate(newBadgeUntil.getDate() + 7); // +7 days

            // Use setDoc to ensure idempotency
            await setDoc(doc(db, 'approved_blocks', id), {
                ...blockData,
                ...coordinates, // Inject geocoded coordinates if found
                source: 'user_suggestion',
                isUserSuggested: true,
                approvedAt: Timestamp.fromDate(approvedAt),
                newBadgeUntil: Timestamp.fromDate(newBadgeUntil),
                originalId: id,
                // Initialize review fields
                avgRating: null,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });

            // 2. Delete from suggested_blocks
            await deleteDoc(doc(db, 'suggested_blocks', id));

            // 3. Remove from UI
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
                            <button
                                onClick={async () => {
                                    if (!window.confirm("Deseja geocodificar todos os blocos aprovados sem coordenadas?")) return;
                                    setProcessing('bulk-geo');
                                    let currentBlockName = "";
                                    try {
                                        const snap = await getDocs(collection(db, 'approved_blocks'));
                                        console.log(`[AdminPanel] Analyzing ${snap.size} blocks...`);

                                        let count = 0;
                                        let needsFix = 0;
                                        for (const blockDoc of snap.docs) {
                                            const data = blockDoc.data();
                                            // Skip metadata and blocks that already have coordinates
                                            if (!data.nome || (data.latitude && data.longitude)) continue;

                                            currentBlockName = data.nome;
                                            needsFix++;
                                            const result = await geocodeAddress(data.endereco, data.bairro);
                                            if (result) {
                                                await updateDoc(doc(db, 'approved_blocks', blockDoc.id), {
                                                    latitude: String(result.latitude),
                                                    longitude: String(result.longitude)
                                                });
                                                count++;
                                            }
                                            // Sleep 1.2s to respect Nominatim usage policy (max 1 req/sec)
                                            await new Promise(r => setTimeout(r, 1200));
                                        }
                                        alert(`Processo concluído!\nBlocos analisados: ${snap.size}\nPrecisavam de coordenadas: ${needsFix}\nCorrigidos: ${count}`);
                                    } catch (err) {
                                        console.error("Bulk Geocoding Error:", err);
                                        alert(`Erro no processo de geocodificação em massa.\n\nDetalhe: ${err.message || 'Erro desconhecido'}\nBloco atual: ${currentBlockName || 'Nenhum'}`);
                                    } finally {
                                        setProcessing(null);
                                    }
                                }}
                                disabled={processing === 'bulk-geo'}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                {processing === 'bulk-geo' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                GEO FIX
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                <X className="w-5 h-5 opacity-60" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border/40 bg-muted/10">
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            className={`flex-1 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'suggestions'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Sugestões {suggestions.length > 0 && `(${suggestions.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'reviews'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Moderação
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'suggestions' && (
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
                    )}

                    {activeTab === 'reviews' && (
                        <div className="flex-1 overflow-y-auto">
                            <AdminReviews user={user} />
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminPanel;
