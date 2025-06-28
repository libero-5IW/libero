import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import apiClient from '@/config/axios'

export async function generateAndUploadPdfAndPreview(previewElement: HTMLElement, fileNamePrefix = 'file'): Promise<{ pdfUrl: string; previewUrl: string } | null> {
  if (!previewElement) return null

  // 1. Génération du PDF
  const pdfBlob: Blob = await html2pdf()
    .from(previewElement)
    .set({ html2canvas: { scale: 2 } })
    .outputPdf('blob')

  // 2. Miniature
  const canvas = await html2canvas(previewElement, { scale: 1.5 })
  const previewBlob = await new Promise<Blob>((resolve) => canvas.toBlob(b => b && resolve(b!), 'image/png'))

  // 3. Upload
  const formData = new FormData()
  const uniqueId = Date.now()
  formData.append('pdf', pdfBlob, `${fileNamePrefix}-${uniqueId}.pdf`)
  formData.append('preview', previewBlob, `${fileNamePrefix}-${uniqueId}.png`)

  const { data } = await apiClient.post('/documents/upload', formData)
  return {
    pdfUrl: data.pdfUrl,
    previewUrl: data.previewUrl
  }
}
