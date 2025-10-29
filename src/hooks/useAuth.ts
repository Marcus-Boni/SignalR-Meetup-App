"use client";

import { useState } from 'react';
import { authService, LoginRequest } from '../services/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    authService.isAuthenticated()
  );
  const [username, setUsername] = useState<string | null>(() => 
    authService.getUsername()
  );

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      
      setIsAuthenticated(true);
      setUsername(response.username);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    username,
    login,
    logout,
  };
}
