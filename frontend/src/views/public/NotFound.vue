<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#fefcfb] via-[#f0f4ff] to-[#e0e7ff] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-center px-6">
    
    <div class="mb-8 animate-fade-in-up">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br bg-primary flex items-center justify-center shadow-xl mb-6 mx-auto">
        <v-icon icon="mdi-alert-circle-outline" color="white" size="36" />
      </div>

      <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">Page introuvable</h1>
      <p class="text-lg text-gray-600 dark:text-gray-300">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
    </div>

    <RouterLink
      to="/"
      class="mt-6 bg-white text-[#6366f1] px-6 py-3 rounded-lg text-lg font-medium shadow hover:shadow-lg hover:scale-105 transition flex items-center gap-2"
    >
      <v-icon icon="mdi-arrow-left" size="20" />
      Retour à l’accueil
    </RouterLink>
  </div>
</template>
