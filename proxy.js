import { NextResponse } from 'next/server'

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'operadesk_session'

const PUBLIC_PATHS = new Set(['/login'])

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/img')) return true
  if (pathname.startsWith('/favicon')) return true
  return pathname === '/robots.txt' || pathname === '/sitemap.xml'
}

export function proxy(request) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|img/|.*\\..*).*)']
}
