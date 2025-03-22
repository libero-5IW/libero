<template>
    <v-card>
      <v-toolbar flat class="px-4">
        <slot name="top.title"></slot>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <slot name="top.actions"></slot>
      </v-toolbar>
      <v-data-table-server
          v-bind="$attrs"
          :headers="headers"
          :items="transformedItems"
          :items-length="itemsLength"
          @update:options="loadItems"
          class="shadow"
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:item.account_status="{ item }">
          <slot name="item.account_status" :item="item"></slot>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="flex justify-end space-x-2">
            <slot name="item.actions" :item="item"></slot>
          </div>
        </template>
      </v-data-table-server>
    </v-card>
  </template>
  
  <script lang="ts">
  import {computed, defineComponent, type PropType} from 'vue';
  import type { Header } from "@/types";
  
  export default defineComponent({
    name: 'DataTable',
    props: {
      headers: {
        type: Array as PropType<Header[]>,
        required: true,
        default: () => [],
      },
      items: {
        type: Array,
        required: true,
        default: () => [],
      },
      itemsLength: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    emits: ['update:options'],
    methods: {
      loadItems(options: any) {
        this.$emit('update:options', options);
      },
    },
      setup(props) {
        const transformedItems = computed(() => {
          return props.items.map((item: any) => {
            const transformedItem: any = {};
  
            props.headers.forEach((header: Header) => {
              transformedItem[header.value] = header.transform ? header.transform(item) : item[header.value];
            });
  
            // keep the item value that is not in the headers
            Object.keys(item).forEach((key) => {
              if (!props.headers.find((header) => header.value === key)) {
                transformedItem[key] = item[key];
              }
            });
  
            return transformedItem;
          });
        });
  
        return {
          transformedItems,
        };
    },
  });
  </script>