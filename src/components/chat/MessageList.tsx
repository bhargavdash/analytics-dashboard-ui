import { useChatStore } from '@/store/useChatStore'
import { UserMessage } from './UserMessage'
import { AssistantTurn } from './AssistantTurn'

export const MessageList = () => {
    const turns = useChatStore((s) => s.turns)

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
            {turns.map((turn, i) => (
                <div key={turn.id} className="flex flex-col gap-4">
                    <UserMessage question={turn.question} />
                    <AssistantTurn turn={turn} isLast={i === turns.length - 1} />
                </div>
            ))}
        </div>
    )
}
