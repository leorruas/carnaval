import { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, Navigation, Car, Bus } from 'lucide-react';
import useStore from '../store/useStore';
import { calculateTimeUntil, formatTime } from '../utils/dateUtils';
import {
  getCurrentLocation,
  calculateRoute,
  estimateUberPrice,
  getGoogleMapsTransitUrl,
  getUberDeepLink,
  getUberWebUrl
} from '../utils/locationUtils';

const BlockCard = ({ block }) => {
  const { toggleFavorite, isFavorited } = useStore();
  const [countdown, setCountdown] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const favorited = isFavorited(block.id);

  // Atualizar countdown a cada segundo
  useEffect(() => {
    const updateCountdown = () => {
      const time = calculateTimeUntil(block.data, block.horario);
      setCountdown(time);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [block.data, block.horario]);

  const handleCalculateDistance = async () => {
    setLoadingRoute(true);
    try {
      const userLocation = await getCurrentLocation();
      const routeData = await calculateRoute(
        userLocation,
        { lat: block.latitude, lng: block.longitude }
      );
      setRoute(routeData);
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
      alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleOpenUber = () => {
    const deepLink = getUberDeepLink({
      lat: block.latitude,
      lng: block.longitude,
      name: block.nome
    });

    // Tentar abrir o app
    window.location.href = deepLink;

    // Fallback para versão web após 1 segundo
    setTimeout(() => {
      const webUrl = getUberWebUrl({
        lat: block.latitude,
        lng: block.longitude
      });
      window.open(webUrl, '_blank');
    }, 1000);
  };

  const handleOpenGoogleMaps = async () => {
    try {
      const userLocation = await getCurrentLocation();
      const url = getGoogleMapsTransitUrl(
        userLocation,
        { lat: block.latitude, lng: block.longitude }
      );
      window.open(url, '_blank');
    } catch (error) {
      // Fallback: abrir sem origem
      const url = `https://www.google.com/maps/search/?api=1&query=${block.latitude},${block.longitude}`;
      window.open(url, '_blank');
    }
  };

  const uberPrice = route ? estimateUberPrice(route.distanceKm) : null;

  // Determinar cor baseada no ID (consistente)
  const getCardColor = (id) => {
    // Keeping pastel colors for light mode, but ensuring they have a dark mode equivalent if needed
    // or just using the card style for dark mode to keep it clean
    const colors = [
      'bg-pastel-purple dark:bg-purple-900/40 dark:border-purple-700/50',
      'bg-pastel-peach dark:bg-orange-900/40 dark:border-orange-700/50',
      'bg-pastel-teal dark:bg-teal-900/40 dark:border-teal-700/50',
      'bg-pastel-pink dark:bg-pink-900/40 dark:border-pink-700/50'
    ];
    const index = typeof id === 'number' ? id : id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const cardColor = getCardColor(block.id);

  return (
    <div className={`relative ${cardColor} dark:border rounded-[32px] p-6 transition-transform hover:scale-[1.02] duration-200`}>
      {/* Header: Time & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            {formatTime(block.horario)}
          </span>
          {block.observacoes && (
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60 text-foreground dark:text-gray-300 mt-1">
              {block.observacoes}
            </span>
          )}
        </div>

        <button
          onClick={() => toggleFavorite(block.id)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/30 dark:bg-white/10 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/20 transition-colors"
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={`w-6 h-6 transition-all ${favorited
              ? 'fill-gray-900 text-foreground dark:text-purple-400 dark:fill-purple-400'
              : 'text-gray-800 dark:text-white'
              }`}
          />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold leading-tight mb-2 text-foreground dark:text-white">
          {block.nome}
        </h3>

        <div className="flex items-start text-gray-800/80 dark:text-gray-300">
          <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground dark:text-gray-200">{block.endereco}</p>
            <p className="text-sm opacity-75">{block.bairro}</p>
          </div>
        </div>
      </div>

      {/* Footer: Countdown & Actions */}
      <div className="space-y-3">
        {/* Countdown */}
        {countdown && !countdown.isPast && (
          <div className="bg-white/40 dark:bg-black/40 rounded-2xl p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {countdown.isToday ? '🎉 É HOJE!' : 'Faltam:'}
            </span>
            <span className="font-bold font-mono text-gray-900 dark:text-white bg-white/50 dark:bg-white/10 px-2 py-1 rounded-lg">
              {countdown.formatted}
            </span>
          </div>
        )}

        {/* Action Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={handleCalculateDistance}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 dark:bg-white dark:text-black text-white text-sm font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            {loadingRoute ? '...' : route ? `${route.distanceKm} km` : 'Distância'}
          </button>

          <button
            onClick={handleOpenUber}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Car className="w-4 h-4" />
            Uber
          </button>

          <button
            onClick={handleOpenGoogleMaps}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-semibold hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors"
          >
            <Bus className="w-4 h-4" />
            Como ir
          </button>
        </div>

        {/* Route Info */}
        {route && (
          <div className="text-xs text-center font-medium opacity-60 text-gray-900 dark:text-white mt-2">
            {route.durationText} de carro • ~{uberPrice ? uberPrice.formatted : 'R$ --'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockCard;
