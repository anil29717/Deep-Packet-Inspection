import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const flowService = {
    getLatestFlows: (limit = 100) => api.get(`/flows/latest?limit=${limit}`),
    searchFlows: (params) => api.get('/flows/search', { params }),
};

export const statsService = {
    getTopApps: (hours = 24) => api.get(`/stats/top-apps?hours=${hours}`),
    getTopTalkers: (hours = 24) => api.get(`/stats/top-talkers?hours=${hours}`),
};

export const employeeService = {
    getAll: () => api.get('/employees'),
    getIps: (id) => api.get(`/employees/${id}/ips`),
    uploadCSV: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/employees/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export const deepPacketService = {
    getRecent: (limit = 100) => api.get(`/deep-packets/recent?limit=${limit}`),
    getByProtocol: (protocol, limit = 50) => api.get(`/deep-packets/protocol/${protocol}?limit=${limit}`)
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
};

export default api;
