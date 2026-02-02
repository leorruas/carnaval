import { useState, useMemo } from 'react';
import { Calendar, Clock, Share2, Download } from 'lucide-react';
import BlockCard from '../components/BlockCard';
import blocosData from '../data/blocos.json';
import useStore from '../store/useStore';
import { sortBlocksByDateTime, formatDate } from '../utils/dateUtils';

const MyAgenda = () => {
  const { favoriteBlocks } = useStore();

  // Obter blocos favoritos completos
  const myBlocks = useMemo(() => {
    const favoriteIds = favoriteBlocks.map(f => f.id);
    const blocks = blocosData.filter(b => favoriteIds.includes(b.id));
    return sortBlocksByDateTime(blocks);
  }, [favoriteBlocks]);

  // Próximo bloco
  const nextBlock = useMemo(() => {
    const now = new Date();
    return myBlocks.find(block => {
      const blockDate = new Date(`${block.data}T${block.horario || '00:00'}`);
      return blockDate > now;
    });
  }, [myBlocks]);

  const handleShare = async () => {
    const blockNames = myBlocks.map(b => `${b.nome} - ${formatDate(b.data)} às ${b.horario}`).join('\n');
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
    
    myBlocks.forEach(block => {
      const [year, month, day] = block.data.split('-');
      const [hours, minutes] = (block.horario || '00:00').split(':');
      const startDate = `${year}${month}${day}T${hours}${minutes}00`;
      
      ical += 'BEGIN:VEVENT\n';
      ical += `DTSTART:${startDate}\n`;
      ical += `SUMMARY:${block.nome}\n`;
      ical += `LOCATION:${block.endereco}, ${block.bairro}\n`;
      ical += `DESCRIPTION:${block.observacoes || 'Bloco de Carnaval'}\n`;
      ical += 'END:VEVENT\n';
    });
    
    ical += 'END:VCALENDAR';
    
    // Download
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carnaval-bh-2026.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (myBlocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-carnival-purple mb-2">
            Sua agenda está vazia
          </h2>
          <p className="text-gray-600 mb-6">
            Favorite blocos para montar sua agenda personalizada do Carnaval BH 2026!
          </p>
          <a href="/" className="btn-primary inline-block">
            Explorar blocos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-carnival-red to-carnival-purple text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📅 Minha Agenda</h1>
        <p className="text-purple-100">
          {myBlocks.length} {myBlocks.length === 1 ? 'bloco' : 'blocos'} na sua agenda
        </p>
      </div>

      {/* Próximo bloco (destaque) */}
      {nextBlock && (
        <div className="bg-carnival-yellow p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-carnival-purple" />
            <h2 className="text-lg font-bold text-carnival-purple">
              PRÓXIMO BLOCO
            </h2>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {nextBlock.nome}
          </h3>
          <p className="text-gray-700">
            {formatDate(nextBlock.data)} às {nextBlock.horario}
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="bg-white p-4 shadow-md flex gap-2">
        <button
          onClick={handleShare}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
        <button
          onClick={handleExport}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Lista de blocos */}
      <div className="p-4 space-y-4">
        {myBlocks.map(block => (
          <BlockCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default MyAgenda;
