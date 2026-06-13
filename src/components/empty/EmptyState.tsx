import { SEED_EXAMPLES } from "@/data/seed"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useState } from "react"


export const EmptyState = () => {
    const [query, setQuery] = useState("");

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-8 p-8 max-w-2xl mx-auto">

            {/* 1. Headline */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-semibold">Ask anything about your data</h1>
                <p className="text-muted-foreground text-sm">Choose a dataset, type a question, and Helix builds your dashboard.</p>
            </div>

            {/* 2. Example chips — map over SEED_EXAMPLES */}
            <div className="flex flex-wrap gap-2 justify-center">
                {SEED_EXAMPLES.map((ex) => (
                    <Button key={ex.title} variant="outline" size="sm" onClick={() => setQuery(ex.title)}>
                        {ex.title}
                    </Button>
                ))}
            </div>

            {/* 3. Composer */}
            <div className="w-full flex flex-col gap-3">
                <Textarea
                    placeholder="e.g. Show monthly revenue trend for 2026..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button disabled={!query.trim()}>Analyse</Button>
                </div>
            </div>

        </div>
    )
}