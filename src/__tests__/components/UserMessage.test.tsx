import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserMessage } from '@/components/chat/UserMessage'

describe('UserMessage', () => {
    it('renders the question text', () => {
        render(<UserMessage question="What were our top regions?" />)
        expect(screen.getByText('What were our top regions?')).toBeInTheDocument()
    })

    it('preserves newlines (whitespace-pre-wrap) for multi-line questions', () => {
        render(<UserMessage question={'line one\nline two'} />)
        const el = screen.getByText(/line one/)
        expect(el).toHaveClass('whitespace-pre-wrap')
        expect(el.textContent).toBe('line one\nline two')
    })
})
