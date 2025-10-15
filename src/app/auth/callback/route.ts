import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    // Handle error case
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    // For now, just redirect to home - the client will handle the session
    // In a production app, you might want to exchange the code for a session here
    return NextResponse.redirect(new URL('/?verified=true', requestUrl.origin));
  }

  // Default redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
