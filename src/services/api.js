// 1. URL untuk Data Film (External Drama API via Vercel Proxy)
const API_BASE_URL = '/api';

// 2. URL untuk Backend Laravel Anda (Auth & Pembayaran)
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.');

const MY_BACKEND_URL = isLocal
    ? `http://${window.location.hostname}:8000/api` // Using 8000 as per .env
    : 'https://be-drama-box-production.up.railway.app/api';

// Optional: Fallback to 8001 if someone explicitly uses it, but 8000 is default
// For now, let's just use 8000 to match Laravel serve default and .env

const handleResponse = async (response) => {
    console.log(`[API Debug] Status: ${response.status} for ${response.url}`);

    // Jika status 401 (Token dihapus di DB)
    if (response.status === 401) {
        console.error("[API Debug] 401 Unauthorized! Kicking user...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Trigger custom event untuk modal modern
        window.dispatchEvent(new CustomEvent('session-expired'));

        throw new Error('Sesi berakhir. Akun Anda mungkin digunakan di perangkat lain.');
    }

    const data = await response.json();
    return data;
};

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || '39b9240dff5068aa756303fe0c7b32aeb2c4ecf0d762886c0b1692768cfd3a92';

export const fetchLatestDramas = async (page = 1, size = 10) => {
    try {
        const response = await fetch(`/stream-api/api-dramabox/new.php?page=${page}&lang=in&pageSize=${size}&api_key=${STREAM_API_KEY}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch dramas:", error);
        throw error;
    }
};

export const searchDramas = async (keyword, page = 1) => {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`/stream-api/api-dramabox/search.php?search=${encodedKeyword}&page=${page}&lang=in&api_key=${STREAM_API_KEY}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to search dramas:", error);
        throw error;
    }
};

const detailCache = new Map();

export const fetchDramaDetail = async (bookId) => {
    if (detailCache.has(bookId)) {
        console.log(`[Cache Hit] Returning cached detail for: ${bookId}`);
        return detailCache.get(bookId);
    }

    try {
        const response = await fetch(`/stream-api/api-dramabox/drama.php?id=${bookId}&lang=in&api_key=${STREAM_API_KEY}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();

        if (data.success) {
            detailCache.set(bookId, data);
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch drama detail:", error);
        throw error;
    }
};

export const fetchDramaChapters = async (bookId) => {
    try {
        const data = await fetchDramaDetail(bookId);
        if (data.success && data.data) {
            return {
                message: "Success",
                data: data.data.chapterList || data.data.chapters || []
            };
        }
        return { message: "No chapters found", data: [] };
    } catch (error) {
        console.error("Failed to fetch drama chapters:", error);
        throw error;
    }
};

export const fetchDramaStream = async (bookId, episode) => {
    try {
        // Use watch.php instead of reusing drama.php
        const index = parseInt(episode) - 1;
        const response = await fetch(`/stream-api/api-dramabox/watch.php?id=${bookId}&index=${index}&lang=in&source=search_result&api_key=${STREAM_API_KEY}`);

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const res = await response.json();

        if (res.success && res.data) {
            return {
                status: 'success',
                data: {
                    chapter: {
                        video: {
                            mp4: res.data.videoUrl || (res.data.qualities && res.data.qualities[0]?.videoPath)
                        },
                        cover: res.data.cover,
                        chapterName: `Episode ${episode}`
                    },
                    // We might need to fetch detail separately to get total episodes if watch.php doesn't provide it
                    allEps: res.data.chapterCount || null
                }
            };
        }
        throw new Error("Episode stream not found");
    } catch (error) {
        console.error("Failed to fetch drama stream:", error);
        throw error;
    }
};

export const fetchDramaDownloadChapters = async (bookId) => {
    try {
        // Keeping this as is, it seems to be using a different proxy/backend
        const response = await fetch(`${API_BASE_URL}/download/${bookId}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch drama download chapters:", error);
        throw error;
    }
};

export const fetchRecommendations = async (page = 1) => {
    try {
        const response = await fetch(`/stream-api/api-dramabox/foryou.php?page=${page}&lang=in&api_key=${STREAM_API_KEY}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        throw error;
    }
};

export const fetchTrendingDramas = async (page = 1) => {
    try {
        const response = await fetch(`/stream-api/api-dramabox/rank.php?page=${page}&lang=in&api_key=${STREAM_API_KEY}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch trending dramas:", error);
        throw error;
    }
};




export const login = async (email, password) => {
    try {
        console.log(`[Auth] Attempting login to: ${MY_BACKEND_URL}/login`);
        const response = await fetch(`${MY_BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.status === 404) {
            console.error("[Auth] Login route not found! Check if backend is running and port is correct.");
            throw new Error("Route login tidak ditemukan di backend.");
        }

        return await response.json();
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
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json', // PENTING: Agar Laravel kirim 401, bukan 302 redirect
                'Cache-Control': 'no-cache'
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
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        return await response.json();
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
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
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
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
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
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
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
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
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
