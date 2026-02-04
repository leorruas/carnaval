import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';

import LoginModal from '../components/LoginModal';
import StickyHeader from '../components/StickyHeader';
import AgendaTitle from '../components/MyAgenda/AgendaTitle';
import FriendsList from '../components/MyAgenda/FriendsList';
import SharedAgendaError from '../components/MyAgenda/SharedAgendaError';
import AgendaMyView from '../components/MyAgenda/AgendaMyView';
import Loader from '../components/Loader';

import useStore from '../store/useStore';
import { useBlocks } from '../hooks/useBlocks';
import { useSharedAgenda } from '../hooks/useSharedAgenda';
import { useAgendaSelection } from '../hooks/useAgendaSelection';
import { useAgendaMatches } from '../hooks/useAgendaMatches';
import { useAgendaScroll } from '../hooks/useAgendaScroll';
import { useAgendaSharing } from '../hooks/useAgendaSharing';
import { useAgendaSocial } from '../hooks/useAgendaSocial';
import { useFriendsAgendas } from '../hooks/useFriendsAgendas';
import { generateAndDownloadICS } from '../utils/icsExport';

const MyAgenda = () => {
  const { blocks: allBlocks } = useBlocks();
  const { favoriteBlocks = [], toggleFavorite, friends = [], addFriend, removeFriend } = useStore() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = getAuth();
  const shareId = searchParams.get('shareId');
  const publicUid = searchParams.get('uid');
  // If we land on the page with a share ID, we want to start in friends view (preview mode)
  // BUT if we are navigating internally (handleViewFriend), we want to see the agenda ('mine' view, but loaded with friend's data)
  // The crucial distinction: handleViewFriend sets params AND sets view to 'mine'.
  // But if we just load the URL, we might want 'friends' view (preview)?
  // Actually, if I follow a link, I see the preview card. That is 'friends' view.
  // So: Default to 'friends' if params exist?
  // Problem: handleViewFriend adds params. If I add params, this state doesn't update (it's initial state).
  // BUT the useEffect WAS forcing it back.
  // So removing the useEffect is the main fix.
  // Initial state logic:
  const [activeView, setActiveView] = useState(() => {
    return (publicUid || shareId) ? 'friends' : 'mine';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const friendsList = Array.isArray(friends) ? friends : [];

  const { sharedData, setSharedData, isLoadingShared, sharedError } = useSharedAgenda(publicUid, shareId);
  const isSharedMode = !!sharedData;

  // New Hook: Fetch friends agendas for display
  const { friendsAgendas } = useFriendsAgendas(friendsList);

  const isAlreadyFollowing = useMemo(() => {
    if (!sharedData) return false;
    const targetId = publicUid || shareId;
    return friendsList.some(f => f.shareId === targetId || f.shareId === sharedData.id || f.shareId === sharedData.ownerId);
  }, [friendsList, sharedData, publicUid, shareId]);

  const { currentBlocks, navigationDates, selectedDate, setSelectedDate, displayBlocks, nextBlock, nextBlockTheme } = useAgendaSelection(allBlocks, sharedData, isSharedMode && activeView === 'mine', favoriteBlocks);
  const { matches, newBlocks } = useAgendaMatches(isSharedMode && activeView === 'mine', currentBlocks, favoriteBlocks);

  // Custom Hooks
  const { scrollY, headerHeight, headerPadding, logoScale } = useAgendaScroll();
  const { isSharing, shareSuccess, handleShare } = useAgendaSharing(auth, setIsLoginModalOpen);
  const { handleFollow, handleViewFriend } = useAgendaSocial(auth, friendsList, sharedData, addFriend, setActiveView, setSearchParams, setIsLoginModalOpen);

  const isTest = typeof window !== 'undefined' && window.__IS_TEST__;

  if (sharedError) return <SharedAgendaError error={sharedError} onBack={() => setSearchParams({})} />;
  if (isLoadingShared && !isTest) return <Loader />;

  const handleAddBlock = (block) => {
    if (!auth.currentUser) return setIsLoginModalOpen(true);
    toggleFavorite(block.id);
  };

  const handleAddAll = () => {
    if (!auth.currentUser) return setIsLoginModalOpen(true);
    const blocksToAdd = currentBlocks.filter(b => newBlocks.includes(b.id));
    blocksToAdd.forEach(b => toggleFavorite(b.id));
    alert(`${blocksToAdd.length} blocos adicionados!`);
  };

  const clearShare = () => {
    setSearchParams({});
    setSharedData(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
      <div className="max-w-md mx-auto relative px-6">
        <StickyHeader
          headerHeight={headerHeight} headerPadding={headerPadding} logoScale={logoScale}
          hideSearch={true} hideFilter={true}
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
          isSharedMode={isSharedMode} sharedData={sharedData} matches={matches} newBlocks={newBlocks}
          onAddAll={handleAddAll} onFollow={handleFollow} isAlreadyFollowing={isAlreadyFollowing}
          activeView={activeView} setActiveView={setActiveView} friendsCount={friendsList.length}
        />

        {activeView === 'mine' ? (
          <AgendaMyView
            navigationDates={navigationDates} selectedDate={selectedDate} onDateSelect={setSelectedDate}
            isSharedMode={isSharedMode} nextBlock={nextBlock} nextBlockTheme={nextBlockTheme}
            onShare={handleShare} onExport={() => generateAndDownloadICS(currentBlocks)}
            isSharing={isSharing} shareSuccess={shareSuccess} currentBlocks={currentBlocks}
            displayBlocks={displayBlocks} matches={matches} newBlocks={newBlocks} onAddBlock={handleAddBlock}
            friendsAgendas={friendsAgendas}
          />
        ) : (
          <FriendsList
            friendsList={friendsList} onViewFriend={handleViewFriend} onRemoveFriend={removeFriend}
            previewFriend={sharedData} onFollow={handleFollow} isAlreadyFollowing={isAlreadyFollowing}
          />
        )}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    </div>
  );
};

export default MyAgenda;
