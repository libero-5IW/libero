<template>
    <v-card flat class="p-4 h-full">
      <div class="flex  justify-between items-center mb-2 px-4 pt-4">
        <h2 class="text-lg font-semibold">Prévisualisation PDF</h2>
        <v-btn color="primary" @click="downloadPdf" :loading="loading"  prepend-icon="mdi-download">
          Télécharger
        </v-btn>
      </div>
  
      <div class=" prose prose-sm border rounded-lg mx-4 p-4 bg-white h-full w-full flex-1 overflow-y-auto  max-w-none">
        <div ref="previewRef" class="h-full w-full">
          <div v-html="previewHtml" class="h-full w-full"></div>
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

  const pdfStyles = `
    <style>
      .pdf-wrapper {
        font-family: 'Roboto Condensed', 'Roboto', 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        color: #212121;
        font-size: 13px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        padding: 24px 16px;
        margin: 0;
        max-width: 100%;
        box-sizing: border-box;
      }
      .pdf-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #3F51B5;
        padding-bottom: 12px;
        margin-bottom: 32px;
      }
      .pdf-logo {
        max-width: 120px;
        height: auto;
      }
      .pdf-title {
        font-size: 2.2em;
        color: #3F51B5;
        font-weight: bold;
        margin: 0;
      }
      h1, h2, h3, h4, h5, h6 {
        font-weight: bold;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: #3F51B5;
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.2em; }
      p {
        margin: 0.7em 0;
        line-height: 1.7;
      }
      hr {
        border: none;
        border-top: 1px solid #eee;
        margin: 2em 0;
      }
      ul, ol {
        margin: 0.7em 0 0.7em 2em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
        font-size: 0.98em;
      }
      th, td {
        border: 1px solid #bbb;
        padding: 8px 12px;
        text-align: left;
      }
      th {
        background: #E8EAF6;
        color: #3F51B5;
      }
      tr:nth-child(even) {
        background: #fafbfc;
      }
      .section-card {
        background: #f7fafd;
        border-left: 4px solid #3F51B5;
        padding: 16px 20px;
        margin: 24px 0;
        border-radius: 6px;
      }
      .signature-area {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px dashed #bbb;
        color: #888;
        text-align: right;
      }
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
    </style>
  `;
  return `${pdfStyles}
    <div class="pdf-wrapper">
      <div class="pdf-header">
        <img src="/src/assets/logo.png" class="pdf-logo" />
      </div>
      ${html}
      <div class="signature-area">Signature:</div>
    </div>`
  })
  
  function downloadPdf() {
    if (!previewRef.value) return
    loading.value = true
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = previewHtml.value
    html2pdf()
      .from(tempDiv)
      .set({ filename: fileName, html2canvas: { scale: 2 } })
      .save()
      .finally(() => (loading.value = false))
  }
  </script>
  