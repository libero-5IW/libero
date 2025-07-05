<template>
  <div class="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f0f4ff] to-[#e0e7ff] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

    <section class="relative pt-20 pb-16 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#4f46e5]/10 dark:from-[#6366f1]/5 dark:to-[#4f46e5]/5"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="pt-16 pb-20 animate-fade-in-up">
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-20 h-20 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow">
                <v-icon icon="mdi-star-four-points" color="white" size="40" />
              </div>
              <div class="absolute -inset-2 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl opacity-20 blur-lg"></div>
            </div>
          </div>

          <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span class="text-primary bg-clip-text text-transparent">Libero</span>
            <br />
            <span class="text-gray-900 dark:text-white">Gérez vos documents professionnels</span>
          </h1>

          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Créez vos <strong>devis</strong>, <strong>contrats</strong> et <strong>factures</strong> personnalisées en toute simplicité.
            <span class="text-primary font-semibold"> Rapide, sûr et adapté aux freelances.</span>
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <RouterLink
              to="/register"
              class="bg-white text-primary font-semibold px-8 py-4 rounded-lg text-lg flex items-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transition"
            >
              <v-icon icon="mdi-flash" size="20" />
              Commencer gratuitement
            </RouterLink>
            <RouterLink
              to="/login"
              class="border-2 border-primary text-primary font-semibold px-8 py-4 rounded-lg text-lg flex items-center gap-2 hover:bg-[#6366f1] hover:text-black transition"
            >
              <v-icon icon="mdi-file-document-outline" size="20" />
              Se connecter
            </RouterLink>
          </div>

          <div class="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check" size="18" color="green" />
              <span>Gratuit à vie</span>
            </div>
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check" size="18" color="green" />
              <span>Documents illimités</span>
            </div>
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check" size="18" color="green" />
              <span>Signature intégrée</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-15  bg-white/50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div class="text-center mb-16 animate-fade-in-up">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pourquoi choisir <span class="text-primary">Libero</span> ?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Un assistant complet pour gérer vos devis, contrats, factures et signatures sans prise de tête.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard
            icon="mdi-lightbulb-on-outline"
            title="Templates Intelligents"
            description="Modèles personnalisables avec variables pré-remplies pour devis, contrats et factures."
            :featured="true"
          />
          <FeatureCard
            icon="mdi-shield-lock-outline"
            title="Conforme & Sécurisé"
            description="Libero respecte les obligations légales et vous permet d’archiver vos documents en toute sécurité."
          />
          <FeatureCard
            icon="mdi-account-group-outline"
            title="Multi-clients"
            description="Gérez facilement plusieurs clients et adaptez vos documents à chacun."
          />
          <FeatureCard
            icon="mdi-clock-outline"
            title="Gain de temps"
            description="Créez vos devis et factures en quelques clics, sans prise de tête."
          />
          <FeatureCard
            icon="mdi-pencil-outline"
            title="Modifiable à volonté"
            description="Modifiez vos documents avant envoi, avec aperçu en temps réel."
          />
          <FeatureCard
            icon="mdi-signature-freehand"
            title="Signature intégrée"
            description="Faites signer vos contrats et devis en ligne, directement depuis l’application."
          />
        </div>
      </div>
    </section>

    <section class="py-15">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 animate-fade-in-up">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Comment ça <span class="text-primary">fonctionne</span> ?
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            De la création à la facturation, tout est fluide.        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StepCard
          number="1"
          icon="mdi-file-document-outline"
          title="Créez un devis"
          description="Sélectionnez un modèle, remplissez les champs et envoyez-le automatiquement."
        />
        <StepCard
          number="2"
          icon="mdi-handshake-outline"
          title="Générez un contrat"
          description="Transformez votre devis en contrat prêt à être signé électroniquement."
        />
        <StepCard
          number="3"
          icon="mdi-file-certificate-outline"
          title="Signez en ligne"
          description="Le client signe depuis son e-mail. Vous êtes notifié instantanément."
        />
        <StepCard
          number="4"
          icon="mdi-receipt-text-outline"
          title="Facturez automatiquement"
          description="Créez la facture automatiquement après signature et suivez les paiements."
        />
      </div>
    </div>
  </section>

  <section class="py-15 bg-gradient-to-r bg-primary text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="animate-fade-in-up">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
           Prêt à simplifier votre administratif ?
        </h2>
        <p class="text-xl mb-8 opacity-90">
          Rejoignez des milliers d'utilisateurs qui ont déjà découvert le plaisir de gérer des documents avec Libero.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/register"
            class="bg-white text-[#6366f1] px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <v-icon icon="mdi-flash" size="20" />
            <span>Créer mon compte gratuit</span>
          </RouterLink>
          <RouterLink
            to="/help"
            class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#6366f1] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <v-icon icon="mdi-book-open-page-variant-outline" size="20" />
            <span>Besoin d'aide ?</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  </div>
</template>

<script setup>
import FeatureCard from '@/components/Landing/FeatureCard.vue';
import StepCard from '@/components/Landing/StepCard.vue';
import { RouterLink } from 'vue-router';
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
