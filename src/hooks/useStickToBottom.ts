import { useCallback, useEffect, useRef, useState } from 'react'

// Keeps a scroll container pinned to the bottom while content streams in —
// but yields control the moment the user scrolls up, surfacing a "jump to latest"
// affordance instead of fighting them. `dep` should change on every new content
// tick (e.g. the turns array) so we re-pin while stuck.
export function useStickToBottom(dep: unknown) {
    const ref = useRef<HTMLDivElement>(null)
    const [stuck, setStuck] = useState(true)

    const handleScroll = useCallback(() => {
        const el = ref.current
        if (!el) return
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        setStuck(distanceFromBottom < 80)
    }, [])

    useEffect(() => {
        if (stuck && ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight
        }
    }, [dep, stuck])

    const scrollToBottom = useCallback(() => {
        const el = ref.current
        if (el) el.scrollTop = el.scrollHeight
        setStuck(true)
    }, [])

    return { ref, stuck, handleScroll, scrollToBottom }
}
