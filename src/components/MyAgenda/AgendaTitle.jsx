import { motion } from 'framer-motion';

const AgendaTitle = ({ isSharedMode, sharedData, matches, newBlocks, onAddAll, onFollow, isAlreadyFollowing, activeView, setActiveView, friendsCount }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {isSharedMode ? (
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tight leading-none">
                            Agenda de <span className="text-primary NOT-italic">{sharedData.ownerName}</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {matches.length} em comum
                            </span>
                            {newBlocks.length > 0 && (
                                <button onClick={onAddAll} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                                    Adicionar {newBlocks.length} novos
                                </button>
                            )}
                        </div>
                    </div>
                    {!isAlreadyFollowing && (
                        <button
                            onClick={onFollow}
                            className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                        >
                            Seguir
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6 font-bricolage">
                    <h1 className="text-2xl font-black italic tracking-tight leading-none">
                        Minha<span className="text-primary NOT-italic"> Agenda</span>
                    </h1>

                    {/* View Tabs */}
                    <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveView('mine')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'mine' ? 'bg-background text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Meus Blocos
                        </button>
                        <button
                            onClick={() => setActiveView('friends')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'friends' ? 'bg-background text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Amigos ({friendsCount})
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AgendaTitle;
