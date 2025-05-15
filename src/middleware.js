// ─── middleware.js ─────────────────────────────────────────────────────────
import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/SearchCarDesign'],
}

export function middleware(request) {
  // clone so we can safely mutate
  const url = request.nextUrl.clone()
  const { origin, searchParams } = url

  const make  = searchParams.get('make')
  const model = searchParams.get('model')

  // 1) both make & model → /stock/:make/:model
  if (make && model) {
    return NextResponse.redirect(new URL(`/stock/${make}/${model}`, origin))
  }

  // 2) only make → /stock/:make
  if (make) {
    return NextResponse.redirect(new URL(`/stock/${make}`, origin))
  }

  // 3) neither → /stock
  return NextResponse.redirect(new URL('/stock', origin))
}
