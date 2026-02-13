/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocodes an address in Belo Horizonte
 * @param {string} address - The street address
 * @param {string} neighborhood - The neighborhood
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const geocodeAddress = async (address, neighborhood) => {
    if (!address) return null;

    // Build query: "address, neighborhood, Belo Horizonte, MG, Brazil"
    const query = `${address}, ${neighborhood || ''}, Belo Horizonte, MG, Brazil`;
    const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        addressdetails: '1'
    });

    try {
        console.log(`[Geocoding] Geocoding: ${query}`);
        const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
            headers: {
                'Accept-Language': 'pt-BR',
                'User-Agent': 'TatenoApp/1.0 (leoruas@gmail.com)' // Good practice for Nominatim
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
            };
        }

        console.warn(`[Geocoding] No results found for: ${query}`);
        return null;
    } catch (error) {
        console.error('[Geocoding] Error geocoding address:', error);
        return null;
    }
};
