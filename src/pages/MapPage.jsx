import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import { Target } from 'lucide-react';
import L from 'leaflet';
import DateScrollSelector from '../components/Home/DateScrollSelector';
import { groupBlocksByDate } from '../utils/dateUtils';
import { useBlocks } from '../hooks/useBlocks';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Map Controller to handle view changes
const MapController = ({ center, triggerFocus, resetFocus }) => {
    const map = useMap();

    useEffect(() => {
        if (center && triggerFocus) {
            map.flyTo(center, 15, {
                animate: true,
                duration: 1.5
            });
            resetFocus();
        }
    }, [center, triggerFocus, map, resetFocus]);

    return null;
};

const MapPage = () => {
    // Custom User Location Icon
    const userIcon = new L.DivIcon({
        className: 'bg-transparent',
        html: `<div class="relative flex items-center justify-center w-8 h-8 -ml-2 -mt-2">
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-sm"></span>
               </div>`
    });

    const { blocks = [] } = useBlocks();

    // Default to BH center initially to avoid blocking UI if geo hangs
    const defaultCenter = [-19.9167, -43.9345];
    const [userLocation, setUserLocation] = useState(null);
    const [triggerFocus, setTriggerFocus] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    // Get unique dates for navigation
    const navigationDates = useMemo(() => {
        if (!blocks.length) return [];
        const validBlocks = blocks.filter(b => b.latitude && b.longitude);
        const groups = groupBlocksByDate(validBlocks);
        return Object.keys(groups).sort();
    }, [blocks]);

    // Initial date selection
    useEffect(() => {
        if (navigationDates.length > 0 && !selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            if (navigationDates.includes(today)) {
                setSelectedDate(today);
            } else {
                const futureDate = navigationDates.find(d => d >= today);
                setSelectedDate(futureDate || navigationDates[0]);
            }
        }
    }, [navigationDates, selectedDate]);

    // Geolocation logic with timeout
    useEffect(() => {
        let mounted = true;
        const geoTimeout = setTimeout(() => {
            if (mounted && loadingLocation) {
                console.warn("Geolocation timed out, using default center");
                setUserLocation(defaultCenter);
                setLoadingLocation(false);
            }
        }, 5000); // 5s timeout

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (mounted) {
                        clearTimeout(geoTimeout);
                        setUserLocation([position.coords.latitude, position.coords.longitude]);
                        setLoadingLocation(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    if (mounted) {
                        clearTimeout(geoTimeout);
                        setUserLocation(defaultCenter);
                        setLoadingLocation(false);
                    }
                },
                { timeout: 7000 }
            );
        } else {
            clearTimeout(geoTimeout);
            setUserLocation(defaultCenter);
            setLoadingLocation(false);
        }

        return () => {
            mounted = false;
            clearTimeout(geoTimeout);
        };
    }, []);

    const filteredBlocks = useMemo(() => {
        if (!selectedDate) return [];
        return blocks.filter(b =>
            b.data === selectedDate &&
            b.latitude &&
            b.longitude
        );
    }, [blocks, selectedDate]);

    // Only block if strictly loading location
    if (loadingLocation && !userLocation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const initialCenter = userLocation || defaultCenter;

    return (
        <div className="h-screen w-full relative bg-background pb-20 md:pb-0">
            {/* Header & Controls */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex flex-col gap-4 pointer-events-none">
                {/* Title Box */}
                <div className="pointer-events-auto self-start backdrop-blur-md bg-white/90 dark:bg-black/80 border border-white/10 rounded-2xl shadow-xl px-6 py-4">
                    <h1 className="text-xl font-black italic tracking-tight text-foreground leading-none">
                        Mapa de <span className="text-brand-green NOT-italic">Blocos</span>
                    </h1>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground opacity-40 mt-1">
                        Belo Horizonte 2026
                    </p>
                </div>

                {/* Day Navigation */}
                <div className="pointer-events-auto">
                    <DateScrollSelector
                        navigationDates={navigationDates}
                        selectedDate={selectedDate}
                        activeTab="calendar"
                        onDateSelect={setSelectedDate}
                    />
                </div>
            </div>

            {/* Focus Button */}
            <button
                onClick={() => setTriggerFocus(true)}
                className="absolute bottom-24 md:bottom-8 right-4 z-[1000] w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                title="Focar na minha localização"
            >
                <Target className="w-6 h-6" />
            </button>

            <MapContainer
                center={initialCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    center={userLocation || defaultCenter}
                    triggerFocus={triggerFocus}
                    resetFocus={() => setTriggerFocus(false)}
                />

                {/* User Location */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup>Você está aqui!</Popup>
                    </Marker>
                )}

                {/* Blocos */}
                {filteredBlocks.map((bloco) => (
                    <Marker
                        key={bloco.id}
                        position={[parseFloat(bloco.latitude), parseFloat(bloco.longitude)]}
                    >
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{bloco.nome}</h3>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="font-semibold">{bloco.horario}</span>
                                        <span>•</span>
                                        <span>{bloco.bairro}</span>
                                    </p>
                                    <p className="text-xs opacity-80">{bloco.endereco}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapPage;
