<template>
  <div class="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f0f4ff] to-[#e0e7ff]">
    <section class="relative pt-20 pb-10 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#4f46e5]/10"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="pt-10 pb-10 animate-fade-in-up">
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-16 h-16 bg-primary rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow">
                <img src="@/assets/libero_icon_white.png" alt="Libero Logo" class="w-16 h-16 object-contain" />
              </div>
              <div class="absolute -inset-2 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl opacity-20 blur-lg"></div>
            </div>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span class="text-primary bg-clip-text text-transparent">Aide & FAQ</span>
          </h1>
          <p class="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Retrouvez ici les réponses aux questions les plus fréquentes et des conseils pour bien utiliser Libero.
          </p>
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">À propos de Libero</h2>
          <p class="text-gray-700">
            Libero est une application conçue pour simplifier la gestion administrative des freelances : création de devis, contrats, factures, gestion des clients et signature électronique, le tout en quelques clics.
          </p>
        </div>
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
          <ol class="list-decimal list-inside text-gray-700 space-y-2">
            <li>Créez un <strong>devis</strong> personnalisé à partir d’un modèle intelligent.</li>
            <li>Transformez le devis en <strong>contrat</strong> prêt à être signé en ligne.</li>
            <li>Votre client signe électroniquement, vous êtes notifié instantanément.</li>
            <li>Générez automatiquement la <strong>facture</strong> et suivez les paiements.</li>
          </ol>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Questions fréquentes</h2>
          <v-expansion-panels multiple>
            <v-expansion-panel>
              <v-expansion-panel-title>Mes documents sont-ils sécurisés ?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Vos documents sont stockés de manière sécurisée et respectent les obligations légales en vigueur. Seul vous et vos clients y avez accès.
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>Comment fonctionne la signature électronique ?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Lorsque vous envoyez un document à signer, vous (le freelance) le signez d'abord. Une fois votre signature apposée, le document est ensuite envoyé à votre client pour qu'il le signe à son tour. Vous recevez une notification à chaque étape.
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>Puis-je modifier un document après l’avoir créé ?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Les documents sont modifiables uniquement lorsqu'ils sont en statut "brouillon". Une fois envoyés pour signature ou finalisés, ils ne peuvent plus être modifiés.
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>À quoi servent les statuts manuels ?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Les statuts que vous modifiez manuellement (par exemple : payé, envoyé, etc.) sont uniquement à titre informatif pour votre suivi. Ils n'entraînent pas l'envoi d'e-mails ou de notifications à votre client.
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>Comment contacter le support ?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Pour toute question ou problème, contactez-nous à <a href="mailto:contact@libero.app" class="text-primary underline">contact@libero.app</a>.
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Vuetify expansion panels are used for FAQ
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}
</style> 