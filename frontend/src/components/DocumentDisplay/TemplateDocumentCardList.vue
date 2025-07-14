<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-15">
    <v-card
      v-for="item in items"
      :key="item.id"
      class="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-indigo-900/10 dark:via-gray-900 dark:to-indigo-900"
      @click="onCardClick(item)"
    >
      <v-img
        v-if="item.previewUrl"
        :src="item.previewUrl"
        height="180"
        cover
        class="rounded-t-2xl mt-2 mb-2 ml-2 mr-2"
      />

      <div class="absolute top-2 right-2 z-10">
        <v-menu>
          <template #activator="{ props }">
            <v-tooltip text="Autres actions" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  icon
                  variant="plain"
                  size="small"
                  class="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  v-bind="{ ...props, ...tooltipProps }"
                >
                  <v-icon size="22" color="black">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>

          <v-list v-if="!props.isLoading" class="rounded-xl py-1">
            
            <v-list-item @click.stop="onDuplicate(item.id)">
              <v-list-item-title>Dupliquer</v-list-item-title>
            </v-list-item>
            
            <v-list-item @click.stop="onEdit(item.id)">
              <v-list-item-title class="text-orange-400">Éditer</v-list-item-title>
            </v-list-item>

            <v-list-item @click.stop="onDelete(item.id)">
              <v-list-item-title class="text-error">Supprimer</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-card-title class="text-xl font-semibold px-4 pt-4 text-gray-900 dark:text-white">
        <span class="text-primary">{{ item.name }}</span>
      </v-card-title>

      <v-card-subtitle class="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Créé le {{ formatDate(item.createdAt) }}</p>
        <p>Nombre de variables : {{ item.variablesLength }}</p>
        <p>Dernière mise à jour : {{ formatDate(item.updatedAt) }}</p>
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { TemplateDocumentCard } from '@/types'

const props = defineProps<{
  items: TemplateDocumentCard[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'duplicate', id: string): void
}>()

function onEdit(id: string) {
  emit('edit', id)
}

function onDuplicate(id: string) {
  emit('duplicate', id)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

function onCardClick(item: TemplateDocumentCard) {
  if (item.pdfUrl) {
    window.open(item.pdfUrl, '_blank')
  }
}

function onDelete(id: string) {
  emit('delete', id)
}
</script>