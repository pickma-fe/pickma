# T60. Auth 비밀번호 정책 강화

- 상태:
  완료

- GitHub Issue:
  223

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T27

- 분류:
  보안

- 사용자 흐름:
  Customer / Seller

- 주 담당 역할:
  Domain

- 보조 역할:
  Shared-FE

- 배경:
  T27에서 이메일 선인증 흐름과 custom SMTP를 도입했다. 현재 비밀번호 유효성 검증은 클라이언트 Zod 스키마(최소 8자)에만 의존하며, Supabase 서버 레벨 비밀번호 정책은 기본값으로 남아 있다. 로그인 실패 rate limit 안내도 없어 사용자가 잠금 상태를 인지하지 못할 수 있다.

- 문제:
  클라이언트 검증만 있으므로 API 직접 호출로 약한 비밀번호 설정이 가능하다. 로그인 실패가 반복될 때 사용자에게 적절한 안내가 없다.

- 작업 내용:
  - Supabase Dashboard 비밀번호 정책(최소 길이, 대소문자/숫자/특수문자 요구) 설정 기준 결정 및 적용
  - 클라이언트 Zod 스키마와 서버 설정 정합성 확인
  - 로그인 실패 rate limit 에러 코드 매핑 및 사용자 안내 메시지 추가
  - 비밀번호 변경 시 동일 비밀번호 입력 에러를 명확한 안내 메시지로 표시

- 관련 파일/영역:
  - `src/app/auth/reset-password/page.tsx`
  - `src/components/auth/AuthModal.tsx`
  - `src/lib/errors/errorCodes.ts`
  - `src/lib/errors/errorMessages.ts`
  - `src/lib/errors/authErrorMessage.ts`

- 예상 난이도:
  낮음

- 완료 기준:
  - Supabase 서버 레벨 비밀번호 정책이 결정되어 설정된다.
  - 클라이언트 검증과 서버 정책이 일치한다.
  - 로그인 rate limit 발생 시 사용자에게 명확한 안내 메시지가 표시된다.
  - 비밀번호 재설정 시 동일 비밀번호 입력에 대한 명확한 에러 안내가 표시된다.
  - 정책 결정 내용이 문서화된다.

- 구현 결과:
  - 비밀번호 정책: 최소 10자, 복잡도 요구 없음 (NIST SP 800-63B Rev.4 방향)
  - Supabase Dashboard 수동 적용 필요: Authentication → Password → Minimum password length: 10 (복잡도 옵션 비활성화)
  - `src/lib/errors/authErrorMessage.ts`: Supabase Auth rate limit 에러(HTTP 429, "rate limit"/"too many" 메시지) → `'요청 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.'`
  - `src/lib/errors/authErrorMessage.ts`: 동일 비밀번호 에러("same password"/"different from the old") → `'현재 사용 중인 비밀번호와 다른 비밀번호를 입력해 주세요.'`
  - `src/lib/errors/authErrorMessage.ts`: 기존 "8자" 안내 메시지를 10자 기준으로 수정
  - `src/app/auth/reset-password/page.tsx`: catch 블록 고정 문자열 → `getAuthErrorMessage(err)` 일원화, resetPasswordSchema 10자
  - `src/components/auth/AuthModal.tsx`: signupSchema 10자, placeholder 10자 이상
  - `src/app/api/auth/_lib/schemas.ts`: completeEmailSignupSchema 10자
  - 테스트: authErrorMessage 19개, email-signup route 6개 통과
