import { ArrowDown } from 'lucide-react'

export const JumpToLatestPill = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-md hover:bg-accent"
        >
            <ArrowDown className="size-3.5" />
            Jump to latest
        </button>
    )
}
