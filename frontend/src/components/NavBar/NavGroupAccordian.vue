<template>
  <v-list-group :value="groupValue">
    <template v-slot:activator="{ props, isOpen }">
      <v-list-item
        v-bind="props"
        :class="{
          'bg-secondary': isOpen,
          'border-r-4 border-primary': isOpen,
          'text-surface': isOpen,
          'text-primary': !isOpen
        }"
      >
        <template v-slot:prepend>
          <v-icon
            :icon="mainIcon"
          />
        </template>
        <v-list-item-title :class="isOpen ? 'text-surface': 'text-primary'">{{ mainTitle }}</v-list-item-title>
      </v-list-item>
    </template>

    <!-- Container for the continuous line -->
    <div class="absolute left-4 w-6 z-0" ref="timelineContainer">
      <svg class="absolute top-0 w-full" :style="{ height: `${lineHeight}px` }">
        <line 
          x1="12" 
          y1="24" 
          x2="12" 
          :y2="lineHeight - 24" 
          class="stroke-[2] stroke-[rgb(var(--v-theme-text-secondary-light))]" 
        />
      </svg>
    </div>

    <div ref="itemsContainer">
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        :value="item.to"
        class="mx-1 my-2 "
        :class="{
          'bg-[rgba(var(--v-theme-text-secondary-light),_0.12)]': route.path === item.to
        }"
      >
        <template v-slot:prepend>
          <div class="relative w-6 h-12 mr-3 -mt-2 -mb-2 z-[1]">
            <svg width="24" height="48">
              <circle cx="12" cy="24" r="4" :class="{
                'fill-[rgb(var(--v-theme-primary))]': route.path === item.to,
                'fill-[rgb(var(--v-theme-text-secondary-light))]': route.path !== item.to
              }" />
            </svg>
          </div>
        </template>
        <v-list-item-title :class="{
          'text-primary': route.path === item.to,
          'text-secondary': route.path !== item.to
        }">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </div>
  </v-list-group>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavigationItem {
  title: string
  to: string
  icon?: string
}

interface Props {
  groupValue: string
  mainTitle: string
  mainIcon: string
  items: NavigationItem[]
}

const route = useRoute()
const isActive = computed(() =>
  props.items.some((item) => route.path === item.to)
)

const props = withDefaults(defineProps<Props>(), {
  groupValue: 'navigation',
  mainIcon: 'mdi-menu',
  items: () => []
})

const itemsContainer = ref<HTMLElement | null>(null)
const lineHeight = ref(0)

const updateLineHeight = () => {
  if (itemsContainer.value) {
    lineHeight.value = itemsContainer.value.offsetHeight
  }
}

onMounted(async () => {
  await nextTick()
  updateLineHeight()
  
  const resizeObserver = new ResizeObserver(updateLineHeight)
  if (itemsContainer.value) {
    resizeObserver.observe(itemsContainer.value)
  }
})
</script>

<style scoped>
:deep(.v-list-group__items) .v-list-item {
  padding-left: 12px !important;
}
</style>