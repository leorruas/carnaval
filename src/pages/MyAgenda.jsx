import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Share2, Download, User, ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';

import BlockCard from '../components/BlockCard';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import LoginModal from '../components/LoginModal';

import blocosData from '../data/blocos.json';
import useStore from '../store/useStore';
import { sortBlocksByDateTime, formatDate, groupBlocksByDate } from '../utils/dateUtils';
import { getDateTheme, BRAND_COLORS } from '../utils/themeUtils';
import { createShareLink, getSharedAgenda } from '../services/shareService';

const MyAgenda = () => {
  const { favoriteBlocks, toggleFavorite } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = getAuth();

  // State
  const shareId = searchParams.get('shareId');
  const [sharedData, setSharedData] = useState(null); // { ownerName, blocks: [] }
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Animation / Scroll
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100]);
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8]);

  // --- Shared Mode Logic ---

  // Fetch shared agenda if ID is present
  useEffect(() => {
    if (shareId) {
      const fetchShared = async () => {
        setIsLoadingShared(true);
        try {
          const data = await getSharedAgenda(shareId);
          if (data) {
            // Hydrate blocks from IDs
            const hydratedBlocks = blocosData.filter(b => data.blocks.includes(b.id));
            setSharedData({ ...data, blocks: hydratedBlocks });
          }
        } catch (error) {
          console.error("Failed to load shared agenda", error);
        } finally {
          setIsLoadingShared(false);
        }
      };
      fetchShared();
    }
  }, [shareId]);

  const isSharedMode = !!sharedData;

  // Determine which blocks to show (My Favorites OR Shared Blocks)
  const currentBlocks = useMemo(() => {
    if (isSharedMode) return sortBlocksByDateTime(sharedData.blocks);

    // Default: My Favorites
    const favoriteIds = favoriteBlocks.map(f => f.id);
    const blocks = blocosData.filter(b => favoriteIds.includes(b.id));
    return sortBlocksByDateTime(blocks);
  }, [isSharedMode, sharedData, favoriteBlocks]);

  // --- Derived Data (Dates, Matches) ---

  const navigationDates = useMemo(() => {
    const groups = groupBlocksByDate(currentBlocks);
    return Object.keys(groups).sort();
  }, [currentBlocks]);

  // Match Logic (Shared Mode Only)
  const { matches, newBlocks } = useMemo(() => {
    if (!isSharedMode) return { matches: [], newBlocks: [] };

    const myIds = new Set(favoriteBlocks.map(b => b.id));
    const matchIds = [];
    const newIds = [];

    currentBlocks.forEach(b => {
      if (myIds.has(b.id)) matchIds.push(b.id);
      else newIds.push(b.id);
    });

    return { matches: matchIds, newBlocks: newIds };
  }, [isSharedMode, currentBlocks, favoriteBlocks]);

  // Auto-select date
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
    if (isSharedMode) return null; // Don't show countdown in shared mode
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

    try {
      const blockIds = favoriteBlocks.map(b => b.id);
      const id = await createShareLink(user.uid, user.displayName || 'Folião', blockIds);

      const shareUrl = `${window.location.origin}/agenda?shareId=${id}`;

      if (navigator.share) {
        await navigator.share({
          title: `Agenda de ${user.displayName || 'Amigo'} - Carnaval BH`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado!');
      }
    } catch (error) {
      alert('Erro ao criar link de compartilhamento.');
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
    const user = auth.currentUser;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    toggleFavorite(block.id);
  };

  const handleAddAll = () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    // Add all new blocks
    const blocksToAdd = currentBlocks.filter(b => newBlocks.includes(b.id));
    blocksToAdd.forEach(b => toggleFavorite(b.id));
    alert(`${blocksToAdd.length} blocos adicionados!`);
  };

  const clearShare = () => {
    setSearchParams({});
    setSharedData(null);
  };

  // --- Render ---

  if (currentBlocks.length === 0 && !isLoadingShared) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground pb-20">
        <div className="max-w-md mx-auto px-6 pt-20 text-center">
          <h2 className="text-2xl font-black mb-4">Agenda Vazia</h2>
          <a href="/" className="text-primary font-bold hover:underline">Explorar Blocos</a>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
      <div className="max-w-md mx-auto relative px-6">

        {/* Sticky Header (Matching Home) */}
        <motion.header
          style={{ height: headerHeight, paddingTop: headerPadding }}
          className="relative left-0 right-0 z-20 px-6 max-w-md mx-auto flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2">
            <motion.div style={{ scale: logoScale }} className="origin-left">
              {isSharedMode ? (
                <button onClick={clearShare} className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Voltar</span>
                </button>
              ) : (
                <BrandLogo className="h-16 w-auto text-foreground" />
              )}
            </motion.div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* Login / Avatar Indicator */}
              <button onClick={() => !auth.currentUser && setIsLoginModalOpen(true)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
                {auth.currentUser ? (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
                    {auth.currentUser.displayName?.[0] || 'U'}
                  </div>
                ) : <User className="w-4 h-4 opacity-50" />}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSharedMode ? (
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
            ) : (
              <h1 className="text-2xl font-black italic tracking-tight leading-none">
                Minha<span className="text-primary NOT-italic"> Agenda</span>
              </h1>
            )}
          </motion.div>
        </motion.header>

        {/* Sticky Day Selector */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pb-4 pt-4 -mx-6 px-6 mb-6">
          <div className="relative group/scroll">
            {/* Simplified Scroll Buttons (using css logic from Home) */}
            <div
              id="date-scroll-agenda"
              className="flex justify-start gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth"
            >
              {navigationDates.map(date => {
                const isSelected = selectedDate === date;
                const theme = getDateTheme(date);
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all border shrink-0 ${isSelected
                      ? `text-white shadow-lg scale-105`
                      : `bg-muted/20 hover:bg-primary/10 hover:text-primary border-transparent`
                      }`}
                    style={isSelected ? { backgroundColor: theme.color, borderColor: theme.color } : {}}
                  >
                    <span className="text-sm font-black">{date.split('-')[2]}</span>
                    <span className="text-[8px] font-black uppercase">{new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Next Block (My Agenda Only) */}
        {!isSharedMode && nextBlock && nextBlockTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-8 text-white shadow-xl relative overflow-hidden"
            style={{ backgroundColor: nextBlockTheme.color }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Próximo Bloco</span>
              </div>
              <h3 className="text-2xl font-black mb-1">{nextBlock.nome}</h3>
              <p className="text-white/90 text-sm">{formatDate(nextBlock.data)} às {nextBlock.horario}</p>
            </div>
            {/* Decorative Circle */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </motion.div>
        )}

        {/* Actions Row (My Agenda Only) */}
        {!isSharedMode && (
          <div className="flex gap-3 mb-8">
            <button onClick={handleShare} className="flex-1 py-4 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            <button onClick={handleExport} className="flex-1 py-4 rounded-2xl bg-muted/30 hover:bg-muted transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4" /> Exportar .ICS
            </button>
          </div>
        )}

        {/* Blocks List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {displayBlocks.map((block) => (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <BlockCard
                  block={block}
                  matchBadge={isSharedMode && matches.includes(block.id)}
                  onAdd={isSharedMode && newBlocks.includes(block.id) ? handleAddBlock : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            setIsLoginModalOpen(false);
            // If in shared mode and trying to add, we could retry automatically or just let them click again
          }}
        />
      </div>
    </div>
  );
};

export default MyAgenda;
