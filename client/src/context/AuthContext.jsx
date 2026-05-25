import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hpr_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // cek token saat pertama load

  // Saat app pertama dibuka — restore session dari token tersimpan
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  /** Login: simpan token + set user */
  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  /** Register: setelah register, auto-login karena register tidak return token */
  const register = useCallback(async (name, email, password, confirmPassword) => {
    await apiRegister(name, email, password, confirmPassword);
    // Register berhasil tapi tidak return token,
    // jadi kita login otomatis untuk mendapat token
    const loginData = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, loginData.token);
    setUser(loginData.user);
    return loginData.user;
  }, []);

  /** Logout: hapus token + reset state */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  /** Update nama user setelah edit profil */
  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
