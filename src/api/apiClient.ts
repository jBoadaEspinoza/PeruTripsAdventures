import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://tg4jd2gc-8080.brs.devtunnels.ms/api/v1',
  timeout: 30000, // Aumentado de 10s a 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró y no es una petición de login
    if (error.response?.status === 401 && 
        error.response?.data?.errorCode === 'TOKEN_EXPIRED' &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login')) {
      
      originalRequest._retry = true;
      
      // Limpiar token expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Redirigir al login
      window.location.href = '/extranet/login';
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export { apiClient }; 