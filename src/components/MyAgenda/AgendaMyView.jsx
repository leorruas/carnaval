import { motion, AnimatePresence } from 'framer-motion';
import AgendaDateSelector from './AgendaDateSelector';
import NextBlockCard from './NextBlockCard';
import AgendaActions from './AgendaActions';
import BlockCard from '../BlockCard';

const AgendaMyView = ({
    navigationDates,
    selectedDate,
    onDateSelect,
    isSharedMode,
    nextBlock,
    nextBlockTheme,
    onShare,
    onShareStory,
    onExport,
    isSharing,
    shareSuccess,
    currentBlocks,
    displayBlocks,
    matches,
    newBlocks,
    onAddBlock,
    friendsAgendas
}) => {
    return (
        <>
            <AgendaDateSelector
                navigationDates={navigationDates}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
            />

            {!isSharedMode && (
                <NextBlockCard nextBlock={nextBlock} nextBlockTheme={nextBlockTheme} />
            )}

            {!isSharedMode && (
                <AgendaActions
                    onShare={onShare}
                    onShareStory={onShareStory}
                    onExport={onExport}
                    isSharing={isSharing}
                    shareSuccess={shareSuccess}
                    hasBlocks={currentBlocks.length > 0}
                />
            )}

            {currentBlocks.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <h2 className="text-2xl font-black mb-4 font-bricolage">Agenda Vazia</h2>
                    <a href="/" className="text-primary font-bold hover:underline">Explorar Blocos</a>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {(displayBlocks || []).map((block) => (
                            <motion.div key={block.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                <BlockCard
                                    block={block}
                                    matchBadge={isSharedMode && matches.includes(block.id)}
                                    onAdd={isSharedMode && newBlocks.includes(block.id) ? onAddBlock : undefined}
                                    friendsAgendas={friendsAgendas}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
};

export default AgendaMyView;
