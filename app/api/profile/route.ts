import { auth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
    // Validate session on the server
    const sessionData = await auth.getSession();
    const session = sessionData?.data?.session;
    const user = sessionData?.data?.user;

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return secure data
    return NextResponse.json({
        message: 'Secure data retrieved',
        user: user,
    });
}