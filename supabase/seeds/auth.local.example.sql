-- local/dev auth seed — 원격 dev DB 전용
-- production DB에는 절대 실행하지 않는다.
--
-- 사용법:
--   1. 이 파일을 supabase/seeds/auth.local.sql 로 복사한다.
--   2. LOCAL_ADMIN_ID, LOCAL_ADMIN_EMAIL, LOCAL_ADMIN_PASSWORD 를 실제 값으로 교체한다.
--   3. 아래 중 하나로 실행한다:
--      a) supabase db query --linked --file supabase/seeds/auth.local.sql
--      b) npx supabase db query --linked --file supabase/seeds/auth.local.sql
--      c) Supabase 대시보드 SQL Editor 에 내용을 붙여넣어 실행
--
-- 같은 패턴으로 seller/customer 계정도 추가할 수 있다.
-- auth.local.sql 은 .gitignore 에 의해 커밋되지 않는다.

-- pgcrypto 확장이 활성화되어 있어야 한다 (migration 에서 이미 활성화됨).

DO $$
DECLARE
  v_user_id  uuid := 'LOCAL_ADMIN_ID';   -- 예: gen_random_uuid() 결과
  v_email    text := 'LOCAL_ADMIN_EMAIL'; -- 예: 'admin@example.com'
  v_password text := 'LOCAL_ADMIN_PASSWORD'; -- 평문 비밀번호 (hash 는 아래에서 생성)
  v_name     text := '관리자';
BEGIN
  -- auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', v_name),
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        updated_at = now();

  -- auth.identities (email provider)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider,
    identity_data,
    created_at,
    updated_at,
    last_sign_in_at
  ) VALUES (
    v_user_id,
    v_user_id,
    'email',
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, id) DO NOTHING;

  -- public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_email,
    v_name,
    'admin',
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email  = v_email,
        name   = v_name,
        role   = 'admin',
        status = 'active',
        updated_at = now();

END $$;
