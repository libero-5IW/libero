<template>
  <v-card flat class="p-4">
    <div
      ref="editorContainer"
      class="container mx-auto max-w-4xl my-8"
    >
      <div class="mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Variables</h2>
          
          <div class="flex gap-2">
            <v-tooltip text="Ajouter une nouvelle variable">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon @click="openVariableFormModal">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Importer une variable existante">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon @click="openImportModal">
                  <v-icon>mdi-import</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>

        

        <draggable
          :list="variables"
          :group="{ name: 'variables', pull: 'clone', put: false }"
          :clone="cloneVariable"
          item-key="variableName"
          :sort="false"
          class="d-flex flex-wrap"
        >
          <template #item="{ element, index }">
            <v-chip
            rounded="pill"
              class="ma-1 variable-list-chip"
              :class="{
                'chip-in-editor': variablesInEditor.has(element.variableName),
                'chip-not-in-editor': !variablesInEditor.has(element.variableName)
              }"
              draggable
              @dragstart="onDragStart($event, element)"
            >
              {{ element.label }}
              
              <v-tooltip v-if="!isSystemVariable(element)" text="Modifier la variable">
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    class="ml-2 edit-icon"
                    size="small"
                    @click.stop="openVariableEditModal(index)"
                  >
                    mdi-pencil
                  </v-icon>
                </template>
              </v-tooltip>
              <v-tooltip v-if="!isSystemVariable(element)" text="Supprimer la variable">
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    class="ml-2 edit-icon"
                    size="small"
                    @click.stop="removeVariable(index)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-tooltip>
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
  import type { VariableBase } from '@/types'
  
  const props = defineProps<{ 
    modelValue: string,
    variables?: VariableBase[]
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'editor-ready', editor: Editor): void
    (e: 'openEditModal', index: number): void
    (e: 'openRemoveModal', index: number): void
    (e: 'openImportModal'): void
    (e: 'openVariableFormModal'): void
  }>()

  
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
      return ({ node, getPos }) => {

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
              editor.value?.chain().focus().setNodeSelection(pos).deleteSelection().run()
            } else {
              console.warn('getPos() returned undefined for', node.attrs.variableName)
            }
          } else {
            console.warn('getPos is not a function for', node.attrs.variableName)
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

  function openVariableEditModal(index: number) {
    emit('openEditModal', index)
  }
  
  function removeVariable(index: number) {
    emit('openRemoveModal', index)
  }
  
  function openImportModal() {
    emit('openImportModal')
  }

  function openVariableFormModal() {
    emit('openVariableFormModal')
  }

  function isSystemVariable(variable: VariableBase) {
    return variable?.templateId === 'defaultTemplate'
  }

  function getVariablesInEditor(): string[] {
    if (!editor.value) return [];
    const html = editor.value.getHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const spans = doc.querySelectorAll('span[data-type="variable"][data-variable-name]');
    return Array.from(spans)
      .map(span => span.getAttribute('data-variable-name'))
      .filter((name): name is string => !!name);
  }

  const variablesInEditor = computed(() => new Set(getVariablesInEditor()));

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
                      if (dispatch) {
                        dispatch(tr)
                      }
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
  watch(
    () => editor.value?.getHTML(),
    () => {
      // triggers recomputation of variablesInEditor
    }
  );
</script>

<style>
.variable-chip {
  position: relative;
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

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.variable-chip:hover .edit-icon {
  opacity: 1;
}

.close-button {
  position: relative;
  margin-left: 4px;
  cursor: pointer;
  opacity: 1; /* Always visible for testing */
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

/* .variable-list-chip {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  padding: 0 12px !important;
  border-radius: 9999px !important;
  font-size: 0.875rem !important;
  height: 32px !important;
  user-select: none !important;
  margin: 0 2px !important;
} */

.chip-in-editor {
  background-color: rgb(var(--v-theme-text-secondary)) !important;
  color: white !important;
}

.chip-not-in-editor {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}
</style>

