import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const USER = 'admin'; 
  const PASS = 'gemini2026'; // He actualizado el año a 2026

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Autenticación Requerida', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Acceso Privado"' },
    });
  }

  const auth = authHeader.split(' ')[1];
  const [user, password] = Buffer.from(auth, 'base64').toString().split(':');

  if (user === USER && password === PASS) {
    return NextResponse.next();
  }

  return new NextResponse('No autorizado', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Acceso Privado"' },
  });
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};