import { User, Calendar, X } from 'lucide-react';

const FriendsList = ({ friendsList, onViewFriend, onRemoveFriend, previewFriend, onFollow, isAlreadyFollowing }) => {
    return (
        <div className="space-y-4">
            {/* Preview Card (New Friend) */}
            {previewFriend && !isAlreadyFollowing && (
                <div className="mb-6 border-b border-border/10 pb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Novo Amigo Encontrado</h3>
                    <div className="flex flex-col items-center p-6 bg-primary/10 border border-primary/20 rounded-[2rem] text-center">
                        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center font-black text-3xl mb-4 shadow-xl shadow-primary/20">
                            {previewFriend.ownerName?.[0] || 'A'}
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight mb-2">{previewFriend.ownerName}</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">
                            Agenda Compartilhada
                        </p>

                        <button
                            onClick={onFollow}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            Seguir e Ver Agenda
                        </button>
                    </div>
                </div>
            )}

            {friendsList.length === 0 && (!previewFriend || isAlreadyFollowing) ? (
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
                                    onClick={() => onViewFriend(friend)}
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
