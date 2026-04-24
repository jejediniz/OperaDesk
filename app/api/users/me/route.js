const { authenticate, run } = require('../../../../src/server/nextApi')
const { NextResponse } = require('next/server')

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request)

    return NextResponse.json({
      success: true,
      message: 'Acesso autorizado',
      data: user
    })
  })
}
