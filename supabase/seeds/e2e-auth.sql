-- E2E auth seed — local Supabase Docker stack 전용
-- production / remote dev DB에는 절대 실행하지 않는다.
-- 실행: npx supabase db query --local --file supabase/seeds/e2e-auth.sql
-- idempotent: ON CONFLICT DO UPDATE / DO NOTHING

DO $$
DECLARE
  v_consumer_id  uuid := '00000000-0000-4000-8000-000000000024';
  v_consumer_email text := 'customer1@pickma-seed.local';
  v_seller_id    uuid := '00000000-0000-4000-8000-000000000021';
  v_seller_email text := 'seller1@pickma-seed.local';
  v_admin_id     uuid := '00000000-0000-4000-8000-000000000029';
  v_admin_email  text := 'e2e-admin@pickma.local';
  v_password     text := 'pickma-e2e-password';
BEGIN
  -- ── consumer: 기존 계정에 password 설정 ──────────────────────────
  UPDATE auth.users
     SET encrypted_password = crypt(v_password, gen_salt('bf')),
         updated_at         = now()
   WHERE id = v_consumer_id;

  INSERT INTO auth.identities (
    id, user_id, provider, provider_id, identity_data, created_at, updated_at, last_sign_in_at
  ) VALUES (
    v_consumer_id, v_consumer_id,
    'email', v_consumer_email,
    jsonb_build_object('sub', v_consumer_id::text, 'email', v_consumer_email),
    now(), now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── seller: 기존 계정에 password 설정 ────────────────────────────
  UPDATE auth.users
     SET encrypted_password = crypt(v_password, gen_salt('bf')),
         updated_at         = now()
   WHERE id = v_seller_id;

  INSERT INTO auth.identities (
    id, user_id, provider, provider_id, identity_data, created_at, updated_at, last_sign_in_at
  ) VALUES (
    v_seller_id, v_seller_id,
    'email', v_seller_email,
    jsonb_build_object('sub', v_seller_id::text, 'email', v_seller_email),
    now(), now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── admin: 신규 계정 (deterministic id) ──────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    v_admin_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', 'E2E 관리자'),
    now(), now()
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        updated_at         = now();

  INSERT INTO auth.identities (
    id, user_id, provider, provider_id, identity_data, created_at, updated_at, last_sign_in_at
  ) VALUES (
    v_admin_id, v_admin_id,
    'email', v_admin_email,
    jsonb_build_object('sub', v_admin_id::text, 'email', v_admin_email),
    now(), now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
  VALUES (
    v_admin_id, v_admin_email, 'E2E 관리자', 'admin', 'active', now(), now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = v_admin_email,
        name       = 'E2E 관리자',
        role       = 'admin',
        status     = 'active',
        updated_at = now();

END $$;
