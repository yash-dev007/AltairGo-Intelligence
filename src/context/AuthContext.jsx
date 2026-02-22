import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext({
    user: null,
    token: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: () => { }
});

// Safe localStorage wrapper to prevent SecurityError in restrictive browsers
const safeLocalStorage = {
    getItem: (key) => {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: (key, value) => {
        try { window.localStorage.setItem(key, value); } catch (e) { }
    },
    removeItem: (key) => {
        try { window.localStorage.removeItem(key); } catch (e) { }
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(safeLocalStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token or just load user data if stored
            // For MVP, we'll try to fetch /auth/me or just persist user obj
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async (authToken) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                logout(); // Invalid token
            }
        } catch (err) {
            console.error("Auth Check Failed", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setToken(data.token);
        setUser(data.user);
        safeLocalStorage.setItem('token', data.token);
        return data;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        safeLocalStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
