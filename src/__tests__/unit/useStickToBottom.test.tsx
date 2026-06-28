import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useStickToBottom } from '@/hooks/useStickToBottom'

// A controllable IntersectionObserver: capture the callback so a test can simulate the
// sentinel entering / leaving the viewport.
type IOCallback = (entries: { isIntersecting: boolean }[]) => void
let lastCallback: IOCallback | null = null

class MockIntersectionObserver {
    constructor(cb: IOCallback) {
        lastCallback = cb
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}

const trigger = (isIntersecting: boolean) =>
    act(() => lastCallback?.([{ isIntersecting }]))

// Render the hook with two real DOM nodes for scroll root + sentinel.
function setup(isStreaming = false) {
    return renderHook(() => {
        const scrollRef = useRef(document.createElement('div'))
        const sentinelRef = useRef(document.createElement('div'))
        return useStickToBottom(scrollRef, sentinelRef, isStreaming)
    })
}

describe('useStickToBottom', () => {
    beforeEach(() => {
        lastCallback = null
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    })
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('defaults to atBottom=true (showPill=false) before any observation', () => {
        const { result } = setup()
        expect(result.current.atBottom).toBe(true)
        expect(result.current.showPill).toBe(false)
    })

    it('flips to not-at-bottom (showPill=true) when the sentinel leaves the viewport', () => {
        const { result } = setup()
        trigger(false)
        expect(result.current.atBottom).toBe(false)
        expect(result.current.showPill).toBe(true)
    })

    it('flips back to at-bottom when the sentinel re-enters', () => {
        const { result } = setup()
        trigger(false)
        expect(result.current.atBottom).toBe(false)
        trigger(true)
        expect(result.current.atBottom).toBe(true)
        expect(result.current.showPill).toBe(false)
    })

    it('markNotAtBottom optimistically releases the follow', () => {
        const { result } = setup()
        expect(result.current.atBottom).toBe(true)
        act(() => result.current.markNotAtBottom())
        expect(result.current.atBottom).toBe(false)
        expect(result.current.showPill).toBe(true)
    })

    it('observes the sentinel node on mount', () => {
        setup()
        // The mock recorded a callback, meaning an observer was constructed and wired up.
        expect(lastCallback).toBeTypeOf('function')
    })
})
