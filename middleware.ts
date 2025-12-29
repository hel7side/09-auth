import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  /**
   * CASE 1: accessToken відсутній, але є refreshToken → refresh session
   */
  if (!accessToken && refreshToken) {
    const refreshResponse = await fetch(`${origin}/api/auth/check-session`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (refreshResponse.ok) {
      const res = NextResponse.next();

      const setCookie = refreshResponse.headers.get("set-cookie");
      if (setCookie) {
        res.headers.set("set-cookie", setCookie);
      }

      // після refresh дозволяємо доступ
      if (isPublic) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return res;
    }

    // refresh неуспішний → logout
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  /**
   * CASE 2: неавтентифікований доступ до private routes
   */
  if (!accessToken && isPrivate) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  /**
   * CASE 3: автентифікований доступ до auth routes
   */
  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
