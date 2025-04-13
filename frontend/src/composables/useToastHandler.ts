import { toast } from 'vue3-toastify';
import type { ToastStatus } from '@/types';
import router from '@/routes';

export function useToastHandler() {
    const toastTypes: Record<ToastStatus, (content: string) => void> = {
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning
    }

    const showToast = (status: ToastStatus, message: string) => {
        if (!message) return
        toastTypes[status](message)
        window.history.replaceState({}, '', router.currentRoute.value.path)
    }
    
    return { showToast }
}
