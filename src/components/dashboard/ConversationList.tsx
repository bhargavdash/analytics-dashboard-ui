import { useEffect, useRef, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ConversationMeta } from '@/types'

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

type Props = {
    conversations: ConversationMeta[]
    activeId: string | null
    onOpen: (id: string) => void
    onRemove: (id: string) => void
    onRename: (id: string, title: string) => void
}

// The sidebar conversation list. Two résumé-grade concerns live here:
//
//  • PERFORMANCE — the list is windowed with TanStack Virtual once it grows past a threshold,
//    so a history of hundreds of conversations only ever mounts the ~dozen rows on screen.
//    Row heights vary (a dataset badge adds a line), so each row is dynamically measured.
//
//  • ACCESSIBILITY — the list is a `role="listbox"` of `role="option"`s with roving tabindex:
//    one Tab stop lands you in the list, then Up/Down arrows move selection (and Enter opens),
//    the standard listbox keyboard contract. Selection follows `activeId`.
const VIRTUALIZE_THRESHOLD = 50

export const ConversationList = ({ conversations, activeId, onOpen, onRemove, onRename }: Props) => {
    const parentRef = useRef<HTMLDivElement>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draft, setDraft] = useState('')
    // Roving-tabindex cursor: which row currently owns the single Tab stop.
    const [cursor, setCursor] = useState(0)

    const virtualizer = useVirtualizer({
        count: conversations.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 8,
        // Virtualization kicks in only for long histories; short lists render in full so the
        // sidebar stays dead-simple (and measurement quirks can't bite the common case).
        enabled: conversations.length > VIRTUALIZE_THRESHOLD,
    })

    // Keep the cursor pointing at the active conversation when it changes (e.g. opened from
    // elsewhere), so arrow-keying starts from the right place.
    useEffect(() => {
        const idx = conversations.findIndex((c) => c.id === activeId)
        if (idx >= 0) setCursor(idx)
    }, [activeId, conversations])

    const commitRename = (id: string) => {
        if (draft.trim()) onRename(id, draft)
        setEditingId(null)
    }

    const focusRow = (index: number) => {
        virtualizer.scrollToIndex(index, { align: 'auto' })
        // Wait a frame so a newly-virtualized row is in the DOM before we focus it.
        requestAnimationFrame(() => {
            parentRef.current
                ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
                ?.focus()
        })
    }

    const onListKeyDown = (e: React.KeyboardEvent) => {
        if (editingId) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            const next = Math.min(cursor + 1, conversations.length - 1)
            setCursor(next)
            focusRow(next)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            const next = Math.max(cursor - 1, 0)
            setCursor(next)
            focusRow(next)
        } else if (e.key === 'Home') {
            e.preventDefault()
            setCursor(0)
            focusRow(0)
        } else if (e.key === 'End') {
            e.preventDefault()
            const last = conversations.length - 1
            setCursor(last)
            focusRow(last)
        }
    }

    const virtualizing = conversations.length > VIRTUALIZE_THRESHOLD
    const items = virtualizer.getVirtualItems()

    const renderRow = (convo: ConversationMeta, index: number) => {
        const selected = convo.id === activeId
        if (editingId === convo.id) {
            return (
                <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commitRename(convo.id)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(convo.id)
                        if (e.key === 'Escape') setEditingId(null)
                    }}
                    aria-label={`Rename ${convo.title}`}
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            )
        }
        return (
            <div
                role="option"
                aria-selected={selected}
                data-index={index}
                tabIndex={index === cursor ? 0 : -1}
                onClick={() => onOpen(convo.id)}
                onFocus={() => setCursor(index)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onOpen(convo.id)
                    } else if (e.key === 'F2') {
                        e.preventDefault()
                        setEditingId(convo.id)
                        setDraft(convo.title)
                    }
                }}
                className={`group/item relative flex cursor-pointer flex-col items-start gap-0.5 rounded-md px-2 py-2 pr-14 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'bg-sidebar-accent' : ''}`}
            >
                <span className="line-clamp-1 text-sm font-medium leading-tight">{convo.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                    {relativeTime(convo.updated_at)} · {convo.turn_count}{' '}
                    {convo.turn_count === 1 ? 'turn' : 'turns'}
                </span>
                {convo.dataset && convo.dataset !== 'sales' && (
                    <span className="mt-0.5 max-w-full truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {convo.dataset}
                    </span>
                )}
                <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
                    <button
                        aria-label={`Rename ${convo.title}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            setEditingId(convo.id)
                            setDraft(convo.title)
                        }}
                        className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <Pencil className="size-3.5" />
                    </button>
                    <button
                        aria-label={`Delete ${convo.title}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove(convo.id)
                        }}
                        className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </div>
        )
    }

    if (conversations.length === 0) {
        return (
            <p className="px-2 py-4 text-xs text-muted-foreground">
                No conversations yet — ask a question to begin.
            </p>
        )
    }

    return (
        <div
            ref={parentRef}
            role="listbox"
            aria-label="Conversations"
            aria-activedescendant={undefined}
            onKeyDown={onListKeyDown}
            className="max-h-full flex-1 overflow-y-auto px-2"
        >
            {virtualizing ? (
                <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
                    {items.map((vi) => (
                        <div
                            key={conversations[vi.index].id}
                            ref={virtualizer.measureElement}
                            data-vindex={vi.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${vi.start}px)`,
                            }}
                            className="pb-1"
                        >
                            {renderRow(conversations[vi.index], vi.index)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {conversations.map((convo, index) => (
                        <div key={convo.id}>{renderRow(convo, index)}</div>
                    ))}
                </div>
            )}
        </div>
    )
}
