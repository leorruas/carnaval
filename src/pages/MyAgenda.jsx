import { useState, useMemo } from 'react';
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

  // State
  const shareId = searchParams.get('shareId');
  const publicUid = searchParams.get('uid');

  const { sharedData, setSharedData } = useSharedAgenda(publicUid, shareId);
  const isSharedMode = !!sharedData;

  const { currentBlocks, navigationDates, selectedDate, setSelectedDate, displayBlocks, nextBlock, nextBlockTheme } = useAgendaSelection(allBlocks, sharedData, isSharedMode, favoriteBlocks);
  const { matches, newBlocks } = useAgendaMatches(isSharedMode, currentBlocks, favoriteBlocks);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Animation / Scroll
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });

  // --- Actions ---
  const handleShare = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    const liveLink = `${window.location.origin}/agenda?uid=${user.uid}`;
    try {
      setIsSharing(true);
      if (syncNow) await syncNow();
      if (navigator.share) {
        await navigator.share({
          title: `Agenda de ${user.displayName || 'Amigo'} - Carnaval BH`,
          url: liveLink,
        });
      } else {
        await navigator.clipboard.writeText(liveLink);
        alert(`Link permanente copiado!\n\n${liveLink}`);
      }
    } catch (error) {
      console.error('Error sharing live link:', error);
      alert('Erro ao sincronizar dados. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = () => {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Carnaval BH 2026//PT\n';
    currentBlocks.forEach(block => {
      const [year, month, day] = block.data.split('-');
      const [hours, minutes] = (block.horario || '00:00').split(':');
      const startDate = `${year}${month}${day}T${hours}${minutes}00`;
      ical += 'BEGIN:VEVENT\n';
      ical += `DTSTART:${startDate}\n`;
      ical += `SUMMARY:${block.nome}\n`;
      ical += `LOCATION:${block.endereco}\n`;
      ical += 'END:VEVENT\n';
    });
    ical += 'END:VCALENDAR';
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carnaval-bh.ics';
    a.click();
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

  const isAlreadyFollowing = useMemo(() => {
    if (!shareId) return false;
    return friendsList.some(f => f.shareId === shareId);
  }, [friendsList, shareId]);

  const handleFollow = () => {
    if (!auth.currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    addFriend({
      shareId,
      name: sharedData.ownerName,
      addedAt: new Date().toISOString()
    });
    setActiveView('friends');
  };

  const handleViewFriend = (friendShareId) => {
    setSearchParams({ shareId: friendShareId });
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

        {activeView === 'mine' || isSharedMode ? (
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
          />
        )}

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    </div>
  );
};

export default MyAgenda;
