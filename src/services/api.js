const API_BASE_URL = '/api';

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
