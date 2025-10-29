import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas protegidas que requerem autenticação
const protectedRoutes = ['/tracking', '/chat', '/payment'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtém o token do cookie ou localStorage (via header)
  const token = request.cookies.get('@signalr-demo:token')?.value;
  
  // Se está tentando acessar uma rota protegida sem token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se está tentando acessar login já autenticado
  if (pathname === '/login' && token) {
    const trackingUrl = new URL('/tracking', request.url);
    return NextResponse.redirect(trackingUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
