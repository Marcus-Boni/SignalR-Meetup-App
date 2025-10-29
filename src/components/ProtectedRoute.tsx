"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = authService.getToken();
      
      if (!token) {
        console.log('❌ Sem token, redirecionando para login');
        if (isMounted) {
          window.location.href = '/login';
        }
        return;
      }

      try {
        console.log('🔍 Validando token...');
        const valid = await authService.validateToken();
        
        if (!isMounted) return;

        if (valid) {
          console.log('✅ Token válido, renderizando conteúdo');
          setIsValid(true);
        } else {
          console.log('❌ Token inválido, redirecionando para login');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('❌ Erro na validação:', error);
        if (isMounted) {
          window.location.href = '/login';
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);  

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return <>{children}</>;
}
