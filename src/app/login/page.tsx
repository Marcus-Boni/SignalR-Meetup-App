"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      console.log('✅ Usuário já autenticado, redirecionando...');
      window.location.href = '/tracking';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    console.log('🔐 Iniciando login...');

    const result = await login({ username, password });

    if (result.success) {
      console.log('✅ Login bem-sucedido! Redirecionando...');
      
      // Usa window.location.href para forçar navegação completa no Next.js 15+
      window.location.href = '/tracking';
    } else {
      console.error('❌ Falha no login:', result.error);
      setError(result.error || 'Erro ao fazer login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <span className="text-4xl">🔐</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            SignalR Demo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Campo Username */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite seu usuário"
                disabled={isSubmitting}
              />
            </div>

            {/* Campo Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Digite sua senha"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecionando...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Usuários de Demonstração */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
              Usuários de demonstração:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-center">
                <p className="font-mono text-gray-700 dark:text-gray-300">admin</p>
                <p className="text-gray-500 dark:text-gray-400">admin123</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-center">
                <p className="font-mono text-gray-700 dark:text-gray-300">usuario1</p>
                <p className="text-gray-500 dark:text-gray-400">senha123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Sistema de demonstração com autenticação JWT
        </p>
      </div>
    </div>
  );
}
