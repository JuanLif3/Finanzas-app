import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para ver las peticiones
api.interceptors.request.use(request => {
    console.log('Making request:', request.method, request.url);
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    error => {
        console.error('API Error:', error.message);
        return Promise.reject(error);
    }
);

export default api;