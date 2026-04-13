import { NextResponse } from 'next/server';

export async function GET(req) {
  const headers = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return NextResponse.json({
    message: "Debug Headers",
    url: req.url,
    method: req.method,
    headers: headers
  });
}
