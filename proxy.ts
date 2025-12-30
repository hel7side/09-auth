// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkSession } from './lib/api/serverApi';

const privateRoutes = [
  '/profile',
  '/notes',
  '/notes/action/create',
  '/notes/action/edit',
];

const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // ✅ Access token exists
  if (accessToken) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // ✅ No access token, but refresh token exists → try refresh
  if (!accessToken && refreshToken) {
    try {
      const sessionRes = await checkSession();
      const setCookieHeader = sessionRes.headers['set-cookie'];

      if (!setCookieHeader) {
        throw new Error('No cookies returned from refresh');
      }

      const response = isPublicRoute
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();

      const cookiesArray = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];

      for (const cookieStr of cookiesArray) {
        const parsed = parse(cookieStr);

        if (parsed.accessToken) {
          response.cookies.set('accessToken', parsed.accessToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: parsed['Max-Age']
              ? Number(parsed['Max-Age'])
              : undefined,
          });
        }

        if (parsed.refreshToken) {
          response.cookies.set('refreshToken', parsed.refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: parsed['Max-Age']
              ? Number(parsed['Max-Age'])
              : undefined,
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Silent refresh failed:', error);

      // ❗ КРИТИЧНО: після невдалого refresh
      if (isPrivateRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  // ❗ No tokens & private route
  if (isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
