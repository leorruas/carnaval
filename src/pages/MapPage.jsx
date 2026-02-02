import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import blocosData from '../data/blocos.json';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

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

const MapPage = () => {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    // Default to BH center if permission denied
                    setUserLocation([-19.9167, -43.9345]);
                }
            );
        } else {
            setUserLocation([-19.9167, -43.9345]);
        }
    }, []);

    if (!userLocation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] w-full relative bg-background">
            <header className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-background/80 to-transparent pointer-events-none">
                <h1 className="text-2xl font-bold text-foreground drop-shadow-md">Mapa dos Blocos</h1>
            </header>

            <MapContainer
                center={userLocation}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location */}
                <Marker position={userLocation}>
                    <Popup>Você está aqui!</Popup>
                </Marker>

                {/* Blocos */}
                {blocosData.map((bloco) => (
                    bloco.latitude && bloco.longitude ? (
                        <Marker
                            key={bloco.id}
                            position={[parseFloat(bloco.latitude), parseFloat(bloco.longitude)]}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm">{bloco.nome}</h3>
                                    <p className="text-xs text-gray-600">{bloco.data} - {bloco.horario}</p>
                                    <p className="text-xs">{bloco.endereco}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};

export default MapPage;
