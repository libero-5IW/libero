import {useAuthStore} from "@/stores/auth.ts";

export function cleanAllStates() {
    (useAuthStore()).clearState();
}