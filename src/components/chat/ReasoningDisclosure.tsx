import { useEffect, useState } from 'react'
import { ChevronRight, Loader2, Check } from 'lucide-react'
import type { ReasoningStep, TurnStatus } from '@/types'

type Props = {
    steps: ReasoningStep[]
    status: TurnStatus
}

// Per-turn collapsible "thought process" (replaces the old global drawer).
// Auto-expanded while streaming; collapses once the turn completes.
export const ReasoningDisclosure = ({ steps, status }: Props) => {
    const [open, setOpen] = useState(true)

    useEffect(() => {
        if (status !== 'streaming') setOpen(false)
    }, [status])

    if (steps.length === 0 && status !== 'streaming') return null

    const last = steps.at(-1)

    return (
        <div className="rounded-lg border bg-muted/40">
            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground"
            >
                {status === 'streaming'
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <Check className="size-3.5 text-emerald-500" />}
                <span className="font-medium">
                    {status === 'streaming'
                        ? (last?.title ?? 'Thinking…')
                        : `Reasoned through ${steps.length} step${steps.length === 1 ? '' : 's'}`}
                </span>
                <ChevronRight className={`ml-auto size-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>

            {open && (
                <div className="flex flex-col gap-2 border-t px-3 py-2.5">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 animate-in fade-in slide-in-from-left-1 duration-300 motion-reduce:animate-none"
                        >
                            <span className="mt-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                {step.tool}
                            </span>
                            <span className="text-xs leading-relaxed">{step.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
