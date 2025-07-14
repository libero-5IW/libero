<template>
    <div v-if="editor" class="flex flex-wrap items-center gap-2 border border-b-0 border-gray-300 p-2 rounded-t-md">
      <v-btn
        @click="editor.chain().focus().toggleBold().run()"
        size="small"
        :variant="editor.isActive('bold') ? 'text' : 'plain'"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
      >Bold</v-btn>
  
      <v-btn
        @click="editor.chain().focus().toggleItalic().run()"
        size="small"
        :variant="editor.isActive('italic') ? 'text' : 'plain'"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
      >Italic</v-btn>

      <v-btn
        @click="editor.chain().focus().toggleHeading({level: 1}).run()"
        size="small"
        :variant="editor.isActive('heading', { level: 1 }) ? 'text' : 'plain'"
        :disabled="!editor.can().chain().focus().toggleHeading({level: 1}).run()"
      >H1</v-btn>

      <v-btn
        @click="editor.chain().focus().toggleHeading({level: 2}).run()"
        size="small"
        :variant="editor.isActive('heading', { level: 2 }) ? 'text' : 'plain'"
      >H2</v-btn>
  
      <v-btn
        @click="editor.chain().focus().toggleUnderline().run()"
        size="small"
        :variant="editor.isActive('underline') ? 'text' : 'plain'"
      >Underline</v-btn>

      <v-btn
        @click="editor.chain().focus().undo().run()"
        size="small"
        :variant="editor.isActive('redo') ? 'text' : 'plain'"
        :disabled="!editor.can().chain().focus().undo().run()"
      >Undo</v-btn>
  
      <v-btn
        @click="editor.chain().focus().redo().run()"
        size="small"
        :variant="editor.isActive('redo') ? 'text' : 'plain'"
        :disabled="!editor.can().chain().focus().redo().run()"
      >Redo</v-btn>

      <div class="flex flex-nowrap gap-1">
        <v-btn
          @click="editor.chain().focus().setTextAlign('left').run()"
          size="small"
          :variant="editor.isActive({ textAlign: 'left' }) ? 'text' : 'plain'"
          :disabled="!editor.can().chain().focus().setTextAlign('left').run()"
        >
          <v-icon>mdi-format-align-left</v-icon>
        </v-btn>

        <v-btn
          @click="editor.chain().focus().setTextAlign('center').run()"
          size="small"
          :variant="editor.isActive({ textAlign: 'center' }) ? 'text' : 'plain'"
          :disabled="!editor.can().chain().focus().setTextAlign('center').run()"
        >
          <v-icon>mdi-format-align-center</v-icon>
        </v-btn>

        <v-btn
          @click="editor.chain().focus().setTextAlign('right').run()"
          size="small"
          :variant="editor.isActive({ textAlign: 'right' }) ? 'text' : 'plain'"
          :disabled="!editor.can().chain().focus().setTextAlign('right').run()"
        >
          <v-icon>mdi-format-align-right</v-icon>
        </v-btn>

        <v-btn
          @click="editor.chain().focus().setTextAlign('justify').run()"
          size="small"
          :variant="editor.isActive({ textAlign: 'justify' }) ? 'text' : 'plain'"
          :disabled="!editor.can().chain().focus().setTextAlign('justify').run()"
        >
          <v-icon>mdi-format-align-justify</v-icon>
        </v-btn>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import Color from '@tiptap/extension-color'
  import TextStyle from '@tiptap/extension-text-style'
  
  const props = defineProps<{ editor: Editor }>()

  import { ref, watch } from 'vue'

  const currentColor = ref('#000000')

  function onColorChange(event: Event) {
    const color = (event.target as HTMLInputElement).value
    currentColor.value = color
    const { editor } = props
    // Debug: log selection and marks before
    console.log('Before color:', {
      selection: editor.state.selection,
      marks: editor.state.storedMarks,
      html: editor.getHTML(),
    })
    editor.chain().focus().setColor(color).run()
    // Debug: log selection and marks after
    console.log('After color:', {
      selection: editor.state.selection,
      marks: editor.state.storedMarks,
      html: editor.getHTML(),
    })
  }

  watch(
    () => props.editor,
    (editor) => {
      if (editor) {
        // Optionally, update currentColor based on selection
        // Not implemented for simplicity
      }
    }
  )
</script>
  