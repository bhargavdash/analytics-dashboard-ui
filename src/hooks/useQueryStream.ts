import { useDashboardStore } from '@/store/useDashboardStore'
import type { Dashboard, ReasoningStep, Widget } from '@/types'

const API_URL = 'http://localhost:8001/api/v1/query'

export function useQueryStream() {
    const addDashboard = useDashboardStore((state) => state.addDashboard)
    const setStreaming = useDashboardStore((state) => state.setStreaming)

    const submit = async (question: string) => {
        setStreaming(true)
        const reasoningSteps: ReasoningStep[] = []

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        })

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const chunks = buffer.split('\n\n')
            buffer = chunks.pop() ?? ''

            for (const chunk of chunks) {
                if (!chunk.trim()) continue

                let eventType = ''
                let dataLine = ''

                for (const line of chunk.split('\n')) {
                    if (line.startsWith('event: ')) eventType = line.slice(7)
                    if (line.startsWith('data: ')) dataLine = line.slice(6)
                }

                if (!eventType || !dataLine) continue
                const payload = JSON.parse(dataLine)

                if (eventType === 'reasoning') {
                    reasoningSteps.push({ title: payload.message, tool: payload.step })
                }

                if (eventType === 'dashboard') {
                    const dashboard: Dashboard = {
                        id: crypto.randomUUID(),
                        title: question,
                        query: question,
                        dataset: 'sales',
                        createdAt: new Date().toISOString(),
                        widgetCount: payload.widgets.length,
                        widgets: payload.widgets as Widget[],
                        summary: payload.summary,
                        reasoningSteps,
                    }
                    addDashboard(dashboard)
                }
            }
        }

        setStreaming(false)
    }

    return { submit }
}