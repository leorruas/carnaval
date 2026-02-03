import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import TermsModal from './TermsModal';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only for registration
    const [error, setError] = useState(null);

    const auth = getAuth();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                // ignore
            } else {
                setError('Erro ao conectar com Google.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Set Display Name
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('E-mail ou senha incorretos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está em uso.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && !showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border/20 overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-card z-0" />
                            <div className="relative z-10 p-8">
                                <button
                                    onClick={onClose}
                                    className="absolute right-6 top-6 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 opacity-60" />
                                </button>

                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {isRegistering ? (
                                            <UserPlus className="w-8 h-8 text-primary" />
                                        ) : (
                                            <LogIn className="w-8 h-8 text-primary" />
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-black italic tracking-tight">
                                        {isRegistering ? 'Criar Conta' : 'Fazer Login'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {isRegistering
                                            ? 'Salve seus blocos e compartilhe com amigos!'
                                            : 'Bem-vindo de volta, folião!'}
                                    </p>
                                </div>

                                {/* Google Login Button */}
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6 shadow-sm"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    <span>Continuar com Google</span>
                                </button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Ou com email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {isRegistering && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-3">Nome</label>
                                            <input
                                                type="text"
                                                placeholder="Seu nome ou apelido"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-3">E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="exemplo@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-3">Senha</label>
                                        <input
                                            type="password"
                                            placeholder="********"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Aguarde...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                                    </button>
                                </form>

                                <div className="mt-6 text-center space-y-4">
                                    <button
                                        onClick={() => {
                                            setIsRegistering(!isRegistering);
                                            setError(null);
                                        }}
                                        className="text-xs text-muted-foreground uppercase tracking-widest font-bold hover:text-primary transition-colors"
                                    >
                                        {isRegistering
                                            ? 'Já tem uma conta? Faça Login'
                                            : 'Não tem conta? Cadastre-se'}
                                    </button>

                                    <div className="pt-4 border-t border-border/10">
                                        <button
                                            onClick={() => setShowTerms(true)}
                                            className="text-[10px] text-muted-foreground underline opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            Política de Privacidade e Termos de Uso
                                            <br />
                                            <span className="no-underline text-[9px] block mt-1">
                                                Não coletamos dados para fins comerciais.
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </>
    );
};

export default LoginModal;
