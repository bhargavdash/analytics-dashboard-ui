import { SEED_EXAMPLES } from '@/data/seed'
import { useChatStore } from '@/store/useChatStore'
import { useQueryStream } from '@/hooks/useQueryStream'
import { Composer } from './Composer'

// Shown when the active thread is empty: centered hero + suggestions + composer.
export const EmptyHero = () => {
    const isStreaming = useChatStore((s) => s.isStreaming)
    const { submit } = useQueryStream()

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-semibold">Talk to your data</h1>
                    <p className="text-sm text-muted-foreground">
                        Ask a question in plain English — Helix writes the SQL, runs it, and charts the answer.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {SEED_EXAMPLES.map((ex) => (
                        <button
                            key={ex.title}
                            disabled={isStreaming}
                            onClick={() => submit(ex.title, null)}
                            className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent disabled:opacity-50"
                        >
                            {ex.title}
                        </button>
                    ))}
                </div>

                <Composer autoFocus placeholder="e.g. Show monthly revenue trend for 2026…" />
            </div>
        </div>
    )
}
