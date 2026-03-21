import { auth } from '@/lib/auth/server';

export default auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: '/auth/sign-in',
});

export const config = {
  matcher: [
    '/account/:path*',
    // /*
    //  * Match all request paths except for the ones starting with:
    //  * - api (API routes)
    //  * - _next/static (static files)
    //  * - _next/image (image optimization files)
    //  * - favicon.ico (favicon file)
    //  * - auth, account, accounts (public auth routes)
    //  * - root path (/)
    //  */
    // '/((?!api|_next/static|_next/image|favicon.ico|auth|account|accounts|$).*)',
  ],
};
