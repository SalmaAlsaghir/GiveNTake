import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select('id, title, description, created_at, user_id')
      .eq('id', params.id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description } = await req.json();
    const supabase = createServerSupabaseClient();

    // Ensure ownership
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: col, error: colErr } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', params.id)
      .single();
    if (colErr || !col) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    if (col.user_id !== userRes.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase
      .from('collections')
      .update({ title, description })
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: col, error: colErr } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', params.id)
      .single();
    if (colErr || !col) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    if (col.user_id !== userRes.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Null references
    await supabase.from('listings').update({ collection_id: null }).eq('collection_id', params.id);
    const { data, error } = await supabase.from('collections').delete().eq('id', params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || 'Unknown error' }, { status: 500 });
  }
}


