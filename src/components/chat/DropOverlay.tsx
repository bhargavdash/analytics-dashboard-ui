import { Loader2, Upload } from 'lucide-react'

// Full-window overlay shown while a file is dragged over the app or being ingested.
export const DropOverlay = ({ uploading }: { uploading: boolean }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm animate-in fade-in motion-reduce:animate-none">
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-card px-12 py-10 text-center shadow-lg">
                {uploading ? (
                    <Loader2 className="size-8 animate-spin text-primary" />
                ) : (
                    <Upload className="size-8 text-primary" />
                )}
                <p className="text-lg font-semibold">
                    {uploading ? 'Ingesting your data…' : 'Drop your CSV or XLSX'}
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    {uploading
                        ? 'Reading rows and detecting the schema'
                        : 'Up to 10 MB · Helix detects the schema automatically'}
                </p>
            </div>
        </div>
    )
}
