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

const Home = () => {
  const { favoriteBlocks } = useStore();
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scrollRef = useRef(null);

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100]);
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8]);
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
      const favoriteIds = favoriteBlocks.map(f => f.id);
      result = result.filter(b => favoriteIds.includes(b.id));
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
      const favoriteIds = favoriteBlocks.map(f => f.id);
      sourceBlocks = blocosData.filter(b => favoriteIds.includes(b.id));
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

        <motion.header
          style={{ height: headerHeight, paddingTop: headerPadding }}
          className="relative left-0 right-0 z-20 px-6 max-w-md mx-auto"
        >
          <div className="flex justify-between items-center mb-6 gap-4">
            <motion.div style={{ scale: logoScale }} className="origin-left">
              <BrandLogo className="h-16 w-auto max-w-full text-foreground" />
            </motion.div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSearchOpen ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4 opacity-40" />}
              </button>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Filter className="w-4 h-4 opacity-40" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar por bloco, bairro ou endereço..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }
                      }}
                      className="w-full bg-muted/50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-3 h-3 opacity-40" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

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
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10"
                >
                  <span className="text-lg leading-none mb-0.5">‹</span>
                </button>

                <motion.div
                  id="date-scroll-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start md:justify-center gap-3 overflow-x-auto hide-scrollbar px-10 pb-2 scroll-smooth"
                >
                  {navigationDates.map(date => {
                    // Selected if it matches state AND we are in a mode that uses selection (Calendar or Favorites)
                    const isSelected = selectedDate === date && (activeTab === 'calendar' || activeTab === 'favorites');
                    const theme = getDateTheme(date);
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          // If we are on 'today', clicking a date switches to 'calendar'. 
                          // If we are on 'favorites', we stay on 'favorites' but change date.
                          if (activeTab === 'today') setActiveTab('calendar');
                        }}
                        className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all group border shrink-0 ${isSelected
                          ? `text-white shadow-lg scale-105`
                          : `bg-muted/20 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/20 border-transparent`
                          }`}
                        style={isSelected ? {
                          backgroundColor: theme.color,
                          borderColor: theme.color,
                          boxShadow: `0 10px 30px -10px ${theme.color}40`
                        } : {}}
                      >
                        <span className="text-sm font-black">{date.split('-')[2]}</span>
                        <span className={`text-[8px] font-black uppercase ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:bg-background border border-white/10"
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
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-2xl font-black leading-none">{date.split('-')[2]}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </div>
                  <div className="h-[1px] flex-1 bg-border/40" />
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground opacity-20" />
                </div>

                <div className="space-y-6">
                  {sortBlocksByDateTime(blocks).map((block, idx) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <BlockCard block={block} />
                    </motion.div>
                  ))}
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
              <div className="flex justify-between items-center mb-12">
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
                className="mt-auto w-full py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
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
