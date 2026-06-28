import { test, expect } from '@playwright/test'
import { ask, composer, expectReasoning, expectInsight, expectChart } from './helpers'

test.describe('Golden path — demo dataset', () => {
    test('empty state → ask → reasoning → insight → chart', async ({ page }) => {
        await page.goto('/')

        // Empty state shows the hero + suggestion chips.
        await expect(page.getByRole('heading', { name: /talk to your data/i })).toBeVisible()
        // exact:true so it doesn't also match sidebar "Rename …"/"Delete …" buttons that
        // carry the same conversation title in their aria-label.
        await expect(
            page.getByRole('button', { name: 'Compare revenue by product category', exact: true }),
        ).toBeVisible()

        // A question with no date filter returns data regardless of "today".
        await ask(page, 'Compare total revenue by region')

        await expectReasoning(page)
        await expectInsight(page)
        await expectChart(page)
    })

    test('follow-up question appends a second turn', async ({ page }) => {
        await page.goto('/')
        await ask(page, 'Compare total revenue by region')
        await expectChart(page) // wait for the first turn to finish

        // The user's question renders in a right-aligned bubble; there should be exactly one.
        const userBubbles = page.getByTestId('user-message')
        await expect(userBubbles).toHaveCount(1)

        await ask(page, 'Now show total revenue by status')
        // A second user bubble appears → the thread grew.
        await expect(userBubbles).toHaveCount(2)
        await expect(page.locator('svg.recharts-surface').nth(0)).toBeVisible()
    })
})

test.describe('Error handling', () => {
    test('a network failure surfaces an in-turn error state', async ({ page }) => {
        await page.goto('/')
        // Abort the streaming request so the fetch rejects mid-flight.
        await page.route('**/api/v1/query', (route) => route.abort())

        await composer(page).first().fill('Compare total revenue by region')
        await composer(page).first().press('Enter')

        // The assistant turn shows the destructive error box instead of a chart.
        await expect(page.getByText(/something went wrong|failed|error/i).first()).toBeVisible({
            timeout: 20_000,
        })
    })
})

test.describe('Conversation management', () => {
    test('rename a conversation in the sidebar', async ({ page }) => {
        await page.goto('/')

        // A greeting creates a conversation quickly (router → greeting, no SQL).
        await ask(page, 'hello')
        // Wait until the conversation shows up in the sidebar list.
        const list = page.getByRole('listbox', { name: /conversations/i })
        const firstOption = list.getByRole('option').first()
        await expect(firstOption).toBeVisible({ timeout: 30_000 })

        // Reveal the row actions and click Rename.
        await firstOption.hover()
        await firstOption.getByRole('button', { name: /^rename/i }).click()

        const renameInput = page.getByRole('textbox', { name: /^rename/i })
        const newName = `Renamed ${Date.now()}`
        await renameInput.fill(newName)
        await renameInput.press('Enter')

        await expect(list.getByText(newName).first()).toBeVisible()
    })
})
