import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_default_jwt_secret_dev_mode';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      session = payload;
    } catch {
      session = null;
    }
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  // 1. Guard Admin Page Routes (Strict Edge Guard)
  if (isAdminRoute) {
    if (!session || !['admin', 'manager'].includes(session.role)) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard Admin API Routes (Instant 401/403 block before hitting backend handlers)
  if (isAdminApiRoute) {
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: '⛔ وصول محظور: هذه الصفحة والمسار مخصصان لإدارة متجر زيكو ستور فقط.',
        },
        { status: 403 }
      );
    }
  }

  // 3. Guard Customer Dashboard Routes
  if (isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect already-logged-in users away from /login & /signup
  if (isAuthRoute && session) {
    if (['admin', 'manager'].includes(session.role)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
