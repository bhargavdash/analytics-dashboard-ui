import type { Ref } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { UserMessage } from './UserMessage'
import { AssistantTurn } from './AssistantTurn'

type Props = {
    lastTurnRef: Ref<HTMLDivElement>
}

export const MessageList = ({ lastTurnRef }: Props) => {
    const turns = useChatStore((s) => s.turns)

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
            {turns.map((turn, i) => {
                const isLast = i === turns.length - 1
                return (
                    <div
                        key={turn.id}
                        ref={isLast ? lastTurnRef : undefined}
                        className="flex scroll-mt-4 flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
                    >
                        <UserMessage question={turn.question} />
                        <AssistantTurn turn={turn} isLast={isLast} />
                    </div>
                )
            })}
        </div>
    )
}
