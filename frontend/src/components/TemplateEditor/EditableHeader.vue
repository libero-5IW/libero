<template>
    <div class="relative flex items-center justify-center mb-4 py-2 gap-4  mt-9">
      <ButtonBack
      :route-name="props.backRouteName"
      />
      <div class="flex items-center gap-4">
        <EditableTitle v-model="name" />
        <span v-if="props.status" class="text-sm text-gray-500 italic">({{ props.status }})</span>
      </div>
    </div>
</template>
  
<script setup lang="ts">
  import EditableTitle from '@/components/TemplateEditor/EditableTitle.vue'
  import ButtonBack from '../Buttons/ButtonBack.vue';
  
  const props = defineProps<{
    backRouteName?: string
    status?: string
  }>()

  const name = defineModel<string>({ default: '' })
  
</script>
  