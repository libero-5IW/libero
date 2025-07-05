<template>
    <v-card flat class="p-4">
      <div class="flex  justify-between items-center mb-2 px-4 pt-4">
        <h2 class="text-lg font-semibold">Prévisualisation PDF</h2>
        <v-btn color="primary" @click="downloadPdf" :loading="loading"  prepend-icon="mdi-download">
          Télécharger
        </v-btn>
      </div>
  
      <div class=" prose prose-sm border rounded-lg mx-4 p-4 bg-white min-h-[300px] max-h-[300px] overflow-y-auto  max-w-none">
        <div ref="previewRef" >
          <div v-html="previewHtml"></div>
        </div>
      </div>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import html2pdf from 'html2pdf.js'
  
  const props = defineProps<{ 
    fileName: string
    contentHtml: string
    variables: Record<string, string>
  }>()
  
  const loading = ref(false)
  const previewRef = ref<HTMLElement | null>(null)
  const fileName = props.fileName + '.pdf'
  
  const previewHtml = computed(() => {
  let html = props.contentHtml
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const variableSpans = doc.querySelectorAll('span[data-type="variable"]')
  variableSpans.forEach(span => {
    const variableName = span.getAttribute('data-variable-name')
    if (variableName && variableName in props.variables) {
      const replacement = document.createElement('span')
      replacement.innerHTML = props.variables[variableName]
      span.parentNode?.replaceChild(replacement, span)
    }
  })

  html = doc.body.innerHTML
  for (const [key, value] of Object.entries(props.variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    html = html.replace(regex, value)
  }

  // Inject professional PDF styles and a wrapper for margins
  const pdfStyles = `
    <style>
      .pdf-wrapper {
        margin: 40px 48px 40px 48px;
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        color: #222;
        font-size: 13px;
      }
      h1, h2, h3, h4, h5, h6 {
        font-weight: bold;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: #1a1a1a;
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.2em; }
      p {
        margin: 0.7em 0;
        line-height: 1.7;
      }
      ul, ol {
        margin: 0.7em 0 0.7em 2em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
      }
      th, td {
        border: 1px solid #bbb;
        padding: 6px 10px;
        text-align: left;
      }
      th {
        background: #f5f5f5;
      }
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
    </style>
  `;
  return `${pdfStyles}<div class="pdf-wrapper">${html}</div>`
  })
  
  function downloadPdf() {
    if (!previewRef.value) return
    loading.value = true
    // Use the computed HTML with styles for PDF
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = previewHtml.value
    html2pdf()
      .from(tempDiv)
      .set({ filename: fileName, html2canvas: { scale: 2 } })
      .save()
      .finally(() => (loading.value = false))
  }
  </script>
  