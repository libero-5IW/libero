<template>
    <CenteredContainer size="lg">
      <div class="shadow-lg shadow-gray-300 border">
        <RegisterForm :data="data" :loading="loading" @submit="handleRegister">
          <template v-slot:header>
            <div class="flex justify-center py-4">
              <div>
                <v-img :src="logo" width="100" />
              </div>
            </div>
          </template>
          <template v-slot:content.additional>
            <div class="text-center">
              <p class="text-gray-600">Vous avez déjà un compte ?</p>
              <router-link to="/login">Se connecter</router-link>
            </div>
          </template>
        </RegisterForm>
      </div>
    </CenteredContainer>
</template>
  
<script setup lang="ts">
  import CenteredContainer from '@/components/Container/CenteredContainer.vue'
  import RegisterForm from '@/components/Auth/RegisterForm.vue'
  import logo from '@/assets/logo.png'
  import { computed, reactive } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import type { RegisterData } from '@/schemas/user.schema'
  
  const authStore = useAuthStore()

  const loading = computed(() => authStore.loading);
  const data = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    addressLine: '',
    postalCode: '',
    city: '',
    country: '',
    legalStatus: '',
    siret: '',
    tvaNumber: ''
  })

  const handleRegister = async (payload: RegisterData) => {
    await authStore.register(payload);
  }

</script>
  