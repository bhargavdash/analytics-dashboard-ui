import { useChatStore } from '@/store/useChatStore'
import { useStickToBottom } from '@/hooks/useStickToBottom'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { JumpToLatestPill } from './JumpToLatestPill'

export const ChatThread = () => {
    const turns = useChatStore((s) => s.turns)
    const { ref, stuck, handleScroll, scrollToBottom } = useStickToBottom(turns)

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            <div ref={ref} onScroll={handleScroll} className="flex-1 overflow-y-auto">
                <MessageList />
            </div>

            {!stuck && <JumpToLatestPill onClick={scrollToBottom} />}

            <div className="border-t bg-background px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    <Composer placeholder="Ask a follow-up about your data…" />
                </div>
            </div>
        </div>
    )
}
