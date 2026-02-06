'use client';

import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor to add the JWT token from NextAuth session
api.interceptors.request.use(async (config) => {
    // Try localStorage first (for backward compatibility)
    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // If no localStorage token, get from NextAuth session
    if (!token && typeof window !== 'undefined') {
        const session = await getSession();
        if (session && (session as any).accessToken) {
            token = (session as any).accessToken;
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('token');
                const { data } = await axios.post(
                    `${API_URL}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                );

                localStorage.setItem('accessToken', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    });

export default api;
