import { useRef, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { SEED_EXAMPLES } from '@/data/seed'
import { useChatStore } from '@/store/useChatStore'
import { useQueryStream } from '@/hooks/useQueryStream'
import { Composer } from './Composer'
import { DatasetPreview } from './DatasetPreview'

type Props = {
    onUpload: (file: File) => void
    uploading: boolean
    uploadError: string | null
}

// Shown when the active thread is empty: centered hero + suggestions/upload + composer.
export const EmptyHero = ({ onUpload, uploading, uploadError }: Props) => {
    const isStreaming = useChatStore((s) => s.isStreaming)
    const activeDataset = useChatStore((s) => s.activeDataset)
    const { submit } = useQueryStream()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onUpload(file)
        e.target.value = ''   // let the same file be re-selected later
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-semibold">Talk to your data</h1>
                    <p className="text-sm text-muted-foreground">
                        {activeDataset
                            ? 'Ask a question about your data — Helix writes the SQL, runs it, and charts the answer.'
                            : 'Ask in plain English — or drop your own CSV/XLSX to analyze it.'}
                    </p>
                </div>

                {activeDataset ? (
                    <DatasetPreview dataset={activeDataset} />
                ) : (
                    <div className="flex flex-wrap justify-center gap-2">
                        {SEED_EXAMPLES.map((ex) => (
                            <button
                                key={ex.title}
                                disabled={isStreaming}
                                onClick={() => submit(ex.title, null)}
                                className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            >
                                {ex.title}
                            </button>
                        ))}
                    </div>
                )}

                <Composer
                    autoFocus
                    placeholder={
                        activeDataset
                            ? `Ask about ${activeDataset.name}…`
                            : 'e.g. Show monthly revenue trend for 2026…'
                    }
                />

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                        <Upload className="size-3.5" />
                        {uploading
                            ? 'Uploading…'
                            : activeDataset
                              ? 'Upload a different file'
                              : 'Upload CSV / XLSX'}
                    </button>
                    <span className="text-[11px] text-muted-foreground">…or drag a file anywhere</span>
                    {uploadError && (
                        <span className="text-[11px] text-destructive">{uploadError}</span>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={onFileChange}
                    />
                </div>
            </div>
        </div>
    )
}
