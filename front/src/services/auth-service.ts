import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface UpdateProfileData {
  username?: string;
  email?: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
      const { user, access_token } = response.data;
      
      // Stocker le token dans un cookie
      Cookies.set('auth-token', access_token, { 
        expires: 7, // 7 jours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Mettre à jour le store d'authentification
      useAuthStore.getState().login(user, access_token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
      const { user, access_token } = response.data;
      
      // Stocker le token dans un cookie
      Cookies.set('auth-token', access_token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Mettre à jour le store d'authentification
      useAuthStore.getState().login(user, access_token);
      
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  logout(): void {
    // Supprimer le token du cookie
    Cookies.remove('auth-token');
    
    // Mettre à jour le store d'authentification
    useAuthStore.getState().logout();
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = Cookies.get('auth-token');
      
      if (!token) {
        return null;
      }
      
      const response = await axios.get<User>(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  },
  
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const token = Cookies.get('auth-token');
      
      if (!token) {
        throw new Error('Non autorisé');
      }
      
      const response = await axios.patch<User>(`${API_URL}/auth/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};