import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'fta_session';
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

function stripBasePath(pathname: string) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return '/';
  return pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || '/' : pathname;
}

function withBasePath(path: string) {
  if (!BASE_PATH) return path;
  return `${BASE_PATH}${path}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const appPathname = stripBasePath(pathname);
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (appPathname.startsWith('/dashboard') && !session) {
    const loginUrl = new URL(withBasePath('/login'), request.url);
    loginUrl.searchParams.set('next', withBasePath(appPathname));
    return NextResponse.redirect(loginUrl);
  }

  if (appPathname === '/login' && session) {
    return NextResponse.redirect(new URL(withBasePath('/dashboard'), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
