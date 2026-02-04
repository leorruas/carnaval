import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Heart, Plus, Bell, Shield, Settings } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import ThemeToggle from '../components/ThemeToggle';
import useStore from '../store/useStore';
import LoginModal from '../components/LoginModal';
import SuggestBlockModal from '../components/SuggestBlockModal';
import AdminPanel from '../components/AdminPanel';

const ProfilePage = () => {
    const { user, favoriteBlocks } = useStore();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    const isAdmin = user?.email === 'leoruas@gmail.com';

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-40 text-foreground transition-colors duration-500">
            <div className="max-w-md mx-auto min-h-screen px-6">
                {/* Header */}
                <header className="pt-16 pb-10">
                    <h1 className="text-2xl font-black italic tracking-tight text-foreground leading-none">
                        Perfil do <span className="text-primary NOT-italic">Folião</span>
                    </h1>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground opacity-40 mt-1">
                        Preferências BH 2026
                    </p>
                </header>

                {user ? (
                    <div className="space-y-6">
                        {/* User Info Card */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-bricolage">{user.displayName || 'Folião 2026'}</h2>
                                <p className="text-xs text-muted-foreground">{user.email || 'Curta o carnaval com segurança!'}</p>
                            </div>
                        </div>

                        {/* Theme Toggle Section */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Settings className="w-5 h-5 text-secondary-foreground" />
                                </div>
                                <span className="font-medium text-sm">Tema App</span>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* Suggestion Box */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Plus className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black italic mb-2">Sentiu falta de algo?</h3>
                                <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">Sugira um bloco para ser adicionado ao calendário oficial.</p>
                                <button
                                    onClick={() => setIsSuggestModalOpen(true)}
                                    className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Sugerir Bloco
                                </button>
                            </div>
                        </div>

                        {/* Admin Button */}
                        {isAdmin && (
                            <button
                                onClick={() => setIsAdminPanelOpen(true)}
                                className="w-full py-4 bg-foreground text-background font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 rounded-2xl transition-opacity"
                            >
                                <Shield className="w-4 h-4" />
                                Painel Admin
                            </button>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-4 text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500/5 rounded-2xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair da conta
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Unauthenticated State */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                <User className="w-8 h-8 opacity-40" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-2 font-bricolage">Crie sua conta</h3>
                                <p className="text-muted-foreground text-xs px-4">Salve seus favoritos e sincronize entre dispositivos.</p>
                            </div>
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                            >
                                Entrar / Cadastrar
                            </button>
                        </div>

                        {/* Theme Toggle Section */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Settings className="w-5 h-5 text-secondary-foreground" />
                                </div>
                                <span className="font-medium text-sm">Tema App</span>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* Suggestion Box (Unauthenticated) */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 text-center">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-70">Bloco faltando?</h3>
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
                            >
                                Faça login para sugerir
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mt-12 py-4 space-y-1">
                    <p className="text-[10px] text-muted-foreground opacity-40">Carnaval BH 2026 • v1.1</p>
                    <p className="text-[10px] text-muted-foreground opacity-60">
                        Desenvolvido por <a href="https://leoruas.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Leo Ruas</a>
                    </p>
                </div>

                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
                <SuggestBlockModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
                <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} user={user} />
            </div>
        </div>
    );
};

export default ProfilePage;
