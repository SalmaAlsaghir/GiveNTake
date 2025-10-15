import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, username, phone_number } = await req.json();
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Check if profile already exists
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ ok: true, created: false });
    }

    // Create profile if not exists
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        username: username || (email?.split('@')[0] ?? 'user'),
        email,
        phone_number: phone_number ?? null,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || 'Unknown error' }, { status: 500 });
  }
}
