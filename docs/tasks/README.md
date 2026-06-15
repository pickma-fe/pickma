# PickMa Task Board

PickMa 심화 프로젝트 task의 공유 기준 문서다. `temp/`는 로컬 계획, 리뷰, 체크포인트용 임시 공간이므로 팀원이 참고해야 하는 task 원본은 이 디렉터리에서 관리한다.

## 사용 원칙

- Task ID는 영구 ID로 사용하며 파일명이나 제목이 바뀌어도 ID는 재사용하지 않는다.
- 개별 task의 상태는 `진행 전`, `진행 중`, `완료`, `변경됨` 중 하나만 사용한다.
- GitHub Issue는 번호만 기록한다. 아직 없으면 `확인 필요`로 둔다.
- 작업자는 보통 본인이 issue를 만들고 assignee로 지정한 뒤 task 문서의 `GitHub Issue`를 갱신한다.
- `temp/`에 생성하는 task 관련 산출물은 task ID를 파일명 맨 앞에 둔다. 예: `temp/T02-plan.md`, `temp/T02-code-review.md`, `temp/T02-checkpoint.md`.
- task 실행 전에는 개별 task 문서와 관련 architecture/docs를 함께 확인한다.
- task 완료 전에는 관련 `docs/*` 최신화 필요 여부를 확인한다. 문서 수정이 필요하지만 해당 task 범위를 넘으면 후속 task 또는 `확인 필요`로 남긴다.
- 스키마 변경이 포함된 task는 `docs/migration_policy.md`를 먼저 확인한다.

## 우선순위

| 우선순위 | 의미                                            |
| -------- | ----------------------------------------------- |
| P0       | 심화 프로젝트 전에 반드시 처리                  |
| P1       | 심화 프로젝트 초반 필수                         |
| P2       | 심화 프로젝트 중 진행                           |
| P3       | 이후 확장 단계 고려                             |
| P4       | 사용자 영향 없는 기술 부채 · 코드 품질 · 최적화 |

## Task Breakdown

