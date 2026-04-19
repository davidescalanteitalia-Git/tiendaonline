import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Health check endpoint — usado por Coolify y monitoreo externo
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      app: 'tiendaonline',
      version: process.env.npm_package_version || '1.0.0',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
