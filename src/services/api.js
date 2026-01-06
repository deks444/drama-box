// 1. URL untuk Data Film (External Drama API via Vercel Proxy)
const API_BASE_URL = '/api';

// 2. URL untuk Backend Laravel Anda (Auth & Pembayaran)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const MY_BACKEND_URL = isLocal
    ? 'http://localhost:8000/api'
    : 'https://be-drama-box-production.up.railway.app/api';

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

export const fetchLatestDramas = async (page = 1, size = 10) => {
    try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        // Debugging: Ensure key is loaded (restart npm run dev if you just added it)
        if (!apiKey) console.warn("VITE_STREAM_API_KEY is missing! Please restart dev server.");

        const response = await fetch(`/stream-api/api-dramabox/index.php?page=${page}&lang=id`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch dramas:", error);
        throw error;
    }
};

export const searchDramas = async (keyword, page = 1) => {
    try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        // Use encodingURI to safely encode the keyword/query
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`/stream-api/api-dramabox/cari.php?q=${encodedKeyword}&lang=id&page=${page}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to search dramas:", error);
        throw error;
    }
};

export const fetchDramaDetail = async (bookId) => {
    try {
        const response = await fetch(`/stream-api/api-dramabox/drama.php?bookId=${bookId}&lang=id`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch drama detail:", error);
        throw error;
    }
};

export const fetchDramaChapters = async (bookId) => {
    try {
        // Reuse fetchDramaDetail as it contains chapters now
        const data = await fetchDramaDetail(bookId);
        if (data.success && data.data && data.data.chapters) {
            return {
                message: "Success",
                data: data.data.chapters
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
        // Reuse fetchDramaDetail as it contains stream URLs now
        const detailRes = await fetchDramaDetail(bookId);

        if (detailRes.success && detailRes.data && detailRes.data.chapters) {
            // Find chapter by index (episode is 1-based, index is 0-based)
            const chapter = detailRes.data.chapters.find(c => c.index === parseInt(episode) - 1);

            if (chapter) {
                return {
                    status: 'success',
                    data: {
                        chapter: {
                            video: {
                                mp4: chapter.mp4
                            },
                            cover: chapter.cover,
                            chapterName: chapter.name || `Episode ${episode}`
                        },
                        allEps: detailRes.data.dramaInfo?.chapterCount || detailRes.data.chapters.length
                    }
                };
            }
        }
        throw new Error("Episode stream not found");
    } catch (error) {
        console.error("Failed to fetch drama stream:", error);
        throw error;
    }
};

export const fetchDramaDownloadChapters = async (bookId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/download/${bookId}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch drama download chapters:", error);
        throw error;
    }
};

export const fetchRecommendations = async () => {
    try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        // Random page for recommendations to give variety
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const response = await fetch(`/stream-api/api-dramabox/index.php?page=${randomPage}&lang=id`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        throw error;
    }
};

export const fetchTrendingDramas = async () => {
    try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        const response = await fetch(`/stream-api/api-dramabox/top.php?lang=id`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch trending dramas:", error);
        throw error;
    }
};



export const login = async (email, password) => {
    try {
        const response = await fetch(`${MY_BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
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
