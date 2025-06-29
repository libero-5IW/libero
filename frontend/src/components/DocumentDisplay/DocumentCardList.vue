<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <v-card
      v-for="item in items"
      :key="item.id"
      class="relative rounded-lg overflow-hidden shadow hover:shadow-xl transition-all duration-300"
      @click="onCardClick(item)"
    >

      <v-card-title class="text-lg font-bold mt-2 px-4">
        <span class="text-primary">{{ titlePrefix }} #{{ item.number }} </span> - {{ item.clientName ?? '—' }}
      </v-card-title>
      <v-img
        v-if="item.previewUrl"
        :src="item.previewUrl"
        height="180"
        cover
        class="rounded-t-lg"
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
                  color="primary"
                  v-bind="{ ...props, ...tooltipProps }"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>

          <v-list class="rounded-lg">
            <v-list-item @click.stop="onChangeStatus(item)">
              <v-list-item-title>Changer le statut</v-list-item-title>
            </v-list-item>

            <v-list-item 
              v-if="item.pdfUrl"
              :href="item.pdfUrl"
              target="_blank"
            >
              <v-list-item-title>Envoyer le PDF</v-list-item-title>
            </v-list-item>

            <v-list-item @click.stop="onEdit(item.id)">
              <v-list-item-title>Éditer</v-list-item-title>
            </v-list-item>

            <v-list-item @click.stop="onConvertToInvoice(item)">
              <v-list-item-title>Transformer en Facture</v-list-item-title>
            </v-list-item>

            <v-list-item @click.stop="onDelete(item.id)">
              <v-list-item-title class="text-red-600">Supprimer</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
        
      <v-card-subtitle class="pb-4 text-sm text-gray-600">
        Créé le {{ formatDate(item.createdAt) }} — <span class="capitalize">{{ item.status }}</span>
      </v-card-subtitle>
      
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { DocumentCard } from '@/types'

const props = defineProps<{
  items: DocumentCard[]
  titlePrefix: string
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'change-status', id: string): void
  (e: 'convert-to-invoice', item: DocumentCard): void
}>()

function onEdit(id: string) {
  emit('edit', id)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

function onCardClick(item: DocumentCard) {
  if (item.pdfUrl) {
    window.open(item.pdfUrl, '_blank');
  }
}

function onDelete(id: string) {
  emit('delete', id)
}

function onConvertToInvoice(item: DocumentCard) {
  emit('convert-to-invoice', item)
}

function onChangeStatus(item: DocumentCard) {
  emit('change-status', item.id)
}

</script>
