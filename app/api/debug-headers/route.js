import { NextResponse } from 'next/server';

// Ruta de debug deshabilitada en producción por seguridad.
// Exponer headers HTTP internos (cookies, tokens, IPs) es un riesgo de seguridad.
export async function GET() {
  return NextResponse.json(
    { error: 'Esta ruta está deshabilitada en producción.' },
    { status: 403 }
  );
}
