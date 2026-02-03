import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

describe('Code Quality Guardrails', () => {
    it('no project file should exceed 250 lines', () => {
        const srcPath = path.resolve(__dirname, '../../src');
        const files = globSync('**/*.{js,jsx,css}', {
            cwd: srcPath,
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.js', '**/*.test.jsx']
        });

        const violations = [];

        files.forEach(file => {
            const filePath = path.join(srcPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').length;

            if (lines > 250) {
                violations.push(`${file} (${lines} lines)`);
            }
        });

        expect(violations, `The following files exceed the 250-line limit:\n${violations.join('\n')}`).toHaveLength(0);
    });
});
