import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const RAW_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'operadesk_session'
const IS_PROD = process.env.NODE_ENV === 'production'
const COOKIE_NAME =
  IS_PROD && !RAW_COOKIE_NAME.startsWith('__Host-')
    ? `__Host-${RAW_COOKIE_NAME}`
    : RAW_COOKIE_NAME

const PUBLIC_PATHS = new Set(['/login'])

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/img')) return true
  if (pathname.startsWith('/favicon')) return true
  return pathname === '/robots.txt' || pathname === '/sitemap.xml'
}

function buildLoginRedirect(request, pathname) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

function clearSessionCookie(response) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return response
}

async function isValidSessionToken(token) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return false
  }
  try {
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function proxy(request) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return buildLoginRedirect(request, pathname)
  }

  const valid = await isValidSessionToken(token)
  if (!valid) {
    const redirect = buildLoginRedirect(request, pathname)
    return clearSessionCookie(redirect)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|img/|.*\\..*).*)']
}
