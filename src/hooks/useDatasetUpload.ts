import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadDataset } from '@/lib/api'
import { useChatStore } from '@/store/useChatStore'

const ACCEPT = ['.csv', '.xlsx', '.xls']

// Owns the bring-your-own-data flow: window-level drag detection + the upload itself.
// Call this ONCE (in App) so the window listeners aren't registered twice; pass the
// returned `upload`/`uploading`/`error` down to the file-picker button.
export function useDatasetUpload() {
    const [isDragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const setActiveDataset = useChatStore((s) => s.setActiveDataset)
    // dragenter/leave fire per child element; a depth counter avoids flicker.
    const dragDepth = useRef(0)

    const upload = useCallback(async (file: File) => {
        const ok = ACCEPT.some((ext) => file.name.toLowerCase().endsWith(ext))
        if (!ok) {
            setError('Unsupported file — please upload a .csv or .xlsx')
            return
        }
        setError(null)
        setUploading(true)
        try {
            const dataset = await uploadDataset(file)
            setActiveDataset(dataset)   // scopes the next new chat + shows the preview
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }, [setActiveDataset])

    useEffect(() => {
        const hasFiles = (e: DragEvent) => e.dataTransfer?.types?.includes('Files')

        const onEnter = (e: DragEvent) => {
            if (!hasFiles(e)) return
            e.preventDefault()
            dragDepth.current += 1
            setDragging(true)
        }
        const onOver = (e: DragEvent) => {
            if (hasFiles(e)) e.preventDefault()   // allow the drop
        }
        const onLeave = () => {
            dragDepth.current = Math.max(0, dragDepth.current - 1)
            if (dragDepth.current === 0) setDragging(false)
        }
        const onDrop = (e: DragEvent) => {
            if (!hasFiles(e)) return
            e.preventDefault()
            dragDepth.current = 0
            setDragging(false)
            const file = e.dataTransfer?.files?.[0]
            if (file) upload(file)
        }

        window.addEventListener('dragenter', onEnter)
        window.addEventListener('dragover', onOver)
        window.addEventListener('dragleave', onLeave)
        window.addEventListener('drop', onDrop)
        return () => {
            window.removeEventListener('dragenter', onEnter)
            window.removeEventListener('dragover', onOver)
            window.removeEventListener('dragleave', onLeave)
            window.removeEventListener('drop', onDrop)
        }
    }, [upload])

    return { isDragging, uploading, error, upload }
}
