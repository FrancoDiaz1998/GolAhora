const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5063/api';

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || errorBody.mensaje || 'Error al comunicarse con el servidor');
    }

    if (response.status === 204) return null;
    return response.json();
}

export function getApiUrl() {
    return API_URL;
}
