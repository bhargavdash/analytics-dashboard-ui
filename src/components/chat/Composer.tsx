import { useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { Button } from '../ui/button'
import { useChatStore } from '@/store/useChatStore'
import { useQueryStream } from '@/hooks/useQueryStream'

type ComposerProps = {
    placeholder?: string
    autoFocus?: boolean
}

// Single composer used for both the first question and follow-ups. It decides
// new-chat vs follow-up from the active conversation id in the store.
export const Composer = ({ placeholder, autoFocus }: ComposerProps) => {
    const [value, setValue] = useState('')
    const [nudge, setNudge] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const activeId = useChatStore((s) => s.activeId)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const { submit, stop } = useQueryStream()

    const autosize = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }

    const send = async () => {
        const q = value.trim()
        if (!q) return
        // Can't send while a turn is streaming — nudge instead of silently swallowing Enter.
        if (isStreaming) { setNudge(true); return }
        setValue('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        await submit(q, activeId)
    }

    return (
        <div
            onAnimationEnd={() => setNudge(false)}
            className={`flex items-end gap-2 rounded-xl border bg-background p-2 pl-3 shadow-sm focus-within:border-ring ${nudge ? 'animate-shake' : ''}`}
        >
            <textarea
                ref={textareaRef}
                value={value}
                autoFocus={autoFocus}
                rows={1}
                placeholder={placeholder ?? 'Ask anything about your data…'}
                onChange={(e) => { setValue(e.target.value); autosize() }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                }}
                className="flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isStreaming ? (
                <Button size="icon" variant="secondary" onClick={stop} aria-label="Stop generating">
                    <Square className="size-3.5 fill-current" />
                </Button>
            ) : (
                <Button size="icon" onClick={send} disabled={!value.trim()} aria-label="Send">
                    <ArrowUp className="size-4" />
                </Button>
            )}
        </div>
    )
}
