import { NextResponse } from 'next/server';
import { mockClaims } from '@/data/mockClaims';

export async function GET() {
  return NextResponse.json(mockClaims);
}