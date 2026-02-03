import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BlockCard from '../components/BlockCard';
import { useBlocks } from '../hooks/useBlocks';
import { groupBlocksByDate, sortBlocksByDateTime } from '../utils/dateUtils';
import useStore from '../store/useStore';
import PillToggle from '../components/PillToggle';
import StickyHeader from '../components/StickyHeader';
import SuggestBlockModal from '../components/SuggestBlockModal';
import HomeEmptyState from '../components/Home/HomeEmptyState';
import HomeSuggestionFooter from '../components/Home/HomeSuggestionFooter';
import FilterModal from '../components/Home/FilterModal';
import DateScrollSelector from '../components/Home/DateScrollSelector';

const Home = () => {
  const { blocks: allBlocks, loading } = useBlocks();
  const { favoriteBlocks } = useStore();
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
  const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });

  const navOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Calendário', value: 'calendar' },
    { label: 'Favoritos', value: 'favorites' }
  ];

  // Base filtering (Search + Tab Type)
  const baseBlocks = useMemo(() => {
    // Global Search Logic - Bypasses all other filters
    if (searchQuery) {
      // When searching, we want to look at EVERYTHING
      return allBlocks.filter(b =>
        b.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.endereco.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let result = allBlocks;
    const now = new Date();

    if (activeTab === 'favorites') {
      const favoriteIds = new Set(favoriteBlocks.map(f => f.id));
      result = result.filter(b => favoriteIds.has(b.id));
    } else if (activeTab === 'today') {
      const futureBlocks = result.filter(b => new Date(`${b.data}T${b.horario || '00:00'}`) >= now);
      const nextDate = sortBlocksByDateTime(futureBlocks)[0]?.data;
      result = result.filter(b => b.data === nextDate);
    } else {
      result = result.filter(b => {
        const blockDate = new Date(`${b.data}T23:59:59`);
        return blockDate >= now;
      });
    }

    return result;
  }, [activeTab, favoriteBlocks, searchQuery, allBlocks]);

  const navigationDates = useMemo(() => {
    const now = new Date();
    let sourceBlocks = allBlocks;

    if (activeTab === 'favorites') {
      const favoriteIds = new Set(favoriteBlocks.map(f => f.id));
      sourceBlocks = allBlocks.filter(b => favoriteIds.has(b.id));
    }

    const futureBlocks = sourceBlocks.filter(b => {
      const blockDate = new Date(`${b.data}T23:59:59`);
      return blockDate >= now;
    });
    const groups = groupBlocksByDate(futureBlocks);
    return Object.keys(groups).sort();
  }, [activeTab, favoriteBlocks, allBlocks]);

  const [selectedDate, setSelectedDate] = useState(null);

  // Auto-select first date
  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'favorites') {
      if (!selectedDate || !navigationDates.includes(selectedDate)) {
        if (navigationDates.length > 0) {
          setSelectedDate(navigationDates[0]);
        }
      }
    }
  }, [activeTab, navigationDates, selectedDate]);

  // Auto-scroll logic kept here as it interacts with DOM directly, could be hook but kept for now.
  useEffect(() => {
    if ((activeTab === 'calendar' || activeTab === 'favorites') && selectedDate) {
      const container = document.getElementById('date-scroll-container'); // Still available inside component
      const activeButton = container?.querySelector(`button[data-date="${selectedDate}"]`);

      if (activeButton && container) {
        const rect = activeButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const isVisible = rect.left >= containerRect.left && rect.right <= containerRect.right;

        if (!isVisible) {
          activeButton.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
        }
      }
      if (window.scrollY > 200) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedDate, activeTab]);

  // Final filtering
  const displayBlocks = useMemo(() => {
    let result = baseBlocks;
    // Only apply date filtering if NOT searching
    if (!searchQuery && (activeTab === 'calendar' || activeTab === 'favorites') && selectedDate) {
      result = result.filter(b => b.data === selectedDate);
    }
    return groupBlocksByDate(result);
  }, [baseBlocks, activeTab, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (activeTab === 'today') setActiveTab('calendar');
  };

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
              <PillToggle options={navOptions} value={activeTab} onChange={setActiveTab} />
            </div>

            <DateScrollSelector
              navigationDates={navigationDates}
              selectedDate={selectedDate}
              activeTab={activeTab}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>

        {/* Content Section */}
        <main className="space-y-8 min-h-[50vh]">
          <AnimatePresence mode="popLayout">
            {Object.entries(displayBlocks).sort().map(([date, blocks]) => (
              <motion.section
                key={date}
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
                  {sortBlocksByDateTime(blocks).map((block, idx) => (
                    <motion.div
                      key={block.id}
                      initial={idx < 8 ? { opacity: 0, y: 10 } : { opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={idx < 8 ? { delay: idx * 0.05 } : { duration: 0.2 }}
                    >
                      <BlockCard block={block} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>

          {baseBlocks.length === 0 && (
            <HomeEmptyState onSuggest={() => setIsSuggestModalOpen(true)} />
          )}

          {baseBlocks.length > 0 && (
            <HomeSuggestionFooter onSuggest={() => setIsSuggestModalOpen(true)} />
          )}
        </main>

        <SuggestBlockModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
        <AnimatePresence>
          {isFilterOpen && <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
