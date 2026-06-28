/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Standalone Vitest config (kept separate from vite.config.ts so the dev/build pipeline and
// the test pipeline don't share plugin surprises — e.g. the Tailwind plugin isn't needed to
// run unit/component tests, and leaving it out keeps the test runner fast).
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        css: false,
    },
})