| ID  | Task                                                         | 우선순위 | 상태    | GitHub Issue | 직접 선행 task                    | 파일                                                                                                             |
| --- | ------------------------------------------------------------ | -------- | ------- | ------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| T01 | 결제 confirm 보상 정책 확정                                  | P0       | 완료    | 155          | 없음                              | [T01_payment_confirm_compensation_policy.md](T01_payment_confirm_compensation_policy.md)                         |
| T02 | 판매자 주문 관리 real API 연결                               | P0       | 완료    | 164          | 없음                              | [T02_seller_orders_real_api.md](T02_seller_orders_real_api.md)                                                   |
| T03 | 관리자 판매자 승인 화면 구현                                 | P0       | 완료    | 216          | T07                               | [T03_admin_seller_approval_page.md](T03_admin_seller_approval_page.md)                                           |
| T04 | 관리자 가게 목록 real endpoint 및 화면 구현                  | P0       | 완료    | 230          | T07                               | [T04_admin_stores_real_endpoint_page.md](T04_admin_stores_real_endpoint_page.md)                                 |
| T05 | 상품 목록 할인율 필터/정렬 DB pagination 복구                | P0       | 완료    | 183          | T08                               | [T05_product_discount_sort_db_pagination.md](T05_product_discount_sort_db_pagination.md)                         |
| T06 | Storage orphan 및 개인정보 cleanup 정책 확정                 | P0       | 완료    | 161          | 없음                              | [T06_storage_orphan_privacy_cleanup_policy.md](T06_storage_orphan_privacy_cleanup_policy.md)                     |
| T07 | service role 사용 기준 및 owner scope 테스트 수립            | P0       | 완료    | 175          | 없음                              | [T07_service_role_owner_scope_tests.md](T07_service_role_owner_scope_tests.md)                                   |
| T08 | incremental migration 전환 결정                              | P0       | 완료    | 178          | 없음                              | [T08_incremental_migration_policy.md](T08_incremental_migration_policy.md)                                       |
| T09 | 501 API 및 UI 노출 목록 정리                                 | P0       | 완료    | 201          | 없음                              | [T09_api_501_ui_exposure_inventory.md](T09_api_501_ui_exposure_inventory.md)                                     |
| T10 | 판매자 운영 상태 정책 및 구현                                | P1       | 완료    | 205          | T08                               | [T10_seller_operation_status.md](T10_seller_operation_status.md)                                                 |
| T11 | 결제 outbox/webhook/idempotency 설계                         | P1       | 완료    | 209          | T01                               | [T11_payment_outbox_webhook_idempotency.md](T11_payment_outbox_webhook_idempotency.md)                           |
| T12 | 공개 상품 목록 Server Component 초기 데이터 전환             | P1       | 완료    | 165          | T05                               | [T12_public_product_list_server_initial_data.md](T12_public_product_list_server_initial_data.md)                 |
| T13 | 상품 상세 Server Component 초기 데이터 전환                  | P1       | 완료    | 167          | 없음                              | [T13_product_detail_server_initial_data.md](T13_product_detail_server_initial_data.md)                           |
| T14 | seller/admin role-aware route guard 개선                     | P1       | 완료    | 212          | T07                               | [T14_role_aware_route_guard.md](T14_role_aware_route_guard.md)                                                   |
| T15 | TanStack Query key 및 invalidation factory 도입              | P1       | 완료    | 190          | T02                               | [T15_tanstack_query_key_invalidation_factory.md](T15_tanstack_query_key_invalidation_factory.md)                 |
| T16 | upload URL purpose별 권한 정책 강화                          | P1       | 완료    | 198          | T07, T61                          | [T16_upload_url_purpose_permission_policy.md](T16_upload_url_purpose_permission_policy.md)                       |
| T17 | dev-test route 제거 또는 dev-only guard                      | P1       | 완료    | 213          | 없음                              | [T17_dev_test_route_guard.md](T17_dev_test_route_guard.md)                                                       |
| T18 | mock import 금지 기준 정리                                   | P1       | 완료    | 211          | 없음                              | [T18_mock_import_policy.md](T18_mock_import_policy.md)                                                           |
| T19 | 문서 baseline 정합성 및 지속 갱신 규칙 정리                  | P0       | 완료    | 169          | 없음                              | [T19_documentation_consistency_update.md](T19_documentation_consistency_update.md)                               |
| T20 | Route Handler `_lib` 횡단 import 정리                        | P1       | 완료    | 221          | 없음                              | [T20_route_handler_lib_import_cleanup.md](T20_route_handler_lib_import_cleanup.md)                               |
| T21 | 지도 기반 조회 및 거리순 정렬                                | P2       | 완료    | 260          | T08, T05                          | [T21_map_based_search_distance_sort.md](T21_map_based_search_distance_sort.md)                                   |
| T22 | 실시간 알림 기반 설계 및 1차 구현                            | P2       | 완료    | 267          | T11, T62                          | [T22_realtime_notification_foundation.md](T22_realtime_notification_foundation.md)                               |
| T23 | E2E 테스트 및 결제 팝업 모킹 전략                            | P3       | 진행 전 | 확인 필요    | T01, T02, T03, T04, T24           | [T23_e2e_payment_popup_mocking_strategy.md](T23_e2e_payment_popup_mocking_strategy.md)                           |
| T24 | CI 기본 파이프라인 구축                                      | P1       | 완료    | 173          | 없음                              | [T24_ci_lint_test_pipeline.md](T24_ci_lint_test_pipeline.md)                                                     |
| T25 | hook input Domain/UI 타입 분리                               | P2       | 완료    | 252          | T15                               | [T25_hook_input_domain_ui_type_split.md](T25_hook_input_domain_ui_type_split.md)                                 |
| T26 | 운영 화면 summary/list API 분리                              | P2       | 진행 중 | 264          | T04                               | [T26_admin_seller_summary_list_api_split.md](T26_admin_seller_summary_list_api_split.md)                         |
| T27 | Auth 이메일/Supabase SMTP/rate limit 정책 정리               | P0       | 완료    | 186          | 없음                              | [T27_auth_email_smtp_rate_limit_policy.md](T27_auth_email_smtp_rate_limit_policy.md)                             |
| T28 | 판매자 상품 수정 진입점 결정 및 구현                         | P2       | 완료    | 229          | T15                               | [T28_seller_product_edit_entrypoint.md](T28_seller_product_edit_entrypoint.md)                                   |
| T29 | 판매자 제출 문서 확인 UX 개선                                | P2       | 완료    | 236          | T06, T44, T61                     | [T29_seller_document_review_ux.md](T29_seller_document_review_ux.md)                                             |
| T30 | AI 추천 1차 설계                                             | P3       | 진행 전 | 확인 필요    | T25, T05                          | [T30_ai_recommendation_first_design.md](T30_ai_recommendation_first_design.md)                                   |
| T31 | 주문 취소/환불 API 구현                                      | P1       | 완료    | 246          | T11, T02, T62                     | [T31_order_cancel_refund_api.md](T31_order_cancel_refund_api.md)                                                 |
| T32 | 정산/수수료 시스템 설계                                      | P3       | 진행 전 | 확인 필요    | T31                               | [T32_settlement_fee_system_design.md](T32_settlement_fee_system_design.md)                                       |
| T33 | 네이티브 앱 결제 방식 재검토                                 | P3       | 진행 전 | 확인 필요    | T01                               | [T33_native_app_payment_review.md](T33_native_app_payment_review.md)                                             |
| T34 | 리뷰/평점 도메인 설계                                        | P3       | 진행 전 | 확인 필요    | 없음                              | [T34_review_rating_domain_design.md](T34_review_rating_domain_design.md)                                         |
| T35 | AppError 객체 인수 리팩터링                                  | P4       | 진행 전 | 확인 필요    | 없음                              | [T35_apperror_object_argument_refactor.md](T35_apperror_object_argument_refactor.md)                             |
| T36 | 판매자 신청 서류 수정/재업로드 정책                          | P3       | 진행 전 | 확인 필요    | T06, T44, T61                     | [T36_seller_application_document_reupload_policy.md](T36_seller_application_document_reupload_policy.md)         |
| T37 | 운영 CS/모니터링/관리자 권한 정책 정리                       | P3       | 진행 전 | 확인 필요    | T01, T06                          | [T37_ops_cs_monitoring_admin_permission_policy.md](T37_ops_cs_monitoring_admin_permission_policy.md)             |
| T38 | 판매자 랜딩/온보딩 CTA 정리                                  | P2       | 완료    | 244          | T10                               | [T38_seller_landing_onboarding_cta.md](T38_seller_landing_onboarding_cta.md)                                     |
| T39 | public 이미지 자산 구조 및 Footer badge 크기 정리            | P1       | 완료    | 259          | T18                               | [T39_public_image_asset_footer_badge_cleanup.md](T39_public_image_asset_footer_badge_cleanup.md)                 |
| T40 | Storage orphan cleanup API 및 hook 통합                      | P1       | 완료    | 235          | T06                               | [T40_storage_orphan_cleanup_api_hook.md](T40_storage_orphan_cleanup_api_hook.md)                                 |
| T41 | Storage lifecycle 주기적 orphan scanner                      | P2       | 완료    | 256          | T40, T43                          | [T41_storage_lifecycle_cron.md](T41_storage_lifecycle_cron.md)                                                   |
| T42 | 법적 고지 페이지 및 동의 흐름 구현                           | P1       | 완료    | 204          | T44, T61                          | [T42_legal_compliance_pages.md](T42_legal_compliance_pages.md)                                                   |
| T43 | Vercel 배포 설정 및 Cron 환경 구성                           | P2       | 완료    | 254          | T24                               | [T43_vercel_deployment_config.md](T43_vercel_deployment_config.md)                                               |
| T44 | 판매자 신분증 원본 처리 및 KYC 보관 정책 결정                | P0       | 완료    | 191          | T06                               | [T44_seller_id_document_kyc_policy.md](T44_seller_id_document_kyc_policy.md)                                     |
| T45 | UI/UX 및 접근성 baseline 기준 수립                           | P1       | 완료    | 238          | T09                               | [T45_ui_accessibility_baseline_policy.md](T45_ui_accessibility_baseline_policy.md)                               |
| T46 | Consumer UI/UX 및 접근성 개선                                | P2       | 진행 전 | 확인 필요    | T45, T64, T65, T12, T13           | [T46_consumer_ui_accessibility_improvement.md](T46_consumer_ui_accessibility_improvement.md)                     |
| T47 | Seller UI/UX 및 접근성 개선                                  | P2       | 진행 전 | 확인 필요    | T45, T64, T65, T28, T29, T38, T52 | [T47_seller_ui_accessibility_improvement.md](T47_seller_ui_accessibility_improvement.md)                         |
| T48 | Admin UI/UX 및 접근성 개선                                   | P2       | 진행 전 | 확인 필요    | T45, T64, T65, T03, T04, T26      | [T48_admin_ui_accessibility_improvement.md](T48_admin_ui_accessibility_improvement.md)                           |
| T49 | Auth/Payment/Legal UI/UX 및 접근성 개선                      | P2       | 완료    | 271          | T45, T64, T65, T27, T42           | [T49_auth_payment_legal_ui_accessibility_improvement.md](T49_auth_payment_legal_ui_accessibility_improvement.md) |
| T50 | 판매자 심사 대기 화면 구현                                   | P1       | 완료    | 180          | 없음                              | [T50_seller_pending_page.md](T50_seller_pending_page.md)                                                         |
| T51 | 판매자 대시보드 메인 화면 구현                               | P1       | 완료    | 202          | T10, T15                          | [T51_seller_dashboard_page.md](T51_seller_dashboard_page.md)                                                     |
| T52 | 판매자 주문 상세 화면 구현                                   | P1       | 완료    | 185          | T02                               | [T52_seller_order_detail_page.md](T52_seller_order_detail_page.md)                                               |
| T53 | 판매자 가게 정보 수정 화면 구현                              | P1       | 완료    | 219          | T15, T16                          | [T53_seller_store_edit_page.md](T53_seller_store_edit_page.md)                                                   |
| T54 | 소비자 주문 내역 정합성 및 마이페이지 기본 화면 정리         | P1       | 완료    | 208          | T15                               | [T54_consumer_orders_page.md](T54_consumer_orders_page.md)                                                       |
| T55 | 소비자 프로필 수정 화면 구현                                 | P2       | 완료    | 177          | 없음                              | [T55_consumer_profile_edit_page.md](T55_consumer_profile_edit_page.md)                                           |
| T56 | 상품 검색 결과 화면 구현                                     | P2       | 완료    | 194          | T05, T12                          | [T56_search_result_page.md](T56_search_result_page.md)                                                           |
| T57 | 관리자 사용자·상품·주문 관리 화면 구현                       | P3       | 완료    | 245          | T04                               | [T57_admin_users_products_orders_pages.md](T57_admin_users_products_orders_pages.md)                             |
| T58 | 관리자 대시보드 통계 화면 구현                               | P1       | 완료    | 239          | T07                               | [T58_admin_dashboard_statistics.md](T58_admin_dashboard_statistics.md)                                           |
| T59 | 소비자 찜 목록 화면 및 API 구현                              | P3       | 진행 전 | 확인 필요    | T15                               | [T59_consumer_wishlist_page.md](T59_consumer_wishlist_page.md)                                                   |
| T60 | Auth 비밀번호 정책 강화                                      | P1       | 완료    | 223          | T27                               | [T60_auth_password_policy.md](T60_auth_password_policy.md)                                                       |
| T61 | 판매자 신청 서류 문서 타입 정리 (신분증 제거 및 타입명 통일) | P1       | 완료    | 195          | T44                               | [T61_seller_id_card_removal.md](T61_seller_id_card_removal.md)                                                   |
| T62 | payment_events 테이블 migration 및 이벤트 contract 구현      | P1       | 완료    | 226          | T11                               | [T62_payment_events_migration_contract.md](T62_payment_events_migration_contract.md)                             |
| T63 | POST /api/payments/webhook Route Handler 구현                | P1       | 완료    | 231          | T62                               | [T63_payment_webhook_route_handler.md](T63_payment_webhook_route_handler.md)                                     |
| T64 | 공통 컴포넌트 접근성 baseline 적용                           | P1       | 완료    | 250          | T45                               | [T64_shared_component_accessibility_baseline.md](T64_shared_component_accessibility_baseline.md)                 |
| T65 | 도메인 컴포넌트 폴더 구조 통일                               | P1       | 완료    | 253          | T64                               | [T65_domain_component_folder_unification.md](T65_domain_component_folder_unification.md)                         |
| T66 | 모바일 앱 래핑 (Capacitor / PWA)                             | P3       | 진행 중 | 277          | T45                               | [T66_mobile_app_capacitor_pwa.md](T66_mobile_app_capacitor_pwa.md)                                               |
| T67 | i18n 기본 설정 (next-intl, 한국어)                           | P3       | 진행 전 | 확인 필요    | T45                               | [T67_i18n_setup.md](T67_i18n_setup.md)                                                                           |
| T68 | 지도 UI/UX 개선                                              | P2       | 완료    | 266          | T21                               | [T68_map_ui_ux_improvement.md](T68_map_ui_ux_improvement.md)                                                     |
| T69 | 소비자 위치/검색 기능 확장                                   | P3       | 진행 전 | 확인 필요    | T21                               | [T69_consumer_location_search_extension.md](T69_consumer_location_search_extension.md)                           |
| T70 | 알림 센터 UI 구현                                            | P3       | 진행 전 | 확인 필요    | T22                               | [T70_notification_center_ui.md](T70_notification_center_ui.md)                                                   |
| T71 | 관리자 운영 알람 구현                                        | P3       | 진행 전 | 확인 필요    | T22, T63                          | [T71_admin_operation_alert.md](T71_admin_operation_alert.md)                                                     |
| T72 | 관리자 가게 상태 변경 API 구현                               | P3       | 진행 전 | 확인 필요    | T04                               | [T72_admin_store_status_api.md](T72_admin_store_status_api.md)                                                   |
| T73 | 파일 업로드 MIME type·크기 검증 강화                         | P3       | 진행 전 | 확인 필요    | T16, T40                          | [T73_file_upload_validation.md](T73_file_upload_validation.md)                                                   |
| T74 | Supabase select 쿼리 반환 타입 안전성 개선                   | P4       | 진행 전 | 확인 필요    | 없음                              | [T74_supabase_select_type_safety.md](T74_supabase_select_type_safety.md)                                         |
| T75 | 백엔드 전용 lib을 app/api/\_lib으로 분리                     | P4       | 진행 전 | 확인 필요    | 없음                              | [T75_backend_lib_separation.md](T75_backend_lib_separation.md)                                                   |
| T76 | Route Handler·Hook 테스트 보강                               | P3       | 진행 전 | 확인 필요    | T24                               | [T76_route_handler_hook_test_coverage.md](T76_route_handler_hook_test_coverage.md)                               |
| T77 | 판매자 대시보드 매출 통계 구현 (S-DASH-02)                   | P3       | 진행 전 | 확인 필요    | T58                               | [T77_seller_dashboard_sales_stats.md](T77_seller_dashboard_sales_stats.md)                                       |
| T78 | 공지사항 도메인/API 구현                                     | P3       | 진행 전 | 확인 필요    | T58                               | [T78_notice_domain_api.md](T78_notice_domain_api.md)                                                             |

## 추천 진행 흐름

완료 task는 제외하고, `진행 중`과 `진행 전` task만 기준으로 정렬한다.

1. P2 진행 중: T26
2. P2 UI/UX 개선 묶음: T46, T47, T49
   - T48: T26 완료 후 착수
3. P3 Backend/보안: T72, T73, T76
4. P3 기능 확장: T59, T69, T77, T78, T23, T30
5. P3 확장/운영 고도화: T32, T33, T34, T36, T37, T70, T71
6. P3 별도 일정: T66(모바일 앱 래핑), T67(i18n)
7. P4 기술 부채: T35, T74, T75
