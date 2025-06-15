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
    
    // Find all variable spans
    const variableSpans = doc.querySelectorAll('span[data-type="variable"]')
    variableSpans.forEach(span => {
      const variableName = span.getAttribute('data-variable-name')
      if (variableName && variableName in props.variables) {
        // Replace the span with the variable value
        const replacement = document.createElement('span')
        replacement.innerHTML = props.variables[variableName]
        span.parentNode?.replaceChild(replacement, span)
      }
    })
    
    return doc.body.innerHTML
  })
  
  function downloadPdf() {
    if (!previewRef.value) return
    loading.value = true
    html2pdf()
      .from(previewRef.value)
      .set({ filename: fileName, html2canvas: { scale: 2 } })
      .save()
      .finally(() => (loading.value = false))
  }
  </script>
  