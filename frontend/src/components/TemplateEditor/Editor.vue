<template>
  <v-card flat class="p-4">
    <div
      ref="editorContainer"
      class="container mx-auto max-w-4xl my-8"
    >
      <div class="mb-4">
        <draggable
          :list="variables"
          :group="{ name: 'variables', pull: 'clone', put: false }"
          :clone="cloneVariable"
          item-key="internal_name"
          :sort="false"
          class="d-flex flex-wrap"
        >
          <template #item="{ element }">
            <v-chip
              class="ma-1 variable-chip"
              draggable
              @dragstart="onDragStart($event, element)"
            >
              {{ element.label }}
            </v-chip>
          </template>
        </draggable>
      </div>
      <EditorToolbar v-if="editor" :editor="editor" />
      <div class="editor-wrapper">
        <EditorContent :editor="editor" />
      </div>
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
  import draggable from 'vuedraggable'
  import { Node, mergeAttributes } from '@tiptap/core'
  
  const props = defineProps<{ 
    modelValue: string,
    variables?: Array<{ variableName: string, label: string }>
  }>()
  const emit = defineEmits(['update:modelValue', 'editor-ready'])
  const editor = ref<Editor>()
  
  const CustomHardBreak = HardBreak.extend({
    name: 'customHardBreak',
    addKeyboardShortcuts() {
      return {
        'Enter': () => this.editor.commands.setHardBreak(),
      }
    }
  })

  const VariableNode = Node.create({
    name: 'variable',
    group: 'inline',
    inline: true,
    content: 'text*',
    draggable: true,

    addAttributes() {
      return {
        variableName: {
          default: null,
          parseHTML: element => element.getAttribute('data-variable-name'),
          renderHTML: attributes => {
            return {
              'data-variable-name': attributes.variableName,
            }
          },
        },
        label: {
          default: null,
          parseHTML: element => element.getAttribute('data-label'),
          renderHTML: attributes => {
            return {
              'data-label': attributes.label,
            }
          },
        },
      }
    },

    parseHTML() {
      return [
        {
          tag: 'span[data-type="variable"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['span', mergeAttributes(
        { 'data-type': 'variable' },
        HTMLAttributes
      ), `{{${HTMLAttributes.variableName}}}`]
    },

    addNodeView() {
      return ({ HTMLAttributes, getPos, node }) => {
        const dom = document.createElement('span')
        dom.setAttribute('data-type', 'variable')
        dom.setAttribute('data-variable-name', node.attrs.variableName)
        dom.setAttribute('data-label', node.attrs.label)
        dom.className = 'variable-chip'
        
        const text = document.createTextNode(node.attrs.label)
        dom.appendChild(text)

        const closeButton = document.createElement('span')
        closeButton.className = 'close-button'
        closeButton.innerHTML = '×'
        closeButton.onclick = (e) => {
          e.stopPropagation()
          if (typeof getPos === 'function') {
            const pos = getPos()
            if (pos !== undefined) {
              editor.value?.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run()
            }
          }
        }
        dom.appendChild(closeButton)

        return {
          dom,
          update: (newNode) => {
            if (newNode.type !== node.type) {
              return false
            }
            dom.setAttribute('data-variable-name', newNode.attrs.variableName)
            dom.setAttribute('data-label', newNode.attrs.label)
            dom.firstChild!.textContent = newNode.attrs.label
            return true
          },
        }
      }
    },
  })

  const cloneVariable = (variable: { variableName: string, label: string }) => {
    return {
      id: Date.now(),
      type: 'variable',
      variableName: variable.variableName,
      label: variable.label
    }
  }

  const onDragStart = (event: DragEvent, variable: { variableName: string, label: string }) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(variable))
      event.dataTransfer.effectAllowed = 'copy'
    }
  }

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
          hardBreak: false,
        }),
        Underline,
        CustomHardBreak.configure({
          keepMarks: true,
          HTMLAttributes: {
            class: 'line-break',
          }
        }),
        VariableNode,
      ],
      editorProps: {
        attributes: {
          class: 'prose w-full max-w-none max-h-[30rem] min-h-[30rem] overflow-y-auto border border-gray-300 rounded-br-lg rounded-bl-lg p-4',
        },
        handleDrop: (view, event, slice, moved) => {
          if (!moved && event.dataTransfer) {
            try {
              const data = event.dataTransfer.getData('application/json')
              if (!data) return false
              
              const variable = JSON.parse(data)
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

              if (pos !== undefined) {
                editor.value?.chain()
                  .focus()
                  .command(({ tr, dispatch }) => {
                    const node = editor.value?.schema.nodes.variable.create({
                      variableName: variable.variableName,
                      label: variable.label,
                    })
                    if (node) {
                      tr.insert(pos, node)
                      dispatch(tr)
                      return true
                    }
                    return false
                  })
                  .run()
                return true
              }
            } catch (e) {
              console.error('Error handling drop:', e)
            }
          }
          return false
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

<style>
.variable-chip {
  display: inline-flex;
  align-items: center;
  background-color: rgb(var(--v-theme-primary));
  color: white;
  padding: 0 12px;
  border-radius: 9999px;
  font-size: 0.875rem;
  height: 32px;
  user-select: none;
  margin: 0 2px;
}

.close-button {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  font-size: 16px;
  line-height: 1;
}

.variable-chip:hover .close-button {
  opacity: 1;
}

.editor-wrapper {
  position: relative;
}

.ProseMirror {
  min-height: 30rem;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror p {
  margin: 0;
  min-height: 1.5em;
}
</style>
  
  