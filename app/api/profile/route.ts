import * as NeonServerAuth from '@neondatabase/neon-js/auth/next/server';
import { NextResponse } from 'next/server';

// cast the import to any so TypeScript is happy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { neonAuth } = NeonServerAuth as any;

export async function GET() {
    // Validate session on the server
    const { session, user } = await neonAuth();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return secure data
    return NextResponse.json({
        message: 'Secure data retrieved',
        user: user,
    });
}