import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Navigation, Car, Bus, Copy, Check } from 'lucide-react';
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
import { getDateTheme } from '../utils/themeUtils';

const BlockCard = ({ block }) => {
  const { toggleFavorite, favoriteBlocks } = useStore();
  const [countdown, setCountdown] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get dynamic theme based on DATE
  const theme = getDateTheme(block.data);

  // Directly derive favorited state from favoriteBlocks array to ensure re-renders
  const favorited = favoriteBlocks.some(b => b.id === block.id);

  // Update countdown
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
      const routeData = await calculateRoute(userLocation, { lat: block.latitude, lng: block.longitude });
      setRoute(routeData);
    } catch (error) {
      alert('Localização não permitida.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleOpenUber = () => {
    const deepLink = getUberDeepLink({ lat: block.latitude, lng: block.longitude, name: block.nome });
    window.location.href = deepLink;
    setTimeout(() => {
      window.open(getUberWebUrl({ lat: block.latitude, lng: block.longitude }), '_blank');
    }, 1000);
  };

  const handleOpenMaps = async () => {
    try {
      const userLocation = await getCurrentLocation();
      window.open(getGoogleMapsTransitUrl(userLocation, { lat: block.latitude, lng: block.longitude }), '_blank');
    } catch (error) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${block.latitude},${block.longitude}`, '_blank');
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${block.endereco}, ${block.bairro}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const uberPrice = route ? estimateUberPrice(route.distanceKm) : null;

  return (
    <div
      className={`relative bg-card border border-border/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:border-transparent group`}
      style={{
        '--theme-color': theme.color,
      }}
    >
      {/* Dynamic border via simulated element or box-shadow could be cleaner, but using style for hover border color is tricky with tailwind classes alone if we want exact color match. 
          Instead, let's use the style override for the border color on hover using standard CSS logic or just inline style for the border. 
          Actually, let's use a pseudo-element or just applying the class if it's safelisted. 
          Given the theme definitions, we have classes like hover:border-vibrant-pink/50. 
      */}
      <div className={`absolute inset-0 rounded-[2.5rem] border border-transparent pointer-events-none transition-all duration-500 ${theme.borderClass}`} />

      {/* Time & Favorite Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1.5 font-sans">
          <span className={`text-4xl font-black tracking-tighter text-foreground group-hover:text-[var(--theme-color)] transition-colors`}>
            {formatTime(block.horario)}
          </span>
          {block.observacoes && !block.observacoes.toLowerCase().includes('carnaval 2026') && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
              {block.observacoes}
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleFavorite(block.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${favorited ? 'bg-red-500/10 shadow-inner' : 'bg-muted/50 hover:bg-muted'}`}
        >
          <Heart className={`w-6 h-6 transition-all ${favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </motion.button>
      </div>

      {/* Main Info */}
      <div className="mb-10">
        <h3 className="text-2xl font-black leading-[1.1] tracking-tight mb-4 text-foreground pr-8">
          {block.nome}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <MapPin className={`w-4 h-4 opacity-70`} style={{ color: theme.color }} />
            <span className="text-[11px] font-black uppercase tracking-widest truncate" style={{ color: theme.color, opacity: 0.7 }}>{block.bairro}</span>
          </div>

          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 group/addr w-full text-left"
          >
            <p className="text-[11px] font-medium text-muted-foreground opacity-40 group-hover/addr:opacity-80 transition-opacity truncate flex-1">
              {block.endereco}
            </p>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Check className="w-3.5 h-3.5 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  whileHover={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Footer / Utility Restoration */}
      {(countdown && !countdown.isPast || route) ? (
        <div className="pt-8 border-t border-border/20 space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-3">
              {countdown && !countdown.isPast && (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm transition-colors duration-500"
                  style={{
                    backgroundColor: `${theme.color}15`, // 10% opacity
                    borderColor: `${theme.color}30`, // 20% opacity
                    boxShadow: `0 2px 10px ${theme.color}10` // 5% opacity
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.color }} />
                  <span className="font-mono text-[10px] uppercase font-black tracking-tight" style={{ color: theme.color }}>
                    Falta: {countdown.formatted}
                  </span>
                </div>
              )}
            </div>
            {route && (
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${theme.color}10`,
                  color: theme.color
                }}
              >
                {route.distanceKm}KM • {route.durationText}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleCalculateDistance}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
              style={{ '--theme-color': theme.color }}
            >
              <Navigation className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">
                {loadingRoute ? '...' : 'Rota'}
              </span>
            </button>

            <button
              onClick={handleOpenUber}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
              style={{ '--theme-color': theme.color }}
            >
              <Car className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">
                {uberPrice ? uberPrice.formatted : 'Uber'}
              </span>
            </button>

            <button
              onClick={handleOpenMaps}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
              style={{ '--theme-color': theme.color }}
            >
              <Bus className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">Bus</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-border/10">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleCalculateDistance}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
              style={{ '--theme-color': theme.color }}
            >
              <Navigation className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
              <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">
                {loadingRoute ? '...' : 'Rota'}
              </span>
            </button>

            <button
              onClick={handleOpenUber}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
              style={{ '--theme-color': theme.color }}
            >
              <Car className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
              <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">
                {uberPrice ? uberPrice.formatted : 'Uber'}
              </span>
            </button>

            <button
              onClick={handleOpenMaps}
              className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
              style={{ '--theme-color': theme.color }}
            >
              <Bus className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
              <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">Bus</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCard;
