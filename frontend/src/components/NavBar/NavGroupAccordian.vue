<template>
  <v-list-group value="dashboard">
    <template v-slot:activator="{ props, isActive }">
      <v-list-item
        v-bind="props"
        :class="{
          'bg-secondary-light': true,
          'border-r-4 border-primary': true,
          'text-primary': isActive
        }"
      >
        <template v-slot:prepend>
          <v-icon
            icon="mdi-view-dashboard"
            color="primary"
            :class="{ 'text-primary': isActive }"
          />
        </template>
        <v-list-item-title class="text-primary">Dashboard</v-list-item-title>
      </v-list-item>
    </template>

    <!-- Container for the continuous line -->
    <div class="timeline-container" ref="timelineContainer">
      <svg class="timeline-line" :style="{ height: `${lineHeight}px` }">
        <line 
          x1="12" 
          y1="24" 
          x2="12" 
          :y2="lineHeight - 24" 
          class="connecting-line" 
        />
      </svg>
    </div>

    <!-- List items with just the dots -->
    <div ref="itemsContainer">
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        :value="item.title"
        class="mx-1 my-2"
        :class="{
          'item-active-bg': $route.path === item.to
        }"
      >
        <template v-slot:prepend>
          <div class="dot-container">
            <svg width="24" height="48">
              <circle cx="12" cy="24" r="4" :class="{
                'dot': true,
                'dot-active': $route.path === item.to
              }" />
            </svg>
          </div>
        </template>
        <v-list-item-title :class="{
          'text-primary': $route.path === item.to,
          'text-text-secondary': $route.path !== item.to
        }">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </div>
  </v-list-group>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const items = [
  {
    title: 'Overview',
    to: '/dashboard',
    icon: 'mdi-chart-box'
  },
  {
    title: 'Quote',
    to: '/quote-template',
    icon: 'mdi-chart-line'
  },
  {
    title: 'Reports',
    to: '/dashboard/reports',
    icon: 'mdi-file-chart'
  }
]

const itemsContainer = ref<HTMLElement | null>(null)
const lineHeight = ref(0)

const updateLineHeight = () => {
  if (itemsContainer.value) {
    lineHeight.value = itemsContainer.value.offsetHeight
  }
}

onMounted(async () => {
  // Wait for the next tick to ensure items are rendered
  await nextTick()
  updateLineHeight()
  
  // Add resize observer to handle any dynamic changes
  const resizeObserver = new ResizeObserver(updateLineHeight)
  if (itemsContainer.value) {
    resizeObserver.observe(itemsContainer.value)
  }
})
</script>

<style scoped>
.timeline-container {
  position: absolute;
  left: 16px;
  width: 24px;
  z-index: 0;
}

.timeline-line {
  width: 100%;
  position: absolute;
  top: 0;
}

.dot-container {
  width: 24px;
  height: 48px;
  position: relative;
  margin-right: 12px;
  margin-top: -8px;
  margin-bottom: -8px;
  z-index: 1;
}

.connecting-line {
  stroke: rgb(var(--v-theme-text-secondary-light));
  stroke-width: 2;
}

.dot {
  fill: rgb(var(--v-theme-text-secondary-light));
  transition: fill 0.2s ease;
}

.dot-active {
  fill: rgb(var(--v-theme-primary));
}

.item-active-bg {
  background-color: rgba(var(--v-theme-text-secondary-light), 0.12) !important;
}

/* Remove default padding from list group items */
:deep(.v-list-group__items) .v-list-item {
  padding-left: 12px !important;
}
</style> 