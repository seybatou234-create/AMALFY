import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isLoading: boolean;
  login: (identifier: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUserId = localStorage.getItem('amalfy_user_id') || localStorage.getItem('lepp_user_id') || 'usr_admin_1';
        const u = await api.getMe(storedUserId);
        if (u) {
          setUser(u);
          const storedRole = (localStorage.getItem('amalfy_active_role') || localStorage.getItem('lepp_active_role') as UserRole) || u.roles[0] || 'client';
          setActiveRole(storedRole as UserRole);
        }
      } catch {
        // Fallback user if backend is initializing
        const fallbackUser: User = {
          id: 'usr_admin_1',
          name: 'Seybatou Cissé',
          email: 'seybatou234@gmail.com',
          phone: '+221 77 862 88 38',
          whatsappNumber: '+221778628838',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          roles: ['client', 'pro', 'seller', 'landlord', 'admin'],
          city: 'Dakar',
          quarter: 'Almadies',
          bio: 'Fondateur & Super Admin AMALFY. Électricien certifié & superviseur des prestataires.',
          createdAt: '2026-01-10T10:00:00Z',
          isVerified: true
        };
        setUser(fallbackUser);
        setActiveRole('admin');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (identifier: string) => {
    setIsLoading(true);
    try {
      const u = await api.login(identifier);
      setUser(u);
      localStorage.setItem('amalfy_user_id', u.id);
      setActiveRole(u.roles[0] || 'client');
      localStorage.setItem('amalfy_active_role', u.roles[0] || 'client');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const u = await api.register(data);
      setUser(u);
      localStorage.setItem('amalfy_user_id', u.id);
      setActiveRole(u.roles[0] || 'client');
      localStorage.setItem('amalfy_active_role', u.roles[0] || 'client');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('amalfy_user_id');
    localStorage.removeItem('amalfy_active_role');
    localStorage.removeItem('lepp_user_id');
    localStorage.removeItem('lepp_active_role');
    // Fallback to demo client
    switchUser('usr_admin_1');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateUser(user.id, data);
    setUser(updated);
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const u = await api.getMe(userId);
      setUser(u);
      localStorage.setItem('amalfy_user_id', u.id);
      const newRole = u.roles[0] || 'client';
      setActiveRole(newRole);
      localStorage.setItem('amalfy_active_role', newRole);
    } catch (err) {
      console.error('Failed to switch user', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveRole = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem('amalfy_active_role', role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole: handleSetActiveRole,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
