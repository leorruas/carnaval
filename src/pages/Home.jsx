import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Filter, Heart, Search, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BlockCard from '../components/BlockCard';
import blocosData from '../data/blocos.json';
import { groupBlocksByDate, sortBlocksByDateTime } from '../utils/dateUtils';
import useStore from '../store/useStore';
import PillToggle from '../components/PillToggle';
import ThemeToggle from '../components/ThemeToggle';

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
    { label: 'Favoritos', value: 'favorites', icon: <Heart className="w-3.5 h-3.5" /> }
  ];

  const filteredBlocks = useMemo(() => {
    let result = blocosData;
    const now = new Date();

    if (activeTab === 'favorites') {
      const favoriteIds = favoriteBlocks.map(f => f.id);
      result = result.filter(b => favoriteIds.includes(b.id));
    } else if (activeTab === 'today') {
      const futureBlocks = result.filter(b => new Date(`${b.data}T${b.horario || '00:00'}`) >= now);
      const nextDate = sortBlocksByDateTime(futureBlocks)[0]?.data;
      result = result.filter(b => b.data === nextDate);
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

  const groupedBlocks = useMemo(() => groupBlocksByDate(filteredBlocks), [filteredBlocks]);
  const allDates = useMemo(() => Object.keys(groupedBlocks).sort(), [groupedBlocks]);

  const scrollToDate = (date) => {
    const element = document.getElementById(`date-${date}`);
    if (element) {
      const offset = 180; // Adjusted for compact header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-40">
      <div className="max-w-md mx-auto relative px-6">

        {/* Dynamic Header Section */}
        <motion.header
          style={{ height: headerHeight, paddingTop: headerPadding }}
          className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/10 px-6 max-w-md mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.div style={{ scale: logoScale }} className="origin-left">
              <h1 className="text-2xl font-black tracking-tight leading-none italic">
                Carnaval<span className="text-primary NOT-italic">.bh</span>
              </h1>
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
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar por bloco, bairro ou endereço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <div className="flex justify-start overflow-x-auto hide-scrollbar py-1">
              <PillToggle
                options={navOptions}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* Quick Day Selector (Only in Calendar/Favorites with results) */}
            {activeTab !== 'today' && allDates.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
              >
                {allDates.map(date => (
                  <button
                    key={date}
                    onClick={() => scrollToDate(date)}
                    className="flex flex-col items-center min-w-[48px] py-2 rounded-2xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all group"
                  >
                    <span className="text-sm font-black">{date.split('-')[2]}</span>
                    <span className="text-[8px] font-black uppercase opacity-40 group-hover:opacity-100">
                      {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Content Section */}
        <main className="pt-48 space-y-16">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedBlocks).sort().map(([date, blocks]) => (
              <motion.section
                key={date}
                id={`date-${date}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="scroll-mt-48 space-y-8"
              >
                <div className="flex items-center gap-4">
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

          {filteredBlocks.length === 0 && (
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
