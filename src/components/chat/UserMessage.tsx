export const UserMessage = ({ question }: { question: string }) => {
    return (
        <div className="flex justify-end">
            <div
                data-testid="user-message"
                className="max-w-[75%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground whitespace-pre-wrap"
            >
                {question}
            </div>
        </div>
    )
}
