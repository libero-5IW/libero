import axios from 'axios';
import { API_BASE_URL } from './api';
import router from '@/routes';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false
})

// apiClient.interceptors.response.use(
//     async (response) => {
//         return response;
//     },
//     async (error) => {
//         if (error.response) {
//             const status = error.response.status;
//             const errorCode = error.response.data?.errorCode;
//             const authenticationErrors = [ERROR_CODES.INVALID_TOKEN, ERROR_CODES.MISSING_TOKEN];
            
//             if (status === 401 && authenticationErrors.includes(errorCode)) {
//                 await useAuthStore().logout();
//             }if (status === 403 && errorCode === ERROR_CODES.ACCESS_DENIED) {
//                 await router.push({ name: "Forbidden" });
//             }
//         }
//         return Promise.reject(error);
//     }
// );


export default apiClient;
