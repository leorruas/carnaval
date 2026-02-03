import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrandLogo from './BrandLogo';

describe('BrandLogo', () => {
    it('renders without crashing', () => {
        render(<BrandLogo />);
        // The component renders an SVG, we can check for the svg element
        const svgElement = document.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
    });

    it('matches snapshot', () => {
        const { container } = render(<BrandLogo />);
        expect(container).toMatchSnapshot();
    });

    it('applies custom className', () => {
        const { container } = render(<BrandLogo className="test-class" />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveClass('test-class');
    });
});
