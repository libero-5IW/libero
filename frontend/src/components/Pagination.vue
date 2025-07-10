<template>
    <div class="flex justify-center my-6">
      <v-pagination
        v-model="currentPageLocal"
        :length="totalPages"
        :total-visible="5"
        show-first-last-page
        @update:modelValue="emitPageChange"
      />
    </div>
  </template>
  
<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  
  const props = defineProps<{
    totalItems: number;
    currentPage: number;
    pageSize?: number;
  }>();
  
  const emit = defineEmits(['page-changed']);
  
  const currentPageLocal = ref(props.currentPage);
  const pageSize = computed(() => props.pageSize ?? 10);
  
  watch(() => props.currentPage, (val) => {
    currentPageLocal.value = val;
  });
  
  const totalPages = computed(() =>
    Math.ceil(props.totalItems / pageSize.value)
  );
  
  function emitPageChange(page: number) {
    emit('page-changed', page);
  }
</script>
  