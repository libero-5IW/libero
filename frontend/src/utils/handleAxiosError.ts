import type { AxiosError } from 'axios'
import { useToastHandler } from '@/composables/useToastHandler'

export function handleAxiosError(
  error: unknown,
  fallbackMessage = 'Une erreur est survenue.'
) {
  const { showToast } = useToastHandler()

  const axiosError = error as AxiosError<{ message?: string | string[] }>

  const rawMessage = axiosError.response?.data?.message
  const finalMessage = Array.isArray(rawMessage)
    ? rawMessage.join('\n')
    : rawMessage || fallbackMessage

  showToast('error', finalMessage)
}
