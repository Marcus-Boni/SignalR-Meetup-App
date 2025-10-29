"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const token = authService.getToken();
    
    if (!token) {
      // Sem token, redireciona para login
      router.replace('/login');
    } else {
      // Com token, redireciona para a área protegida
      router.replace('/tracking');
    }
  }, [router]);

  // Loading state enquanto verifica
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}