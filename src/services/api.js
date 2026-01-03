// 1. URL untuk Data Film (External Drama API via Vercel Proxy)
const API_BASE_URL = '/api';

// 2. URL untuk Backend Laravel Anda (Auth & Pembayaran)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const MY_BACKEND_URL = isLocal
    ? 'http://localhost:8000/api'
    : 'https://be-drama-box-production.up.railway.app/api';

const handleResponse = async (response) => {
    if (response.status === 401) {
        // Token tidak valid (mungkin sudah login di tempat lain)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.warn("Session expired or logged in from another device.");

        // Cek jika reload belum dilakukan untuk menghindari loop (meskipun localStorage sudah dihapus)
        alert("Sesi Anda telah berakhir karena Anda login di perangkat lain.");
        window.location.reload();

        throw new Error('Sesi berakhir. Akun Anda mungkin digunakan di perangkat lain.');
    }
    const data = await response.json();
    return data;
};

export const fetchLatestDramas = async (page = 1, size = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/home?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch dramas:", error);
        throw error;
    }
};

export const searchDramas = async (keyword, page = 1) => {
    try {
        const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to search dramas:", error);
        throw error;
    }
};

export const fetchDramaDetail = async (bookId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/detail/${bookId}/v2`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch drama detail:", error);
        throw error;
    }
};

export const fetchDramaChapters = async (bookId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chapters/${bookId}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch drama chapters:", error);
        throw error;
    }
};

export const fetchDramaStream = async (bookId, episode) => {
    try {
        const response = await fetch(`${API_BASE_URL}/stream?bookId=${bookId}&episode=${episode}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch drama stream:", error);
        throw error;
    }
};

export const fetchDramaDownloadChapters = async (bookId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/download/${bookId}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch drama download chapters:", error);
        throw error;
    }
};

export const fetchRecommendations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommend`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        throw error;
    }
};

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
    }
};

export const fetchCategoryDramas = async (id, page = 1, size = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/category/${id}?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch category dramas:", error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${MY_BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const fetchMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const response = await fetch(`${MY_BACKEND_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Fetch me failed:", error);
        throw error;
    }
};

export const register = async (name, email, password) => {
    try {
        const response = await fetch(`${MY_BACKEND_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

export const deleteSubscription = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${MY_BACKEND_URL}/subscriptions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete subscription:", error);
        throw error;
    }
};

export const checkTransactionStatus = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${MY_BACKEND_URL}/subscriptions/check/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to check status:", error);
        throw error;
    }
};

export const fetchSubscriptions = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${MY_BACKEND_URL}/subscriptions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        throw error;
    }
};

export const checkout = async (planId, duration, amount) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${MY_BACKEND_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plan_id: planId,
                duration: duration,
                amount: amount
            })
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Checkout failed:", error);
        throw error;
    }
};
