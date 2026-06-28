import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees between tests so queries don't bleed across cases.
afterEach(() => {
    cleanup()
})

// --- jsdom doesn't implement these browser APIs; provide minimal, inert mocks so modules
//     that touch them at import time (the store reads matchMedia) or render time don't throw.
//     Tests that need to *drive* these APIs (e.g. useStickToBottom) override them locally. ---

if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }))
}

class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return []
    }
}

globalThis.IntersectionObserver =
    globalThis.IntersectionObserver ?? (NoopObserver as unknown as typeof IntersectionObserver)
globalThis.ResizeObserver =
    globalThis.ResizeObserver ?? (NoopObserver as unknown as typeof ResizeObserver)

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn()
}
