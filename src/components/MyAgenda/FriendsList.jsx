import { User, Calendar, X } from 'lucide-react';

const FriendsList = ({ friendsList, onViewFriend, onRemoveFriend }) => {
    return (
        <div className="space-y-4">
            {friendsList.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-muted/10 rounded-[2.5rem] border border-dashed border-border/40">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 opacity-20" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Nenhum amigo ainda</h3>
                        <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">Peça o link da agenda para seus amigos e clique em "Seguir" para vê-los aqui.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {friendsList.map(friend => (
                        <div key={friend.shareId} className="flex items-center justify-between p-6 bg-card border border-border/40 rounded-[2rem] group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-black text-primary text-lg">
                                    {friend.name?.[0] || 'F'}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-tight">{friend.name}</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Seguindo desde {new Date(friend.addedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onViewFriend(friend.shareId)}
                                    className="p-3 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRemoveFriend(friend.shareId)}
                                    className="p-3 bg-muted/50 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsList;
