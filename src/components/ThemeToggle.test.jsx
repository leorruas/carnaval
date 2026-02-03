import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
    it('toggles theme when clicked', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');

        // Initial state (assuming light by default in test env)
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
