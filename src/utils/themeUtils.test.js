import { describe, it, expect } from 'vitest';
import { getDateTheme, BRAND_COLORS } from './themeUtils';

describe('themeUtils', () => {
    describe('getDateTheme', () => {
        it('should return a theme object for a valid date', () => {
            const theme = getDateTheme('2026-02-14');
            expect(theme).toHaveProperty('color');
            expect(theme).toHaveProperty('name');
        });

        it('should return the same theme for the same date (deterministic)', () => {
            const date = '2026-02-14';
            const theme1 = getDateTheme(date);
            const theme2 = getDateTheme(date);
            expect(theme1).toEqual(theme2);
        });

        it('should return different themes for different dates (distribution)', () => {
            const themes = new Set();
            ['2026-02-13', '2026-02-14', '2026-02-15', '2026-02-16'].forEach(date => {
                themes.add(getDateTheme(date).name);
            });
            expect(themes.size).toBeGreaterThan(1);
        });

        it('should use valid brand colors', () => {
            const theme = getDateTheme('2026-02-14');
            const validValues = Object.values(BRAND_COLORS);
            expect(validValues).toContain(theme.color);
        });

        // Safety check - light yellow should strictly NOT be in the rotated themes
        it('should NEVER return light yellow for a date theme', () => {
            // Check a large range to be sure
            for (let i = 0; i < 100; i++) {
                const date = `2026-02-${i}`;
                const theme = getDateTheme(date);
                expect(theme.color).not.toBe(BRAND_COLORS.light);
            }
        });
    });
});
