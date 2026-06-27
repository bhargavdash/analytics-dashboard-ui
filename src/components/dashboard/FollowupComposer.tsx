import { useState } from "react"
import { ArrowUp } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useDashboardStore } from "@/store/useDashboardStore"
import { useQueryStream } from "@/hooks/useQueryStream"

// Asks a follow-up on the active conversation. The backend feeds prior turns to
// the SQL generator, so "break that down by region" resolves against the last query.
export const FollowupComposer = () => {
    const [question, setQuestion] = useState("")
    const activeId = useDashboardStore((s) => s.activeId)
    const isStreaming = useDashboardStore((s) => s.isStreaming)
    const { submit } = useQueryStream()

    const send = async () => {
        const q = question.trim()
        if (!q || !activeId || isStreaming) return
        setQuestion("")
        await submit(q, activeId)
    }

    return (
        <div className="sticky bottom-4 mt-2">
            <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-sm">
                <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') send() }}
                    placeholder="Ask a follow-up — e.g. “now break that down by region”"
                    disabled={isStreaming}
                    className="border-0 shadow-none focus-visible:ring-0"
                />
                <Button size="icon" onClick={send} disabled={!question.trim() || isStreaming}>
                    <ArrowUp className="size-4" />
                </Button>
            </div>
        </div>
    )
}
