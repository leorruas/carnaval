/**
 * Strict Brand Palette
 */
export const BRAND_COLORS = {
    green: '#00CE65',
    pink: '#FF00ED',
    orange: '#FF6616',
    blue: '#4E48FF',
    light: '#E4FFAA', // Background only!
};

/**
 * Valid themes for text/icons/borders (High contrast required)
 * Excludes light (yellow) which is background-only.
 */
const DATE_THEMES = [
    {
        name: 'green',
        color: BRAND_COLORS.green,
        // Tailwind classes for easy usage
        textClass: 'text-[#00CE65]',
        bgClass: 'bg-[#00CE65]',
        borderClass: 'border-[#00CE65]',
    },
    {
        name: 'pink',
        color: BRAND_COLORS.pink,
        textClass: 'text-[#FF00ED]',
        bgClass: 'bg-[#FF00ED]',
        borderClass: 'border-[#FF00ED]',
    },
    {
        name: 'orange',
        color: BRAND_COLORS.orange,
        textClass: 'text-[#FF6616]',
        bgClass: 'bg-[#FF6616]',
        borderClass: 'border-[#FF6616]',
    },
    {
        name: 'blue',
        color: BRAND_COLORS.blue,
        textClass: 'text-[#4E48FF]',
        bgClass: 'bg-[#4E48FF]',
        borderClass: 'border-[#4E48FF]',
    },
];

/**
 * Deterministically assigns a brand theme based on a DATE string (YYYY-MM-DD).
 * Ensures all blocks on the same day get the same accent color.
 */
export const getDateTheme = (dateString) => {
    if (!dateString) return DATE_THEMES[0];

    // Hash based on the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use absolute value
    const index = Math.abs(hash) % DATE_THEMES.length;

    return DATE_THEMES[index];
};

/**
 * @deprecated Use getDateTheme for new logic. Kept for backward compatibility if needed.
 */
export const getVibrantStyle = (id) => {
    // Fallback to simple deterministic assignment if still used
    const themes = DATE_THEMES;
    let hash = 0;
    if (id) {
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    const index = Math.abs(hash) % themes.length;
    return themes[index];
};
