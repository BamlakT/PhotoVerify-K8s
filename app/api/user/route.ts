import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function GET() {
    try {
        const db = await getDb();
        const user = await db.get("SELECT * FROM users WHERE id = 'current-user'");

        if (!user) {
            return NextResponse.json({});
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const db = await getDb();
        const updatedAt = new Date().toISOString();

        // Check if user exists
        const existing = await db.get("SELECT id FROM users WHERE id = 'current-user'");

        if (existing) {
            await db.run(
                `UPDATE users SET 
                    "firstName" = ?, "lastName" = ?, "birthDate" = ?, email = ?, 
                    phone = ?, profession = ?, "zipCode" = ?, city = ?, 
                    country = ?, "cryptoSignature" = ?, "updatedAt" = ?
                WHERE id = 'current-user'`,
                [
                    data.firstName, data.lastName, data.birthDate, data.email,
                    data.phone, data.profession, data.zipCode, data.city,
                    data.country, data.cryptoSignature, updatedAt
                ]
            );
        } else {
            await db.run(
                `INSERT INTO users (
                    id, "firstName", "lastName", "birthDate", email, 
                    phone, profession, "zipCode", city, 
                    country, "cryptoSignature", "updatedAt"
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'current-user', data.firstName, data.lastName, data.birthDate, data.email,
                    data.phone, data.profession, data.zipCode, data.city,
                    data.country, data.cryptoSignature, updatedAt
                ]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
