import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function GET() {
    try {
        const db = await getDb();
        const photos = await db.all('SELECT * FROM photos ORDER BY "createdAt" DESC');
        return NextResponse.json(photos);
    } catch (error) {
        console.error('Error fetching my certifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
