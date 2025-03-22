<template>
    <component :is="tag" :class="computedClasses">
      <slot></slot>
    </component>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue';
  
  type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'small' | 'strong' | 'i' | 'b';
  
  export default defineComponent({
    name: 'Heading',
    props: {
      tag: {
        type: String as () => Tag,
        required: true,
        default: 'p',
        validator: (value: string) =>
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'small', 'strong', 'i', 'b'].includes(value),
      },
      classes: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const tagToClasses: Record<Tag, string> = {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-semibold',
        h3: 'text-2xl font-semibold',
        h4: 'text-xl font-medium',
        h5: 'text-lg font-medium',
        h6: 'text-base font-medium',
        p: 'text-base',
        span: 'text-base',
        small: 'text-sm',
        strong: 'font-bold',
        i: 'italic',
        b: 'font-bold',
      };
  
      const computedClasses = computed(() => {
        return `${tagToClasses[props.tag]} ${props.classes}`;
      });
  
      return {
        computedClasses,
      };
    },
  });
  </script>