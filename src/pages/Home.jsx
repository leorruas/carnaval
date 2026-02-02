import { useState, useMemo } from 'react';
import { Calendar, Filter, Heart, Clock, Search } from 'lucide-react';
import BlockCard from '../components/BlockCard';
import blocosData from '../data/blocos.json';
import { groupBlocksByDate, sortBlocksByDateTime, formatDate } from '../utils/dateUtils';
import useStore from '../store/useStore';
import PillToggle from '../components/PillToggle';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
  const { favoriteBlocks } = useStore();
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('today');

  // Agrupar blocos por data (Original Logic Restore)
  const blocksGroupedByDate = useMemo(() => {
    return groupBlocksByDate(blocosData);
  }, []);

  // Obter datas únicas ordenadas
  const dates = useMemo(() => {
    return Object.keys(blocksGroupedByDate).sort();
  }, [blocksGroupedByDate]);

  const navOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Calendário', value: 'calendar' },
    { label: 'Favoritos', value: 'favorites', icon: <Heart className="w-4 h-4" /> }
  ];

  // Logic to determine what to show based on activeTab
  const visibleBlocks = useMemo(() => {
    let blocks = blocosData;
    const now = new Date();

    // Filter past events by default
    blocks = blocks.filter(b => {
      const blockDate = new Date(`${b.data}T${b.horario || '00:00'}`); // ISO format
      return blockDate >= now; // Only show future or current events
    });

    if (activeTab === 'favorites') {
      const favoriteIds = favoriteBlocks.map(f => f.id);
      return blocks.filter(b => favoriteIds.includes(b.id));
    }

    if (activeTab === 'today') {
      // Since it's a 2026 app, "Today" might be empty if we check strictly against 2024/2025.
      // However, to respect the "Past events" rule, we just show the first available future date.
      // Or strictly check for today. For the demo to work in 2026 context, let's look for the first day that has events.
      if (blocks.length > 0) {
        // Sort by date to find the next available day
        const sorted = sortBlocksByDateTime(blocks);
        const nextDate = sorted[0]?.data;
        return blocks.filter(b => b.data === nextDate);
      }
      return [];
    }

    // Calendar shows all future events
    return blocks;
  }, [activeTab, favoriteBlocks]);

  // Grouping for render
  const groupedBlocks = useMemo(() => groupBlocksByDate(visibleBlocks), [visibleBlocks]);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
      <div className="max-w-md mx-auto min-h-screen bg-background shadow-2xl overflow-hidden relative">

        {/* Header */}
        <header className="px-6 pt-12 pb-6 bg-background sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Carnaval<span className="text-carnival-purple">.bh</span></h1>
              <p className="text-gray-500 font-medium">Belo Horizonte, 2026</p>
            </div>
            <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex justify-start overflow-x-auto hide-scrollbar py-2">
            <PillToggle
              options={navOptions}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </header>

        {/* Content */}
        <main className="px-4 space-y-8">
          {activeTab === 'calendar' ? (
            // CALENDAR VIEW (List by date)
            Object.entries(groupedBlocks).map(([date, blocks]) => (
              <div key={date} className="space-y-4">
                <div className="sticky top-40 z-10 py-2">
                  {/* Date Header "13 DEC" style */}
                  <div className="inline-flex flex-col items-center">
                    <span className="text-4xl font-bold leading-none tracking-tighter text-foreground">
                      {date.split('-')[2]}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      {new Date(date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-border ml-4 space-y-4">
                  {sortBlocksByDateTime(blocks).map(block => (
                    <BlockCard key={block.id} block={block} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // TODAY / FAVORITES VIEW (Flat List)
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTab === 'favorites' ? 'Seus Blocos' : 'Destaques'}
                </h2>
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {visibleBlocks.length} eventos
                </span>
              </div>

              {visibleBlocks.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <p>Nenhum bloco encontrado.</p>
                </div>
              ) : (
                sortBlocksByDateTime(visibleBlocks).map(block => (
                  <BlockCard key={block.id} block={block} />
                ))
              )}
            </div>
          )}
        </main>

        {/* Floating Add/Filter Button (Fab) */}
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:shadow-primary/50 transition-all z-50">
          <Filter className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default Home;
