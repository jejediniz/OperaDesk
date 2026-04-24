const { spec } = require('../../../../src/server/docs/openapi')
const { NextResponse } = require('next/server')

export function GET() {
  return NextResponse.json(spec)
}
