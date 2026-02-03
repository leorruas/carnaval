import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Clock, Share2, Download, User, ArrowLeft, Calendar, X } from 'lucide-react';
import { getAuth } from 'firebase/auth';

import BlockCard from '../components/BlockCard';
import BrandLogo from '../components/BrandLogo';
import LoginModal from '../components/LoginModal';
import StickyHeader from '../components/StickyHeader';

import blocosData from '../data/blocos.json';
import useStore from '../store/useStore';
import { sortBlocksByDateTime, formatDate, groupBlocksByDate } from '../utils/dateUtils';

const allBlocks = Array.isArray(blocosData) ? blocosData : (blocosData?.default || []);
import { getDateTheme } from '../utils/themeUtils';
import { createShareLink, getSharedAgenda, getPublicAgenda } from '../services/shareService';

const MyAgenda = () => {
  const { favoriteBlocks = [], toggleFavorite, friends = [], addFriend, removeFriend } = useStore() || {};

  // Ensure we always have arrays to avoid crashes during tests/incomplete state
  const blocksList = Array.isArray(favoriteBlocks) ? favoriteBlocks : [];
  const friendsList = Array.isArray(friends) ? friends : [];
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = getAuth();
  const [activeView, setActiveView] = useState('mine'); // 'mine' or 'friends'

  // State
  const shareId = searchParams.get('shareId');
  const publicUid = searchParams.get('uid');

  const [sharedData, setSharedData] = useState(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Animation / Scroll - Match Home.jsx EXACTLY + CLAMP
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });

  // --- Shared Mode Logic (Legacy shareId OR New uid) ---
  useEffect(() => {
    const fetchShared = async () => {
      // Priority 1: Live Link (uid)
      if (publicUid) {
        setIsLoadingShared(true);
        try {
          const data = await getPublicAgenda(publicUid);
          if (data) {
            const hydratedBlocks = allBlocks.filter(b => data.blocks.includes(b.id));
            setSharedData({ ...data, blocks: hydratedBlocks, isLive: true });
          }
        } catch (error) {
          console.error("Failed to load public agenda", error);
        } finally {
          setIsLoadingShared(false);
        }
        return;
      }

      // Priority 2: Legacy Snapshot (shareId)
      if (shareId) {
        setIsLoadingShared(true);
        try {
          const data = await getSharedAgenda(shareId);
          if (data) {
            const hydratedBlocks = allBlocks.filter(b => data.blocks.includes(b.id));
            setSharedData({ ...data, blocks: hydratedBlocks, isLive: false });
          }
        } catch (error) {
          console.error("Failed to load shared agenda", error);
        } finally {
          setIsLoadingShared(false);
        }
      }
    };

    if (publicUid || shareId) {
      fetchShared();
    }
  }, [shareId, publicUid]);

  const isSharedMode = !!sharedData;

  const currentBlocks = useMemo(() => {
    if (isSharedMode && sharedData) return sortBlocksByDateTime(sharedData.blocks);
    const favoriteIds = blocksList.map(f => f.id);
    const blocks = allBlocks.filter(b => favoriteIds.includes(b.id));
    return sortBlocksByDateTime(blocks);
  }, [isSharedMode, sharedData, blocksList]);

  const navigationDates = useMemo(() => {
    const groups = groupBlocksByDate(currentBlocks);
    return Object.keys(groups).sort();
  }, [currentBlocks]);

  const { matches, newBlocks } = useMemo(() => {
    if (!isSharedMode) return { matches: [], newBlocks: [] };

    // Use Set for O(1) lookup performance
    const myIds = new Set(blocksList.map(b => b.id));
    const matchIds = [];
    const newIds = [];

    currentBlocks.forEach(b => {
      if (myIds.has(b.id)) matchIds.push(b.id);
      else newIds.push(b.id);
    });

    return { matches: matchIds, newBlocks: newIds };
  }, [isSharedMode, currentBlocks, favoriteBlocks]);

  useEffect(() => {
    if (!selectedDate || !navigationDates.includes(selectedDate)) {
      if (navigationDates.length > 0) {
        setSelectedDate(navigationDates[0]);
      } else {
        setSelectedDate(null);
      }
    }
  }, [navigationDates, selectedDate]);

  const displayBlocks = useMemo(() => {
    if (!selectedDate) return [];
    return currentBlocks.filter(b => b.data === selectedDate);
  }, [currentBlocks, selectedDate]);

  const nextBlock = useMemo(() => {
    if (isSharedMode) return null;
    const now = new Date();
    return currentBlocks.find(block => {
      const blockDate = new Date(`${block.data}T${block.horario || '00:00'}`);
      return blockDate > now;
    });
  }, [currentBlocks, isSharedMode]);

  const nextBlockTheme = nextBlock ? getDateTheme(nextBlock.data) : null;

  // --- Actions ---
  const handleShare = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Validate we have blocks to share
    if (blocksList.length === 0) {
      alert('Você precisa ter blocos na sua agenda para compartilhar!');
      return;
    }

    // Direct Live Link Sharing
    const liveLink = `${window.location.origin}/agenda?uid=${user.uid}`;

    try {
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
    setActiveView('mine'); // Switch to agenda view
  };

  if (currentBlocks.length === 0 && !isLoadingShared) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground pb-20">
        <div className="max-w-md mx-auto px-6 pt-20 text-center">
          <h2 className="text-2xl font-black mb-4 font-bricolage">Agenda Vazia</h2>
          <a href="/" className="text-primary font-bold hover:underline">Explorar Blocos</a>
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
      <div className="max-w-md mx-auto relative px-6">

        {/* Standardized Header */}
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

        {/* Title Section */}
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
                    <button onClick={handleAddAll} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                      Adicionar {newBlocks.length} novos
                    </button>
                  )}
                </div>
              </div>
              {!isAlreadyFollowing && (
                <button
                  onClick={handleFollow}
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
                  Amigos ({friendsList.length})
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content Switcher */}
        {activeView === 'mine' || isSharedMode ? (
          <>
            {/* Sticky Day Selector */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pb-4 pt-4 -mx-6 px-6 mb-6">
              <div className="flex justify-start gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth">
                {(navigationDates || []).map(date => {
                  const isSelected = selectedDate === date;
                  const theme = getDateTheme(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all border shrink-0 font-bricolage ${isSelected
                        ? `text-white scale-105`
                        : `bg-muted/20 hover:bg-primary/10 hover:text-primary border-transparent`
                        }`}
                      style={isSelected ? { backgroundColor: theme.color, borderColor: theme.color } : {}}
                    >
                      <span className="text-sm font-black">{date.split('-')[2]}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">{new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Next Block */}
            {!isSharedMode && nextBlock && nextBlockTheme && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
                style={{ backgroundColor: nextBlockTheme.color }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3 text-white/80">
                    <span className="text-xs font-black uppercase tracking-widest">Próximo Bloco</span>
                  </div>
                  <h3 className="text-2xl font-black mb-1">{nextBlock.nome}</h3>
                  <p className="text-white/90 text-sm">{formatDate(nextBlock.data)} às {nextBlock.horario}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </motion.div>
            )}

            {/* Actions Row */}
            {!isSharedMode && (
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 py-4 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className={`w-4 h-4 ${isSharing ? 'animate-spin' : ''}`} />
                  {isSharing ? 'Gerando...' : 'Compartilhar'}
                </button>
                <button onClick={handleExport} className="flex-1 py-4 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" /> Colocar na minha agenda
                </button>
              </div>
            )}

            {/* Blocks List */}
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
          </>
        ) : (
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
                        onClick={() => handleViewFriend(friend.shareId)}
                        className="p-3 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFriend(friend.shareId)}
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
        )}

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    </div>
  );
};

export default MyAgenda;
