import { User, Settings, Bell, Shield, LogOut, Heart } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import ThemeToggle from '../components/ThemeToggle';
import useStore from '../store/useStore';

const ProfilePage = () => {
    const { favoriteBlocks, user } = useStore();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    const menuItems = [
        { icon: Bell, label: 'Notificações', value: 'Ativado' },
        { icon: Shield, label: 'Privacidade', value: null },
        { icon: Heart, label: 'Blocos Favoritos', value: `${favoriteBlocks?.length || 0}` },
    ];

    return (
        <div className="min-h-screen bg-background pb-40 text-foreground">
            <div className="max-w-md mx-auto bg-background min-h-screen px-6">
                {/* Header */}
                <header className="pt-16 pb-10">
                    <h1 className="text-2xl font-black italic tracking-tight text-foreground leading-none">
                        Perfil do <span className="text-brand-pink NOT-italic">Folião</span>
                    </h1>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground opacity-40 mt-1">
                        Preferências BH 2026
                    </p>
                </header>

                {/* User Info Card */}
                <div className="px-6 mb-8">
                    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.displayName || 'Folião 2026'}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email || 'Curta o carnaval com segurança!'}</p>
                        </div>
                    </div>
                </div>

                {/* Settings List */}
                <div className="px-6 space-y-6">
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2">
                            Aparência
                        </h3>
                        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-lg">
                                        <Settings className="w-5 h-5 text-secondary-foreground" />
                                    </div>
                                    <span className="font-medium">Tema Escuro</span>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2">
                            Configurações
                        </h3>
                        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                            {menuItems.map((item, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <item.icon className="w-5 h-5 text-secondary-foreground" />
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.value && (
                                        <span className="text-sm text-muted-foreground font-medium">{item.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="w-full py-4 mt-8 flex items-center justify-center gap-2 text-destructive font-bold hover:bg-destructive/10 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair da Conta
                        </button>
                    )}

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        Versão 1.0.0 • Carnaval BH No Bolso
                    </p>
                    <p className="text-center text-[10px] text-muted-foreground opacity-60 mt-1">
                        Desenvolvido por <a href="https://leoruas.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Leo Ruas</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
