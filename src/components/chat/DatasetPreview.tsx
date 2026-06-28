import { FileSpreadsheet, X } from 'lucide-react'
import type { Dataset } from '@/types'
import { useChatStore } from '@/store/useChatStore'
import { useQueryStream } from '@/hooks/useQueryStream'

const MAX_COLS_SHOWN = 8

// Schema-preview card shown in the empty state after an upload: filename, shape,
// column chips, and the LLM-suggested starter questions (which kick off a scoped chat).
export const DatasetPreview = ({ dataset }: { dataset: Dataset }) => {
    const isStreaming = useChatStore((s) => s.isStreaming)
    const setActiveDataset = useChatStore((s) => s.setActiveDataset)
    const { submit } = useQueryStream()

    const extraCols = dataset.columns.length - MAX_COLS_SHOWN

    return (
        <div className="rounded-xl border bg-card p-4 text-left shadow-sm">
            <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 shrink-0 text-primary" />
                <span className="truncate text-sm font-medium">{dataset.name}</span>
                <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                    {dataset.row_count.toLocaleString()} rows · {dataset.columns.length} columns
                </span>
                <button
                    aria-label="Use the demo dataset instead"
                    onClick={() => setActiveDataset(null)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
                {dataset.columns.slice(0, MAX_COLS_SHOWN).map((c) => (
                    <span
                        key={c.name}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                        {c.name}
                    </span>
                ))}
                {extraCols > 0 && (
                    <span className="px-1 py-0.5 text-[11px] text-muted-foreground">
                        +{extraCols} more
                    </span>
                )}
            </div>

            {dataset.suggestions.length > 0 && (
                <div className="mt-3 border-t pt-3">
                    <p className="mb-2 text-xs text-muted-foreground">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                        {dataset.suggestions.map((q) => (
                            <button
                                key={q}
                                disabled={isStreaming}
                                onClick={() => submit(q, null)}
                                className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
