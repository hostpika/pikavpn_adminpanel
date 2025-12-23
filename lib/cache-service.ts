
import CryptoJS from 'crypto-js';

const CACHE_SECRET_KEY = process.env.NEXT_PUBLIC_CACHE_KEY || "vpn_admin_secure_cache_key_v1";
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export const CacheService = {
    set: <T>(key: string, data: T, ttl: number = DEFAULT_TTL_MS): void => {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl
            };
            const jsonString = JSON.stringify(item);
            const encrypted = CryptoJS.AES.encrypt(jsonString, CACHE_SECRET_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error("Cache set failed", error);
        }
    },

    get: <T>(key: string): T | null => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;

            const decrypted = CryptoJS.AES.decrypt(encrypted, CACHE_SECRET_KEY).toString(CryptoJS.enc.Utf8);
            if (!decrypted) return null;

            const item: CacheItem<T> = JSON.parse(decrypted);

            if (Date.now() - item.timestamp > item.ttl) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error("Cache get failed", error);
            return null;
        }
    },

    remove: (key: string): void => {
        localStorage.removeItem(key);
    },

    clear: (): void => {
        localStorage.clear();
    }
};
