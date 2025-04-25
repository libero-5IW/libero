<template>
  <v-card flat class="p-4">
    <div
      ref="editorContainer"
      class="container mx-auto max-w-4xl my-8"
    >
      <EditorToolbar v-if="editor" :editor="editor" />
      <EditorContent :editor="editor" />
    </div>
  </v-card>
</template>
  
<script setup lang="ts">
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { onMounted, onBeforeUnmount, watch, ref, computed, nextTick } from 'vue'
  import Underline from '@tiptap/extension-underline'
  import HardBreak from '@tiptap/extension-hard-break'
  import EditorToolbar from '@/components/TemplateEditor/EditorToolbar.vue'
  
  const props = defineProps<{ modelValue: string }>()
  const emit = defineEmits(['update:modelValue', 'editor-ready'])
  const editor = ref<Editor>()
  
  const CustomHardBreak = HardBreak.extend({
    addKeyboardShortcuts() {
      return {
        'Enter': () => this.editor.commands.setHardBreak(),
      }
    }
  })

    defineExpose({ 
      getEditor: () => editor.value
     })


  onMounted(() => {
    editor.value = new Editor({
      content: props.modelValue || '<p>Commencez à écrire...</p>',
      extensions: [
        StarterKit.configure({
          paragraph: {
            HTMLAttributes: {
              class: 'whitespace-pre-wrap',
            },
          },
          heading: {
            HTMLAttributes: {
              class: 'whitespace-pre-wrap',
            },
          },
        }),
        Underline,
        CustomHardBreak.configure({
          keepMarks: true,
          HTMLAttributes: {
            class: 'line-break',
          }
        }),
      ],
      editorProps: {
        attributes: {
          class: 'prose w-full max-w-none max-h-[30rem] min-h-[30rem] overflow-y-auto border border-gray-300 rounded-br-lg rounded-bl-lg',
        },
      },
      onUpdate({ editor }) {
        emit('update:modelValue', editor.getHTML())
      },
    })

    if(editor.value) {
      emit('editor-ready', editor.value)
    }
  })
  
  onBeforeUnmount(() => {
    editor.value?.destroy()
  })
  
  watch(
    () => props.modelValue,
    (newVal) => {
      if (editor.value?.getHTML() !== newVal) {
        editor.value?.commands.setContent(newVal, false)
      }
    }
  )
</script>
  
  