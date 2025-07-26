import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://app:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    apiClient.post('/auth/register', userData),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

export const dataAPI = {
  uploadCSV: (file: File, storeId: string, platform: string) => {
    const formData = new FormData();
    formData.append('salesData', file);
    formData.append('storeId', storeId);
    formData.append('platform', platform);
    
    return apiClient.post('/data/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getSalesData: (params: any) =>
    apiClient.get('/data/sales-data', { params }),
  
  getAnalytics: (params: any) =>
    apiClient.get('/data/analytics', { params }),
  
  addManualEntry: (data: any) =>
    apiClient.post('/data/manual-entry', data),
};

export const forecastAPI = {
  generateForecast: (data: any) =>
    apiClient.post('/forecast/generate', data),
  
  getForecasts: (params: any) =>
    apiClient.get('/forecast/list', { params }),
  
  getForecast: (id: string) =>
    apiClient.get(`/forecast/${id}`),
  
  compareForecasts: (forecastIds: string[]) =>
    apiClient.post('/forecast/compare', { forecastIds }),
  
  deleteForecast: (id: string) =>
    apiClient.delete(`/forecast/${id}`),
};

export const connectorAPI = {
  connectShopify: (data: any) =>
    apiClient.post('/connectors/shopify/connect', data),
  
  connectAmazon: (data: any) =>
    apiClient.post('/connectors/amazon/connect', data),
  
  syncStore: (storeId: string, data: any) =>
    apiClient.post(`/connectors/sync/${storeId}`, data),
  
  getStores: () =>
    apiClient.get('/connectors/stores'),
  
  disconnectStore: (storeId: string) =>
    apiClient.delete(`/connectors/stores/${storeId}`),
};