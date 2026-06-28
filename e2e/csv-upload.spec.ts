import path from 'path'
import { fileURLToPath } from 'url'
import { test, expect } from '@playwright/test'
import { ask, expectChart } from './helpers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixtures', 'sample.csv')

test.describe('Bring-your-own-data — CSV upload', () => {
    test('upload a CSV → schema preview → ask → chart', async ({ page }) => {
        await page.goto('/')

        // Drive the hidden file input directly (the reliable Playwright path for uploads).
        await page.setInputFiles('input[type="file"]', FIXTURE)

        // The schema preview card reports the shape of the ingested file.
        await expect(page.getByText(/5 rows · 3 columns/i)).toBeVisible({ timeout: 30_000 })
        // ...and the LLM-suggested starter questions appear.
        await expect(page.getByText(/try asking:/i)).toBeVisible()
        // Column chips from the uploaded schema.
        await expect(page.getByText('revenue', { exact: true })).toBeVisible()

        // Ask an explicit question against the uploaded dataset.
        await ask(page, 'Show total revenue for each product')
        await expectChart(page)
    })
})
