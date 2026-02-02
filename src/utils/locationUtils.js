/**
 * Serviço de localização e rotas usando OSRM (OpenStreetMap Routing Machine)
 * 100% GRATUITO e sem necessidade de API key
 */

const OSRM_SERVER = 'https://router.project-osrm.org/route/v1';

/**
 * Obtém a localização atual do usuário
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Calcula a distância e tempo de viagem entre dois pontos usando OSRM
 * @param {Object} from - {lat, lng}
 * @param {Object} to - {lat, lng}
 * @returns {Promise<Object>} Distância em km, metros e tempo em minutos
 */
export const calculateRoute = async (from, to) => {
  try {
    const url = `${OSRM_SERVER}/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok') {
      throw new Error('Erro ao calcular rota');
    }
    
    const route = data.routes[0];
    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMin = Math.ceil(route.duration / 60);
    
    return {
      distanceKm: parseFloat(distanceKm),
      distanceMeters: route.distance,
      durationMinutes: durationMin,
      durationText: formatDuration(durationMin)
    };
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    // Fallback: calcular distância em linha reta
    const distance = haversineDistance(from, to);
    const estimatedTime = Math.ceil(distance / 0.5); // Assumir ~30 km/h média
    
    return {
      distanceKm: distance,
      distanceMeters: distance * 1000,
      durationMinutes: estimatedTime,
      durationText: formatDuration(estimatedTime),
      isEstimated: true
    };
  }
};

/**
 * Calcula distância em linha reta entre dois pontos (Haversine)
 * @param {Object} from - {lat, lng}
 * @param {Object} to - {lat, lng}
 * @returns {number} Distância em km
 */
const haversineDistance = (from, to) => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};

const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Formata duração em minutos para texto legível
 * @param {number} minutes
 * @returns {string}
 */
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

/**
 * Estima preço de Uber baseado na distância
 * Média BH: ~R$ 3,50 por km + R$ 5 de bandeirada
 * @param {number} distanceKm
 * @returns {Object} Preço mínimo e máximo estimados
 */
export const estimateUberPrice = (distanceKm) => {
  const basePrice = 5.0;
  const pricePerKm = 3.5;
  
  const estimatedPrice = basePrice + (distanceKm * pricePerKm);
  
  // Margem de variação de 15%
  const minPrice = estimatedPrice * 0.85;
  const maxPrice = estimatedPrice * 1.15;
  
  return {
    min: minPrice.toFixed(2),
    max: maxPrice.toFixed(2),
    estimated: estimatedPrice.toFixed(2),
    formatted: `R$ ${minPrice.toFixed(2)} - R$ ${maxPrice.toFixed(2)}`
  };
};

/**
 * Gera URL para abrir Google Maps com rota de transporte público
 * @param {Object} from - {lat, lng}
 * @param {Object} to - {lat, lng}
 * @returns {string} URL do Google Maps
 */
export const getGoogleMapsTransitUrl = (from, to) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=transit`;
};

/**
 * Gera deep link para abrir o app do Uber
 * @param {Object} to - {lat, lng, name}
 * @returns {string} Deep link do Uber
 */
export const getUberDeepLink = (to) => {
  const dropoffName = encodeURIComponent(to.name || 'Bloco de Carnaval');
  return `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${to.lat}&dropoff[longitude]=${to.lng}&dropoff[nickname]=${dropoffName}`;
};

/**
 * Gera URL alternativa do Uber (caso deep link não funcione)
 * @param {Object} to - {lat, lng}
 * @returns {string} URL web do Uber
 */
export const getUberWebUrl = (to) => {
  return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${to.lat}&dropoff[longitude]=${to.lng}`;
};

/**
 * Gera deep link para o app do 99
 * @param {Object} to - {lat, lng}
 * @returns {string} Deep link do 99
 */
export const get99DeepLink = (to) => {
  return `99app://ride?destinationLatitude=${to.lat}&destinationLongitude=${to.lng}`;
};
