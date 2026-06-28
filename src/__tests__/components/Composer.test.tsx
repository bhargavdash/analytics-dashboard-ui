import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Composer } from '@/components/chat/Composer'
import { useChatStore } from '@/store/useChatStore'

// Capture the streaming hook's actions so we can assert what the Composer triggers.
const mocks = vi.hoisted(() => ({ submit: vi.fn(), stop: vi.fn() }))
vi.mock('@/hooks/useQueryStream', () => ({
    useQueryStream: () => ({ submit: mocks.submit, stop: mocks.stop, retry: vi.fn() }),
}))

const resetStore = () => useChatStore.setState({ isStreaming: false, activeId: null })

describe('Composer', () => {
    beforeEach(() => {
        mocks.submit.mockReset()
        mocks.stop.mockReset()
        resetStore()
    })

    it('sends on Enter with the trimmed question and clears the field', async () => {
        const user = userEvent.setup()
        render(<Composer />)
        const textarea = screen.getByRole('textbox')
        await user.type(textarea, '  top regions  ')
        await user.keyboard('{Enter}')

        expect(mocks.submit).toHaveBeenCalledTimes(1)
        expect(mocks.submit).toHaveBeenCalledWith('top regions', null)
        expect(textarea).toHaveValue('')
    })

    it('Shift+Enter inserts a newline instead of sending', async () => {
        const user = userEvent.setup()
        render(<Composer />)
        const textarea = screen.getByRole('textbox')
        await user.type(textarea, 'line one')
        await user.keyboard('{Shift>}{Enter}{/Shift}')
        await user.type(textarea, 'line two')

        expect(mocks.submit).not.toHaveBeenCalled()
        expect(textarea).toHaveValue('line one\nline two')
    })

    it('does not send empty / whitespace-only input', async () => {
        const user = userEvent.setup()
        render(<Composer />)
        await user.type(screen.getByRole('textbox'), '   ')
        await user.keyboard('{Enter}')
        expect(mocks.submit).not.toHaveBeenCalled()
    })

    it('disables sending while streaming: shows Stop, and Enter shakes instead of submitting', async () => {
        const user = userEvent.setup()
        useChatStore.setState({ isStreaming: true })
        render(<Composer />)

        // The send affordance is replaced by a Stop button while streaming.
        expect(screen.getByRole('button', { name: /stop generating/i })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^send$/i })).not.toBeInTheDocument()

        const textarea = screen.getByRole('textbox')
        await user.type(textarea, 'a follow-up')
        await user.keyboard('{Enter}')

        // Enter mid-stream must NOT submit...
        expect(mocks.submit).not.toHaveBeenCalled()
        // ...and the composer shell gets the shake feedback class.
        const shell = textarea.parentElement as HTMLElement
        expect(shell.className).toContain('animate-shake')
    })

    it('clicking Stop while streaming calls stop()', async () => {
        const user = userEvent.setup()
        useChatStore.setState({ isStreaming: true })
        render(<Composer />)
        await user.click(screen.getByRole('button', { name: /stop generating/i }))
        expect(mocks.stop).toHaveBeenCalledTimes(1)
    })

    it('passes the active conversation id to submit for follow-ups', async () => {
        const user = userEvent.setup()
        useChatStore.setState({ activeId: 'conv-42' })
        render(<Composer />)
        await user.type(screen.getByRole('textbox'), 'follow up')
        await user.keyboard('{Enter}')
        expect(mocks.submit).toHaveBeenCalledWith('follow up', 'conv-42')
    })
})
