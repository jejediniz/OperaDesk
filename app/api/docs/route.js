const { renderDocsHtml } = require('../../../src/server/docs/openapi')
const { NextResponse } = require('next/server')

export function GET() {
  return new NextResponse(renderDocsHtml('/api/docs/openapi'), {
    headers: {
      'content-type': 'text/html; charset=utf-8'
    }
  })
}
