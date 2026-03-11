import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const REPORTS_DIR = 'public/reports'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function safeBasename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'file'
}

/**
 * POST multipart/form-data with "file" (or "files") - saves to public/reports and returns paths.
 * Response: { paths: string[] } e.g. ["/reports/1234-abc-original.jpg"]
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files: File[] = []
    const fileEntries = formData.getAll('file')
    const filesEntries = formData.getAll('files')
    for (const entry of [...fileEntries, ...filesEntries]) {
      if (entry instanceof File) files.push(entry)
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'No file(s) provided', paths: [] }, { status: 400 })
    }

    const root = process.cwd()
    const dir = path.join(root, REPORTS_DIR)
    await mkdir(dir, { recursive: true })

    const paths: string[] = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit`, paths: [] },
          { status: 400 }
        )
      }
      const mime = file.type?.toLowerCase() || ''
      const allowed = mime.startsWith('image/') || mime === 'application/pdf'
      if (!allowed) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}. Use images or PDF.`, paths: [] },
          { status: 400 }
        )
      }
      const ext = path.extname(file.name) || (mime.includes('pdf') ? '.pdf' : '.jpg')
      const base = safeBasename(path.basename(file.name, ext))
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}${ext}`
      const filepath = path.join(dir, filename)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)
      paths.push(`/reports/${filename}`)
    }

    return NextResponse.json({ paths })
  } catch (err) {
    console.error('[api/listing/uploadReportAttachment] error:', err)
    return NextResponse.json(
      { error: 'Upload failed', paths: [] },
      { status: 500 }
    )
  }
}
