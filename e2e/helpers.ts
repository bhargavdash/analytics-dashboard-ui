import { Page, expect } from '@playwright/test'

// Shared E2E helpers. These assert on STRUCTURE (a chart rendered, reasoning streamed, an
// insight paragraph filled in) rather than exact LLM wording, which is non-deterministic.

export const composer = (page: Page) => page.getByRole('textbox', { name: /ask a question/i })

// Send a question through whichever composer is visible (empty hero or follow-up).
export async function ask(page: Page, question: string) {
    const box = composer(page).first()
    await box.fill(question)
    await box.press('Enter')
}

// Wait for the reasoning trace to appear (the agent has started working).
export async function expectReasoning(page: Page) {
    // The reasoning disclosure renders a tool pill ("route") as the first step.
    await expect(page.getByText('route', { exact: true }).first()).toBeVisible({ timeout: 30_000 })
}

// Wait for a streamed insight paragraph to contain text.
export async function expectInsight(page: Page) {
    const insight = page.locator('p.text-foreground').first()
    await expect(insight).toBeVisible({ timeout: 60_000 })
    await expect(insight).not.toBeEmpty()
}

// Wait for at least one Recharts chart to mount (lazy-loaded after the dashboard event).
export async function expectChart(page: Page) {
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible({ timeout: 60_000 })
}
