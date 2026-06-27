import { ArrowDown } from 'lucide-react'

export const JumpToLatestPill = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-md hover:bg-accent animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
        >
            <ArrowDown className="size-3.5" />
            Jump to latest
        </button>
    )
}
