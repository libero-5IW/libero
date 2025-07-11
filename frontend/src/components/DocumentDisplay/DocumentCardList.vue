<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        class="rounded-t-2xl"
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
            <v-list-item @click.stop="onChangeStatus(item)">
              <v-list-item-title>Changer le statut</v-list-item-title>
            </v-list-item>

            <v-list-item 
              v-if="item.clientId && item.status !== 'signed' && (item.status === 'draft' || item.status === 'sent' || item.status === 'accepted')"
              @click.stop="onSentToClient(item.id)"
            >
              <v-list-item-title>{{ sentLabel(item.status, false) }} </v-list-item-title>
            </v-list-item>

            <v-list-item 
              v-if="item.clientId && props.type=== 'contract' && item.status === 'signed'"
              @click.stop="onSentSignedToClient(item.id)"
            >
              <v-list-item-title>{{ sentLabel(item.status, true) }} </v-list-item-title>
            </v-list-item>

            <v-list-item 
              v-if="item.clientId && props.type === 'invoice' && (item.status === 'paid' || item.status === 'sent')"
              @click.stop="onSentPaidToClient(item.id)"
            >
              <v-list-item-title>{{ sentLabel(item.status, true) }} </v-list-item-title>
            </v-list-item>

            
            <v-list-item
              v-if="props.type === 'quote'"
              @click.stop="onConvertToContract(item)"
              >
              <v-list-item-title>Transformer en Contrat</v-list-item-title>
            </v-list-item>
          
            <v-list-item
              v-if="props.type === 'quote' || props.type === 'contract'"
              @click.stop="onConvertToInvoice(item)"
              >
              <v-list-item-title>Transformer en Facture</v-list-item-title>
            </v-list-item>
        
            <v-list-item v-if="item.status === 'draft'" @click.stop="onEdit(item.id)">
              <v-list-item-title class="text-orange-400">Éditer</v-list-item-title>
            </v-list-item>

            <v-list-item @click.stop="onDelete(item.id)">
              <v-list-item-title class="text-error">Supprimer</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-card-subtitle class="pb-4 text-sm text-gray-600">
        Créé le {{ formatDate(item.createdAt) }} — <strong class="uppercase text-black">{{ translateStatus(item.status) }}</strong>
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { DocumentCard } from '@/types'
import { translateStatus } from '@/utils/status'

const props = defineProps<{
  items: DocumentCard[]
  titlePrefix: string
  type: 'quote' | 'contract' | 'invoice'  
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'change-status', id: string): void
  (e: 'sent-to-client', id: string): void
  (e: 'sent-paid-to-client', id: string): void
  (e: 'sent-signed-to-client', id: string): void
  (e: 'convert-to-invoice', item: DocumentCard): void
  (e: 'convert-to-contract', item: DocumentCard): void
}>()

function sentLabel (status: string, invoicePaid: boolean) {
  let message = 'Renvoyer';
  if (status === 'draft' || status === 'signed') {
    message = 'Envoyer'
  }
  if(props.type === 'quote') {
    message += ' le devis' 
  } 
  else if (props.type === 'contract' && (status === 'draft' || status === 'sent')) {
    message += ' pour signature'
  } 
  else if (props.type === 'contract' && status === 'signed') {
        message += ' le contrat signé'
  }
  else {
    if(invoicePaid && (status === 'paid' || status === 'sent')) {
      message = 'Envoyer la facture acquittée'
    } else {
            message += ' la facture non acquittée'
    }
  }
  return message
}

function onEdit(id: string) {
  emit('edit', id)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

function onCardClick(item: DocumentCard) {
  if (item.pdfUrl) {
    window.open(item.pdfUrl, '_blank')
  }
}

function onDelete(id: string) {
  emit('delete', id)
}

function onSentToClient(id: string) {
  emit('sent-to-client', id)
}

function onSentPaidToClient(id: string) {
  emit('sent-paid-to-client', id)
}

function onSentSignedToClient(id: string) {
  emit('sent-signed-to-client', id)
}

function onConvertToInvoice(item: DocumentCard) {
  emit('convert-to-invoice', item)
}

function onConvertToContract(item: DocumentCard) {
  emit('convert-to-contract', item)
}

function onChangeStatus(item: DocumentCard) {
  emit('change-status', item.id)
}
</script>