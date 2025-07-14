<template>
  <div
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }"
    :duration="600"
    :delay="150"
  >
    <h1 class="font-sans capitalize text-xl md:text-2xl lg:text-3xl font-bold 
           bg-gradient-to-br from-black via-indigo-800
           bg-clip-text text-transparent mb-15 mt-8">
      <slot />
    </h1>
  </div>
</template>