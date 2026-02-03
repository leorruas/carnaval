import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import BlockCard from '../components/BlockCard';
import LoginModal from '../components/LoginModal';
import StickyHeader from '../components/StickyHeader';
import AgendaTitle from '../components/MyAgenda/AgendaTitle';
import AgendaDateSelector from '../components/MyAgenda/AgendaDateSelector';
import NextBlockCard from '../components/MyAgenda/NextBlockCard';
import AgendaActions from '../components/MyAgenda/AgendaActions';
import FriendsList from '../components/MyAgenda/FriendsList';
import SharedAgendaError from '../components/MyAgenda/SharedAgendaError';
import { generateAndDownloadICS } from '../utils/icsExport';
import Loader from '../components/Loader';
import useStore from '../store/useStore';
import { useBlocks } from '../hooks/useBlocks';
import { useSharedAgenda } from '../hooks/useSharedAgenda';
import { useAgendaSelection } from '../hooks/useAgendaSelection';
import { useAgendaMatches } from '../hooks/useAgendaMatches';
const MyAgenda = () => {
  const { blocks: allBlocks } = useBlocks();
  const { favoriteBlocks = [], toggleFavorite, friends = [], addFriend, removeFriend, syncNow } = useStore() || {};
  const friendsList = Array.isArray(friends) ? friends : [];
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = getAuth();
  const [activeView, setActiveView] = useState('mine');
  const shareId = searchParams.get('shareId');
  const publicUid = searchParams.get('uid');
  const { sharedData, setSharedData, isLoadingShared, sharedError } = useSharedAgenda(publicUid, shareId);
  const isSharedMode = !!sharedData;
  useEffect(() => {
    if (publicUid || shareId) {
      setActiveView('friends');
    }
  }, [publicUid, shareId]);
  const isAlreadyFollowing = useMemo(() => {
    if (!sharedData) return false;
    const targetId = publicUid || shareId;
    return friendsList.some(f => f.shareId === targetId || f.shareId === sharedData.id || f.shareId === sharedData.ownerId);
  }, [friendsList, sharedData, publicUid, shareId]);
  const { currentBlocks, navigationDates, selectedDate, setSelectedDate, displayBlocks, nextBlock, nextBlockTheme } = useAgendaSelection(allBlocks, sharedData, isSharedMode && activeView === 'mine', favoriteBlocks);
  const { matches, newBlocks } = useAgendaMatches(isSharedMode && activeView === 'mine', currentBlocks, favoriteBlocks);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const isTest = typeof window !== 'undefined' && window.__IS_TEST__;
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });
  if (sharedError) {
    return <SharedAgendaError error={sharedError} onBack={() => setSearchParams({})} />;
  }
  if (isLoadingShared && !isTest) return <Loader />;
  const handleShare = async () => {
    // ... (keep handleShare logic which has auth check)
    const user = auth.currentUser;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    const liveLink = `${window.location.origin}/agenda?uid=${user.uid}`;
    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share({
          title: `Agenda de ${user.displayName || 'Amigo'} - Carnaval BH`,
          url: liveLink,
        });
      } else {
        await navigator.clipboard.writeText(liveLink);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing live link:', error);
      alert('Erro ao sincronizar dados. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };
  const handleExport = () => {
    generateAndDownloadICS(currentBlocks);
  };
  const handleAddBlock = (block) => {
    if (!auth.currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    toggleFavorite(block.id);
  };
  const handleAddAll = () => {
    if (!auth.currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const blocksToAdd = currentBlocks.filter(b => newBlocks.includes(b.id));
    blocksToAdd.forEach(b => toggleFavorite(b.id));
    alert(`${blocksToAdd.length} blocos adicionados!`);
  };
  const clearShare = () => {
    setSearchParams({});
    setSharedData(null);
  };
  const handleFollow = () => {
    if (!auth.currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    addFriend({
      shareId: sharedData.id,
      name: sharedData.ownerName,
      isLive: sharedData.isLive,
      addedAt: new Date().toISOString()
    });
    // Immediately switch to agenda view
    setActiveView('mine');
  };
  const handleViewFriend = (friend) => {
    if (friend.isLive) {
      setSearchParams({ uid: friend.shareId });
    } else {
      setSearchParams({ shareId: friend.shareId });
    }
    setActiveView('mine');
  };
  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
      <div className="max-w-md mx-auto relative px-6">
        <StickyHeader
          headerHeight={headerHeight}
          headerPadding={headerPadding}
          logoScale={logoScale}
          hideSearch={true}
          hideFilter={true}
          customTitle={isSharedMode ? (
            <button onClick={clearShare} className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors origin-left">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Voltar</span>
            </button>
          ) : undefined}
          endExtras={
            <button onClick={() => !auth.currentUser && setIsLoginModalOpen(true)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
              {auth.currentUser ? (
                <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
                  {auth.currentUser.displayName?.[0] || 'U'}
                </div>
              ) : <User className="w-4 h-4 opacity-50" />}
            </button>
          }
        />
        <AgendaTitle
          isSharedMode={isSharedMode}
          sharedData={sharedData}
          matches={matches}
          newBlocks={newBlocks}
          onAddAll={handleAddAll}
          onFollow={handleFollow}
          isAlreadyFollowing={isAlreadyFollowing}
          activeView={activeView}
          setActiveView={setActiveView}
          friendsCount={friendsList.length}
        />
        {activeView === 'mine' ? (
          <>
            <AgendaDateSelector
              navigationDates={navigationDates}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            {!isSharedMode && (
              <NextBlockCard nextBlock={nextBlock} nextBlockTheme={nextBlockTheme} />
            )}
            {!isSharedMode && (
              <AgendaActions
                onShare={handleShare}
                onExport={handleExport}
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
                        onAdd={isSharedMode && newBlocks.includes(block.id) ? handleAddBlock : undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        ) : (
          <FriendsList
            friendsList={friendsList}
            onViewFriend={handleViewFriend}
            onRemoveFriend={removeFriend}
            previewFriend={sharedData} // Pass sharedData as preview
            onFollow={handleFollow}
            isAlreadyFollowing={isAlreadyFollowing}
          />
        )}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    </div>
  );
};
export default MyAgenda;
