import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Share2, Download } from 'lucide-react';
import BlockCard from '../components/BlockCard';
import blocosData from '../data/blocos.json';
import useStore from '../store/useStore';
import { sortBlocksByDateTime, formatDate, groupBlocksByDate } from '../utils/dateUtils';
import { getDateTheme, BRAND_COLORS } from '../utils/themeUtils';

const MyAgenda = () => {
  const { favoriteBlocks } = useStore();

  // Get random theme for the header only once on mount
  const headerTheme = useMemo(() => {
    const themes = Object.values(BRAND_COLORS).filter(c => c !== BRAND_COLORS.light);
    return themes[Math.floor(Math.random() * themes.length)];
  }, []);

  // Obter blocos favoritos completos
  const allMyBlocks = useMemo(() => {
    const favoriteIds = favoriteBlocks.map(f => f.id);
    const blocks = blocosData.filter(b => favoriteIds.includes(b.id));
    return sortBlocksByDateTime(blocks);
  }, [favoriteBlocks]);

  // Derived Navigation Dates from favorites
  const navigationDates = useMemo(() => {
    const futureBlocks = allMyBlocks; // favorites are usually what we care about here
    const groups = groupBlocksByDate(futureBlocks);
    return Object.keys(groups).sort();
  }, [allMyBlocks]);

  const [selectedDate, setSelectedDate] = useState(null);

  // Auto-select first date if current selection is invalid
  useEffect(() => {
    if (!selectedDate || !navigationDates.includes(selectedDate)) {
      if (navigationDates.length > 0) {
        setSelectedDate(navigationDates[0]);
      } else {
        setSelectedDate(null);
      }
    }
  }, [navigationDates, selectedDate]);

  // Filtered blocks for display based on selected date
  const displayBlocks = useMemo(() => {
    if (!selectedDate) return [];
    return allMyBlocks.filter(b => b.data === selectedDate);
  }, [allMyBlocks, selectedDate]);


  // Próximo bloco (independent of selected date, generally the next upcoming one)
  const nextBlock = useMemo(() => {
    const now = new Date();
    return allMyBlocks.find(block => {
      const blockDate = new Date(`${block.data}T${block.horario || '00:00'}`);
      return blockDate > now;
    });
  }, [allMyBlocks]);

  // Próximo bloco tema
  const nextBlockTheme = nextBlock ? getDateTheme(nextBlock.data) : null;


  const handleShare = async () => {
    // Share all blocks or just selected day? Usually all blocks for "My Agenda" export
    const blockNames = allMyBlocks.map(b => `${b.nome} - ${formatDate(b.data)} às ${b.horario}`).join('\n');
    const text = `🎭 Minha Agenda - Carnaval BH 2026\n\n${blockNames}\n\n#CarnavalBH2026`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Agenda - Carnaval BH 2026',
          text: text,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(text);
      alert('Agenda copiada para a área de transferência!');
    }
  };

  const handleExport = () => {
    // Criar arquivo iCal
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Carnaval BH 2026//PT\n';

    allMyBlocks.forEach(block => {
      const [year, month, day] = block.data.split('-');
      const [hours, minutes] = (block.horario || '00:00').split(':');
      const startDate = `${year}${month}${day}T${hours}${minutes}00`;

      ical += 'BEGIN:VEVENT\n';
      ical += `DTSTART:${startDate}\n`;
      ical += `SUMMARY:${block.nome}\n`;
      ical += `LOCATION:${block.endereco}, ${block.bairro}\n`;
      ical += `DESCRIPTION:${block.observacoes || 'Bloco de Carnaval'}\n`;
      ical += 'END:VEVENT\n';
      ical += 'END:VCALENDAR';
    });


    // Download
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carnaval-bh-2026.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (allMyBlocks.length === 0) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-16 pb-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black tracking-tight leading-none italic"
            >
              Minha<span className="text-primary NOT-italic"> Agenda</span>
            </motion.h1>
          </header>

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="text-primary opacity-40 w-10 h-10" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-foreground">
                Agenda Vazia
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Favorite blocos para montar sua agenda personalizada do Carnaval BH 2026!
              </p>
            </div>
            <a
              href="/"
              className="mt-4 px-8 py-4 bg-primary/10 text-primary rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              Explorar blocos
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-500 pb-20">
      <div className="max-w-md mx-auto px-6">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-16 pb-2 mb-4">
          <div className="flex items-center justify-between mb-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black tracking-tight leading-none italic"
            >
              Minha<span className="NOT-italic" style={{ color: headerTheme }}> Agenda</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-primary/10 rounded-full"
            >
              <span className="text-xs font-black text-primary uppercase tracking-widest">
                {allMyBlocks.length} {allMyBlocks.length === 1 ? 'bloco' : 'blocos'}
              </span>
            </motion.div>
          </div>

          {/* Navigation Dates (New) */}
          {navigationDates.length > 0 && (
            <div className="relative group/scroll -mx-6 px-6 pb-2">
              <motion.div
                id="date-scroll-container-agenda"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth"
              >
                {navigationDates.map(date => {
                  const isSelected = selectedDate === date;
                  const theme = getDateTheme(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center min-w-[48px] py-2 rounded-2xl transition-all group border shrink-0 ${isSelected
                        ? `text-white shadow-lg scale-105`
                        : `hover:bg-primary/10 hover:text-primary hover:border-primary/20 bg-transparent border-transparent`
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
            </div>
          )}
        </header>

        {/* Próximo bloco (destaque) */}
        {nextBlock && nextBlockTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="countdown-card mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, ${nextBlockTheme.color}, ${nextBlockTheme.color}dd)`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-widest">
                Próximo Bloco
              </h2>
            </div>
            <h3 className="text-2xl font-black mb-1">
              {nextBlock.nome}
            </h3>
            <p className="text-white/80 text-sm">
              {formatDate(nextBlock.data)} às {nextBlock.horario}
            </p>
          </motion.div>
        )}

        {/* Ações */}
        <div className="flex gap-3 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group"
          >
            <Share2 className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all" />
            <span className="text-sm font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Compartilhar</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group"
          >
            <Download className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all" />
            <span className="text-sm font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Exportar</span>
          </motion.button>
        </div>

        {/* Lista de blocos */}
        <AnimatePresence mode='popLayout'>
          {displayBlocks.length > 0 ? (
            <motion.div
              layout
              className="space-y-6"
            >
              {displayBlocks.map((block, idx) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BlockCard block={block} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 opacity-50"
            >
              <p>Nenhum bloco favorito para esta data.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyAgenda;
