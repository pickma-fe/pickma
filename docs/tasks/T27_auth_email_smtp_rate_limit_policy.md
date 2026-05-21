# T27. Auth 이메일/Supabase SMTP/rate limit 정책 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  보안

- 사용자 흐름:
  Customer / Seller

- 주 담당 역할:
  Domain

- 보조 역할:
  Shared-FE, Docs

- 배경:
  PickMa는 email/password 자체 회원가입과 OAuth를 함께 사용한다. 따라서 Supabase auth email signup/reset, 이메일 확인, 비밀번호 재설정은 실제 사용자 진입과 계정 복구 흐름에 직접 영향을 준다.

- 문제:
  Supabase 기본 메일 발송 제한, SMTP 미설정, deliverability 문제, rate limit error mapping 부재가 있으면 신규 가입과 비밀번호 재설정이 막히거나 사용자에게 불명확한 실패로 보일 수 있다.

- 작업 내용:
  - 자체 email/password 회원가입에서 이메일 확인을 필수로 둘지 정책을 확정한다.
  - Supabase 기본 메일 제한을 확인하고 custom SMTP 도입 여부와 도입 시점을 결정한다.
  - signup, login, reset password, update password의 rate limit/error mapping을 정리한다.
  - 이메일 미확인, reset 메일 재요청, 만료/잘못된 reset link UX를 점검한다.
  - OAuth 계정과 email/password 계정 병행 시 계정 연결/중복 이메일 처리 정책을 확인한다.
  - 운영 전 테스트 계정/메일 발송 검증 절차를 문서화한다.

- 관련 파일/영역:
  - `src/api/auth/authApi.ts`
  - `src/api/auth/authMapper.ts`
  - `src/hooks/auth/*`
  - `src/components/auth/*`

- 예상 난이도:
  중간

- 완료 기준:
  - email/password 가입, 이메일 확인, 비밀번호 재설정의 운영 정책이 문서화된다.
  - Supabase 기본 메일을 계속 쓸지 custom SMTP를 도입할지 결정되어 있다.
  - auth 이메일 실패/제한 상태의 사용자 안내가 명확하다.
  - 운영 전 메일 발송 검증 체크리스트가 있다.
