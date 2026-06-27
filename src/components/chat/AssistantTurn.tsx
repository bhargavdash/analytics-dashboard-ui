import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ChatTurn } from '@/types'
import { useChatStore } from '@/store/useChatStore'
import { useQueryStream } from '@/hooks/useQueryStream'
import { ReasoningDisclosure } from './ReasoningDisclosure'
import { WidgetGrid } from './WidgetGrid'
import { Button } from '../ui/button'

type Props = {
    turn: ChatTurn
    isLast: boolean
}

export const AssistantTurn = ({ turn, isLast }: Props) => {
    const activeId = useChatStore((s) => s.activeId)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const { retry } = useQueryStream()

    return (
        <div className="flex flex-col gap-3">
            {/* The disclosure's live spinner is the progress indicator — no separate
                "building…" placeholder, so greetings (no chart) don't flash one. */}
            <ReasoningDisclosure steps={turn.reasoningSteps} status={turn.status} />

            {turn.summary && (
                <p className="text-sm leading-relaxed text-foreground">{turn.summary}</p>
            )}

            <WidgetGrid widgets={turn.widgets} />

            {turn.status === 'error' && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{turn.error ?? 'Something went wrong.'}</span>
                </div>
            )}

            {isLast && turn.status !== 'streaming' && !isStreaming && (
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => retry(activeId)}
                    >
                        <RefreshCw className="size-3.5" />
                        Retry
                    </Button>
                </div>
            )}
        </div>
    )
}
