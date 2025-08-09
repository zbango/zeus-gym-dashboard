/* eslint-disable */
// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, phone, role, gym, password } = (await req.json()) as {
      email: string;
      name: string;
      phone?: string | null;
      role: string;
      gym: string;
      password?: string | null;
    };

    if (!email || !role || !gym) {
      return new Response(JSON.stringify({ error: 'missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'missing server env' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false } });

    // Helper to find user by email by scanning pages (Supabase JS v2 has no getUserByEmail)
    const findUserByEmail = async (targetEmail: string) => {
      const maxPages = 10; // safety limit
      for (let page = 1; page <= maxPages; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        const match = data.users.find(
          (u) => (u.email || '').toLowerCase() === targetEmail.toLowerCase(),
        );
        if (match) return match;
        if (!data.users.length) break;
      }
      return null;
    };

    let userId: string | null = null;
    let existing = await findUserByEmail(email);
    if (!existing) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: password || undefined,
        email_confirm: true,
        app_metadata: { role, gym },
        user_metadata: { name, phone },
      });
      if (createErr) {
        // If duplicate, try to find again
        const dup = await findUserByEmail(email);
        if (!dup) throw createErr;
        existing = dup;
      } else {
        existing = created.user ?? null;
      }
    } else {
      const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password: password || undefined,
        email_confirm: true,
        app_metadata: { role, gym },
        user_metadata: { name, phone },
      });
      if (updErr) throw updErr;
    }
    userId = existing?.id ?? null;
    if (!userId) throw new Error('could not resolve user id');

    // Upsert user_profiles
    const { error: upErr } = await admin
      .from('user_profiles')
      .upsert({ id: userId, gym_id: gym, role });
    if (upErr) throw upErr;

    // Insert staff if missing (unique on gym_id,user_id)
    let staffRow: any | null = null;
    const { data: inserted, error: stErr } = await admin
      .from('staff')
      .insert({
        gym_id: gym,
        user_id: userId,
        name: name || email,
        email,
        role,
        phone,
        active: true,
      })
      .select('id,name,role,phone,email,created_at')
      .single();
    if (stErr) {
      if (stErr.code === '23505') {
        // already exists, fetch it
        const { data, error } = await admin
          .from('staff')
          .select('id,name,role,phone,email,created_at')
          .eq('gym_id', gym)
          .eq('user_id', userId)
          .single();
        if (error) throw error;
        staffRow = data;
      } else {
        throw stErr;
      }
    } else {
      staffRow = inserted;
    }

    return new Response(JSON.stringify({ ok: true, user_id: userId, staff: staffRow }), {
      headers: { 'content-type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  }
});
