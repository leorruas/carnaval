import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Copy, Check } from 'lucide-react';
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
import BlockCardActions from './BlockCardActions';

const BlockCard = ({ block, matchBadge, onAdd }) => {
  const { toggleFavorite, favoriteBlocks } = useStore();
  const [countdown, setCountdown] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get dynamic theme based on DATE
  const theme = getDateTheme(block.data);

  // Directly derive favorited state
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
      className={`relative bg-card border border-border/10 rounded-2xl p-5 transition-all duration-500 group overflow-hidden ${onAdd ? '' : 'hover:border-transparent'}`}
      style={{
        '--theme-color': theme.color,
      }}
    >
      {/* Dynamic border via simulated element */}
      <div className={`absolute inset-0 rounded-2xl border border-transparent pointer-events-none transition-all duration-500 ${theme.borderClass}`} />

      {/* Match Badge for Shared Agenda */}
      {matchBadge && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10">
          👯 Match!
        </div>
      )}

      {/* Add Button for Shared Agenda (New Blocks) */}
      {
        onAdd && (
          <div className="absolute top-3 right-3 z-20">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAdd(block)}
              className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-primary/90 flex items-center gap-1.5"
            >
              Adicionar <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[9px]">+</div>
            </motion.button>
          </div>
        )
      }

      {/* Time & Favorite Header (Hidden if onAdd mode, because button takes space, or adjust layout) */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1 font-bricolage">
          <span className={`text-4xl font-black tracking-tighter text-foreground group-hover:text-[var(--theme-color)] transition-colors`}>
            {formatTime(block.horario)}
          </span>
          {block.observacoes && !block.observacoes.toLowerCase().includes('carnaval 2026') && (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
              {block.observacoes}
            </p>
          )}
        </div>

        {!onAdd && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(block.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${favorited ? 'bg-red-500/10' : 'bg-muted/50 hover:bg-muted'}`}
          >
            <Heart className={`w-5 h-5 transition-all ${favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </motion.button>
        )}
      </div>

      {/* Main Info */}
      <div className="mb-4">
        <h3 className="text-xl font-black uppercase leading-[1.1] tracking-tight mb-3 text-foreground pr-6 font-bricolage">
          {block.nome}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-bricolage">
            <MapPin className={`w-3.5 h-3.5 opacity-70`} style={{ color: theme.color }} />
            <span className="text-[10px] font-black uppercase tracking-widest truncate" style={{ color: theme.color, opacity: 0.7 }}>{block.bairro}</span>
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
      {/* Footer / Utility Restoration */}
      <BlockCardActions
        theme={theme}
        countdown={countdown}
        route={route}
        loadingRoute={loadingRoute}
        uberPrice={uberPrice}
        onCalculateDistance={handleCalculateDistance}
        onOpenUber={handleOpenUber}
        onOpenMaps={handleOpenMaps}
      />
    </div>
  );
};

export default BlockCard;
