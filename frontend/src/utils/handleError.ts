import type { AxiosError } from 'axios'
import { useToastHandler } from '@/composables/useToastHandler'
import { ZodError } from 'zod'

export function handleError(
  error: unknown,
  fallbackMessage = 'Une erreur est survenue.'
) {
  const { showToast } = useToastHandler()

  if (error instanceof ZodError) {
    const messages = error.errors.map(e => e.message)
    showToast('error', messages.join('\n'))
    return
  }

  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const rawMessage = axiosError.response?.data?.message
  const finalMessage = Array.isArray(rawMessage)
    ? rawMessage.join('\n')
    : rawMessage || fallbackMessage

  showToast('error', finalMessage)
}
