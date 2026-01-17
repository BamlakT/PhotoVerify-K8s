import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import { saveImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string || null;
        const description = formData.get('description') as string || null;
        const date = formData.get('date') as string || new Date().toISOString();
        const isPublic = formData.get('isPublic') === '0' ? 0 : 1;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Save image
        const filename = await saveImage(file);
        const id = uuidv4();

        // Generate QR Code data URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify/${id}`;
        const qrCodeData = await QRCode.toDataURL(verifyUrl);

        // Save to database
        const db = await getDb();
        const createdAt = new Date().toISOString();

        await db.run(
            `INSERT INTO photos (id, filename, "originalName", title, description, date, "createdAt", "qrCodeData", "isPublic")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, filename, file.name, title, description, date, createdAt, qrCodeData, isPublic]
        );

        return NextResponse.json({
            id,
            filename,
            verifyUrl,
            qrCodeData
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
