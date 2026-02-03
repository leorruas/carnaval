import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock framer-motion globally
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (_, prop) => {
            const Component = ({ children, style, ...props }) => {
                // Ignore style prop in tests
                return React.createElement(typeof prop === 'string' ? prop : 'div', props, children);
            };
            Component.displayName = `motion.${String(prop)}`;
            return Component;
        }
    }),
    AnimatePresence: ({ children }) => children,
    useScroll: () => ({ scrollY: { onChange: vi.fn(), get: () => 0 } }),
    useTransform: () => ({ get: () => 0 }),
}));

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
