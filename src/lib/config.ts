const raw = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV && !raw) {
    throw new Error('VITE_API_URL is not set for development.');
}

export const API_URL = raw ?? '';