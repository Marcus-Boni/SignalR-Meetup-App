const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7279';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresAt: string;
  tokenType: string;
}

export interface ValidateResponse {
  isValid: boolean;
  username: string;
  userId: string;
  claims: Array<{ type: string; value: string }>;
}

class AuthService {
  private readonly TOKEN_KEY = '@signalr-demo:token';
  private readonly USERNAME_KEY = '@signalr-demo:username';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Fazendo requisição de login para:', `${API_BASE_URL}/api/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao fazer login' }));
      console.error('❌ Erro na resposta:', error);
      throw new Error(error.message || 'Credenciais inválidas');
    }

    const data: LoginResponse = await response.json();
    console.log('✅ Login bem-sucedido:', { username: data.username, tokenType: data.tokenType });
    
    this.setToken(data.token);
    this.setUsername(data.username);
    
    console.log('💾 Token e username salvos no localStorage');

    return data;
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      console.log('⚠️ Nenhum token encontrado');
      return false;
    }

    console.log('🔍 Validando token...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ Token inválido, status:', response.status);
        this.logout();
        return false;
      }

      const data: ValidateResponse = await response.json();
      console.log('✅ Token válido:', { username: data.username });
      return data.isValid;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Timeout na validação do token');
      } else {
        console.error('❌ Erro ao validar token:', error);
      }
      this.logout();
      return false;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      console.log('🚪 Fazendo logout, limpando localStorage e cookies');
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USERNAME_KEY);
      
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      document.cookie = `${this.TOKEN_KEY}=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
    }
  }

  private setUsername(username: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USERNAME_KEY, username);
    }
  }
}

export const authService = new AuthService();
