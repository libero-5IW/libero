<template>
    <v-btn icon variant="text" @click="goBack" class="absolute top-1 left-1">
        <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
</template>

<script setup lang="ts">
    import router from '@/routes';

    
    const props = defineProps<{
        routeName?: string
    }>()

    function goBack() {
        if (props.routeName) {
            router.push({ name: props.routeName })
        } else {
            router.back()
        }
    }
</script>