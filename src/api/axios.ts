import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const isLoginRequest = config.url?.includes('/auth/login');
    if (token && !isLoginRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token vencido o inválido → limpiar y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;