import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Bảo vệ route /portal — chuyển hướng về /login nếu chưa có token xác thực
  if (!token && pathname.startsWith("/portal")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã có token và truy cập /login thì chuyển hướng vào /portal
  if (token && pathname === "/login") {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = "/portal";
    return NextResponse.redirect(portalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
