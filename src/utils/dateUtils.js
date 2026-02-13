import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, parseISO, format, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Calcula o tempo restante até um bloco
 * @param {string} dateStr - Data no formato ISO (YYYY-MM-DD)
 * @param {string} timeStr - Horário no formato HH:MM
 * @returns {Object} Objeto com dias, horas, minutos, segundos e strings formatadas
 */
export const calculateTimeUntil = (dateStr, timeStr) => {
  try {
    // Combinar data e hora
    const [year, month, day] = dateStr.split('-');
    const [targetHours, targetMinutes] = timeStr.split(':');

    const targetDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(targetHours),
      parseInt(targetMinutes || '0')
    );

    const now = new Date();

    // Verificar se o bloco já passou
    if (isBefore(targetDate, now)) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isPast: true,
        isToday: false,
        formatted: 'Bloco já aconteceu',
        shortFormatted: 'Passou'
      };
    }

    const totalSeconds = differenceInSeconds(targetDate, now);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Verificar se é hoje
    const isToday = days === 0 && hours < 24;

    // Formato longo
    let formatted = '';
    if (days > 0) {
      formatted += `${days}d `;
    }
    if (hours > 0 || days > 0) {
      formatted += `${hours}h `;
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      formatted += `${minutes}m`;
    }
    if (days === 0 && hours === 0) {
      formatted += ` ${seconds}s`;
    }

    // Formato curto
    let shortFormatted = '';
    if (days > 0) {
      shortFormatted = `${days}d ${hours}h`;
    } else if (hours > 0) {
      shortFormatted = `${hours}h ${minutes}m`;
    } else {
      shortFormatted = `${minutes}m ${seconds}s`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isPast: false,
      isToday,
      formatted: formatted.trim(),
      shortFormatted: shortFormatted.trim()
    };
  } catch (error) {
    console.error('Erro ao calcular countdown:', error);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPast: false,
      isToday: false,
      formatted: 'Erro',
      shortFormatted: 'Erro'
    };
  }
};

/**
 * Formata uma data para exibição
 * @param {string} dateStr - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} Data formatada (ex: "Sábado, 31 de janeiro")
 */
export const formatDate = (dateStr) => {
  try {
    const date = parseISO(dateStr);
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } catch (error) {
    return dateStr;
  }
};

/**
 * Formata hora para exibição
 * @param {string} timeStr - Horário no formato HH:MM
 * @returns {string} Horário formatado (ex: "14:00")
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
};

/**
 * Agrupa blocos por data
 * @param {Array} blocos - Array de blocos
 * @returns {Object} Objeto com blocos agrupados por data
 */
export const groupBlocksByDate = (blocos = []) => {
  return blocos.reduce((acc, bloco) => {
    if (!acc[bloco.data]) {
      acc[bloco.data] = [];
    }
    acc[bloco.data].push(bloco);
    return acc;
  }, {});
};

/**
 * Ordena blocos por data e horário
 * @param {Array} blocos - Array de blocos
 * @returns {Array} Blocos ordenados
 */
export const sortBlocksByDateTime = (blocos = []) => {
  return [...blocos].sort((a, b) => {
    const dateA = new Date(`${a.data}T${a.horario || '00:00'}`);
    const dateB = new Date(`${b.data}T${b.horario || '00:00'}`);
    return dateA - dateB;
  });
};
/**
 * Retorna a data atual no formato ISO (YYYY-MM-DD)
 * @returns {string} Data atual formatada
 */
export const getTodayISO = () => {
  return format(new Date(), 'yyyy-MM-dd');
};
