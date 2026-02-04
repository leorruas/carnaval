/**
 * Normalizes text for search and comparison.
 * Removes accents/diacritics and converts to lowercase.
 * Example: "São Paulo" -> "sao paulo"
 * 
 * @param {string} text - The text to normalize
 * @returns {string} - The normalized text
 */
export const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toString()
        .normalize('NFD') // Decompose combined characters (e.g. 'é' -> 'e' + '´')
        .replace(/[\u0300-\u036f]/g, "") // Remove the diacritics
        .toLowerCase(); // Convert to lowercase
};
