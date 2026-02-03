import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Filter, Heart, Search, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BlockCard from '../components/BlockCard';
import blocosData from '../data/blocos.json';
import { groupBlocksByDate, sortBlocksByDateTime } from '../utils/dateUtils';
import { getDateTheme } from '../utils/themeUtils';
import useStore from '../store/useStore';
import PillToggle from '../components/PillToggle';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import StickyHeader from '../components/StickyHeader';

const Home = () => {
  const { favoriteBlocks } = useStore();
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scrollRef = useRef(null);

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });
  const isCompact = useRef(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      isCompact.current = latest > 50;
    });
  }, [scrollY]);

  const navOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Calendário', value: 'calendar' },
    { label: 'Favoritos', value: 'favorites' }
  ];

  // Base filtering (Search + Tab Type)
  const baseBlocks = useMemo(() => {
    let result = blocosData;
    const now = new Date();

    if (activeTab === 'favorites') {
      // Use Set for O(1) lookup instead of O(n) with includes
      const favoriteIds = new Set(favoriteBlocks.map(f => f.id));
      result = result.filter(b => favoriteIds.has(b.id));
    } else if (activeTab === 'today') {
      const futureBlocks = result.filter(b => new Date(`${b.data}T${b.horario || '00:00'}`) >= now);
      const nextDate = sortBlocksByDateTime(futureBlocks)[0]?.data;
      result = result.filter(b => b.data === nextDate);
    } else {
      // Calendar mode: just filter out past days globally if desired
      // Or keep all future days
      result = result.filter(b => {
        const blockDate = new Date(`${b.data}T23:59:59`);
        return blockDate >= now;
      });
    }

    if (searchQuery) {
      result = result.filter(b =>
        b.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.endereco.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [activeTab, favoriteBlocks, searchQuery]);

  // Independent dates for the navigation
  const navigationDates = useMemo(() => {
    const now = new Date();
    let sourceBlocks = blocosData;

    // If in favorites tab, valid dates come only from favorites
    if (activeTab === 'favorites') {
      // Use Set for O(1) lookup
      const favoriteIds = new Set(favoriteBlocks.map(f => f.id));
      sourceBlocks = blocosData.filter(b => favoriteIds.has(b.id));
    }

    // Filter only future blocks for general calendar navigation
    const futureBlocks = sourceBlocks.filter(b => {
      const blockDate = new Date(`${b.data}T23:59:59`);
      return blockDate >= now;
    });
    const groups = groupBlocksByDate(futureBlocks);
    return Object.keys(groups).sort();
  }, [activeTab, favoriteBlocks]); // Added dependencies

  const [selectedDate, setSelectedDate] = useState(null);

  // Auto-select first date when switching tabs or if current selection is invalid
  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'favorites') {
      if (!selectedDate || !navigationDates.includes(selectedDate)) {
        if (navigationDates.length > 0) {
          setSelectedDate(navigationDates[0]);
        }
      }
    }
  }, [activeTab, navigationDates, selectedDate]);

  // Auto-scroll to selected date to ensure visibility
  useEffect(() => {
    if ((activeTab === 'calendar' || activeTab === 'favorites') && selectedDate) {
      const container = document.getElementById('date-scroll-container');
      const activeButton = container?.querySelector(`button[data-date="${selectedDate}"]`);

      if (activeButton && container) {
        // Check if button is already visible
        const rect = activeButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const isVisible = rect.left >= containerRect.left &&
          rect.right <= containerRect.right;

        // Only scroll if not visible, and use instant scroll if already close
        if (!isVisible) {
          activeButton.scrollIntoView({
            behavior: 'smooth',
            inline: 'nearest',
            block: 'nearest'
          });
        }
      }

      // Only scroll page to top if significantly scrolled down
      if (window.scrollY > 200) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedDate, activeTab]);


  // Final filtering for display
  const displayBlocks = useMemo(() => {
    let result = baseBlocks;

    // Apply date filter for calendar OR favorites
    if ((activeTab === 'calendar' || activeTab === 'favorites') && selectedDate) {
      result = result.filter(b => b.data === selectedDate);
    }

    return groupBlocksByDate(result);
  }, [baseBlocks, activeTab, selectedDate]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-40">
      <div className="max-w-md mx-auto relative px-6">

        <StickyHeader
          headerHeight={headerHeight}
          headerPadding={headerPadding}
          logoScale={logoScale}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFilterOpen={setIsFilterOpen}
        />

        {/* Sticky Navigation Section */}
        <div className="sticky top-0 z-30 bg-gradient-to-b from-background via-background/85 to-transparent backdrop-blur-xl pb-4 pt-4 -mx-6 px-6 mb-6 transition-all">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center overflow-x-auto hide-scrollbar mx-auto w-full">
              <PillToggle
                options={navOptions}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* Quick Day Selector (Show for Today, Calendar, and Favorites) */}
            {navigationDates.length > 1 && (
              <div className="relative group/scroll">
                <button
                  onClick={() => {
                    const el = document.getElementById('date-scroll-container');
                    if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10 pointer-events-none group-hover/scroll:pointer-events-auto"
                >
                  <span className="text-lg leading-none mb-0.5">‹</span>
                </button>

                <motion.div
                  id="date-scroll-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start gap-3 overflow-x-auto hide-scrollbar px-4 md:px-16 pb-2 scroll-smooth"
                >
                  {navigationDates.map(date => {
                    // Selected if it matches state AND we are in a mode that uses selection (Calendar or Favorites)
                    const isSelected = selectedDate === date && (activeTab === 'calendar' || activeTab === 'favorites');
                    const theme = getDateTheme(date);
                    return (
                      <button
                        key={date}
                        data-date={date}
                        onClick={() => {
                          setSelectedDate(date);
                          if (activeTab === 'today') setActiveTab('calendar');
                        }}
                        className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all group border shrink-0 font-bricolage ${isSelected
                          ? `text-white scale-105`
                          : `bg-muted/20 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/20 border-transparent`
                          }`}
                        style={isSelected ? {
                          backgroundColor: theme.color,
                          borderColor: theme.color,
                        } : {}}
                      >
                        <span className="text-sm font-black">{date.split('-')[2]}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                          {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>

                <button
                  onClick={() => {
                    const el = document.getElementById('date-scroll-container');
                    if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10 pointer-events-none group-hover/scroll:pointer-events-auto"
                >
                  <span className="text-lg leading-none mb-0.5">›</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <main className="space-y-8 min-h-[50vh]">
          <AnimatePresence mode="popLayout">
            {Object.entries(displayBlocks).sort().map(([date, blocks]) => (
              <motion.section
                key={date}
                id={`date-${date}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="scroll-mt-48 space-y-8"
              >
                <div className="flex items-center gap-3 font-bricolage">
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-2xl font-black leading-none">{date.split('-')[2]}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </div>
                  <div className="h-[1px] flex-1 bg-border/40" />
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground opacity-20" />
                </div>

                <div className="space-y-6">
                  {sortBlocksByDateTime(blocks).map((block, idx) => {
                    // Only animate first 8 blocks with progressive delay
                    const shouldAnimateWithDelay = idx < 8;

                    return (
                      <motion.div
                        key={block.id}
                        initial={shouldAnimateWithDelay ? { opacity: 0, y: 10 } : { opacity: 1 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={shouldAnimateWithDelay ? { delay: idx * 0.05 } : { duration: 0.2 }}
                      >
                        <BlockCard block={block} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>

          {baseBlocks.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center opacity-40">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-muted-foreground opacity-40">Nenhum bloco encontrado</p>
            </div>
          )}
        </main>

        {/* Filter Modal/Overlay (Simplified) */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-8"
            >
              <div className="flex justify-between items-center mb-12 font-bricolage">
                <h2 className="text-3xl font-black italic">Filtros<span className="text-primary NOT-italic">.</span></h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-12">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Em breve</h3>
                  <p className="text-sm opacity-60">Filtros por bairro, horário e estilo musical estão sendo implementados!</p>
                </div>
              </div>

              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-auto w-full py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest"
              >
                Aplicar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
