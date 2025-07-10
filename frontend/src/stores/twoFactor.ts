import { defineStore } from 'pinia'
import apiClient from '@/config/axios'

export const useTwoFactorStore = defineStore('twoFactor', () => {
  async function generate2FA() {
    try {
      const res = await apiClient.post('/2fa/generate')
      return res.data.qrCode
    } catch (err: any) {
      throw err.response?.data?.message || 'Erreur lors de la génération du QR code'
    }
  }

  async function enable2FA(token: string) {
    try {
      const res = await apiClient.post('/2fa/enable', { token })
      return !!res.data.valid
    } catch (err: any) {
      throw err.response?.data?.message || 'Erreur lors de l’activation du 2FA'
    }
  }

  async function disable2FA(password: string) {
    try {
      await apiClient.post('/2fa/disable', { password })
    } catch (err: any) {
      throw err.response?.data?.message || 'Erreur lors de la désactivation du 2FA'
    }
  }

  async function twoFAVerify(userId: string, token: string) {
    try {
      const res = await apiClient.post('/auth/2fa/verify', { userId, token })
      return res.data.token
    } catch (err: any) {
      throw err.response?.data?.message || 'Code 2FA invalide'
    }
  }

  return {
    generate2FA,
    enable2FA,
    disable2FA,
    twoFAVerify,
  }
}) 