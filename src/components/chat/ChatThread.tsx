import { useChatStore } from '@/store/useChatStore'
import { useConversationScroll } from '@/hooks/useConversationScroll'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { JumpToLatestPill } from './JumpToLatestPill'

export const ChatThread = () => {
    const turns = useChatStore((s) => s.turns)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const { scrollRef, lastTurnRef, bottomRef, showPill, scrollToLatest } =
        useConversationScroll(turns.length, isStreaming)

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* The scroll area is its own positioning context so the pill hugs ITS bottom
                edge (just above the composer) regardless of how tall the composer grows. */}
            <div className="relative min-h-0 flex-1">
                <div ref={scrollRef} className="absolute inset-0 overflow-y-auto">
                    <MessageList lastTurnRef={lastTurnRef} />
                    {/* Sentinel: "bottom of the conversation" — drives the pill + follow. */}
                    <div ref={bottomRef} aria-hidden className="h-px" />
                    {/* Lets the newest turn scroll up to the top of the viewport. */}
                    <div aria-hidden className="h-[40vh]" />
                </div>

                {showPill && <JumpToLatestPill onClick={scrollToLatest} />}
            </div>

            <div className="border-t bg-background px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    <Composer placeholder="Ask a follow-up about your data…" />
                    <p className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground">
                        Enter to send · Shift+Enter for a new line
                    </p>
                </div>
            </div>
        </div>
    )
}
