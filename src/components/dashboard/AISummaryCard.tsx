import { Cpu, Database } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import type { Dashboard } from "@/types"

export const AISummaryCard = ({ dashboard }: { dashboard: Dashboard }) => {
    return (
        <Card>
            <CardContent>
                <p>{dashboard.summary}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Database className="size-3.5" />
                        <span>{dashboard.dataset}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Cpu className="size-3.5" />
                        <span>{dashboard.reasoningSteps.length} reasoning steps</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}