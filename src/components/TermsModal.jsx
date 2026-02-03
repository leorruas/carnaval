import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-card w-full max-w-lg rounded-3xl border border-border/20 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black leading-none">Termos de Uso</h2>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">
                                        Privacidade e Segurança
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 opacity-60" />
                            </button>
                        </div>

                        {/* Content using Scroll Area */}
                        <div className="p-6 overflow-y-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
                            <section>
                                <h3 className="text-foreground font-bold mb-2">1. Sobre o Aplicativo</h3>
                                <p>
                                    O Carnaval BH 2026 foi desenvolvido para facilitar a organização e experiência dos foliões durante o carnaval de Belo Horizonte.
                                    Nosso objetivo é puramente informativo e de utilidade pública.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-foreground font-bold mb-2">2. Coleta de Dados</h3>
                                <p className="font-medium text-primary/80">
                                    Respeitamos sua privacidade. Não coletamos dados para fins comerciais.
                                </p>
                                <p className="mt-2">
                                    As informações de login e blocos favoritos são armazenadas para permitir a sincronização entre seus dispositivos e o compartilhamento de agendas com amigos.
                                    Nenhuma informação pessoal é vendida ou repassada a terceiros.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-foreground font-bold mb-2">3. Agendas Compartilhadas</h3>
                                <p>
                                    Ao criar uma agenda compartilhada, um link público é gerado. Qualquer pessoa com acesso a este link poderá visualizar a lista de blocos selecionada e o nome associado à conta.
                                    Apenas os blocos são visíveis; nenhuma outra informação pessoal é exposta.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-foreground font-bold mb-2">4. Responsabilidade</h3>
                                <p>
                                    As informações sobre os blocos (horários, locais) são baseadas em dados públicos e podem sofrer alterações pelas autoridades ou organizadores sem aviso prévio.
                                </p>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border/10 bg-muted/5">
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Entendi
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
