# T55. 소비자 프로필 수정 화면 구현

- 상태:
  완료

- GitHub Issue:
  177

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: 없음

- 분류:
  화면/UI

- 사용자 흐름:
  Consumer

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/mypage/profile` 경로가 미구현 상태임을 확인했다. PRD C-MY-03 요구사항에 해당한다.

- 문제:
  소비자가 닉네임, 연락처 등 프로필 정보를 수정할 수 없다.

- 작업 내용:
  - `/mypage/profile` 페이지 구현
  - 닉네임, 연락처 수정 폼
  - 저장 후 현재 내 정보 페이지 유지
  - 실제 로그인 provider 표시
  - 회원 탈퇴 soft delete 흐름 연결
  - 로그인 guard 적용

- 관련 파일/영역:
  - `src/app/(consumer)/mypage/profile/`
  - `src/api/users/` (프로필 수정 API)

- 예상 난이도:
  낮음

- 완료 기준:
  - `/mypage/profile`에서 닉네임과 연락처를 수정하고 저장할 수 있다.
  - 저장 후 `/mypage/profile` 현재 페이지에 머무른다.
  - 실제 로그인 provider가 있으면 내 정보 화면에 해당 로그인 방식을 표시한다.
  - 회원 탈퇴 시 계정이 비활성화되고 로그아웃된다.
  - 비로그인 사용자는 `/mypage/profile` 접근 시 로그인 guard 흐름을 따른다.

- 구현 결과:
  - `/mypage/profile` 페이지와 `ProfileEditPageContent` 구현.
  - `useUpdateMe`와 `userApi.updateMe`를 연결해 닉네임, 연락처, 프로필 이미지를 수정.
  - 로그인 provider가 없을 때 특정 provider를 단정하지 않도록 표시 로직 정리.
  - `useDeleteMe`와 로그아웃 흐름을 연결해 회원 탈퇴 후 홈으로 이동.
  - `ProfileEditPageContent.test.tsx`로 provider 표시와 회원 탈퇴 흐름을 검증.
