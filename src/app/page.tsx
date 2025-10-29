"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = authService.getToken();
    
    if (!token) {
      router.replace('/login');
    } else {
      router.replace('/tracking');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#ff6b35] mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Carregando...</p>
      </div>
    </div>
  );
}