import axios from 'axios';

const baseURL = 'https://mis-api.kreosoft.space/api';

const api = axios.create({
    baseURL: baseURL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        return config;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            console.error(error);
            
            window.location.href = '/';
            return null;
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            console.error(error);

            window.location.href = '/';
            return null;
        }
        return Promise.reject(error);
    }
);

export default api;