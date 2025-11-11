# Product Requirements Document

## 제품 개요
- **목표**: `windeath44.server.admin`은 Windeath 운영/커뮤니티 팀이 Memorial 신청과 회원 관리를 수행하는 Next.js 15 기반 전용 관리자 포털입니다.
- **핵심 가치**: 검증된 JWT 토큰을 가진 운영자가 대시보드에서 즉시 작업 현황을 보고, 신청서를 처리하고, 외부 Grafana·Kiali·Prometheus·Kafka UI로 빠르게 이동할 수 있습니다.
- **범위**: App Router 기반 SPA + 서버 라우트(`app/api/applications/*`, `app/api/auth/*`, `app/api/health`)와 Zustand `memorialStore`. 클러스터 메트릭/프록시 기능은 제외되며, 관측은 외부 툴 링크로 대체합니다.

## 주요 사용자 & 시나리오
- **커뮤니티 운영자**: `/admin/applications`에서 신청을 필터링·검색·무한 스크롤하고 단건 또는 Bulk 승인/거절/삭제, 상세 확인 및 Activity 피드 모니터링.
- **플랫폼 관리자**: `AdminOverview`에서 대기 중인 업무, 최근 활동, 모더레이터 상태를 확인하고 계정 접근을 감사. 필요 시 외부 관측 툴(Grafana/Kiali/Prometheus/Kafka UI)로 이동.
- **보안 담당자**: `/api/auth/verify`와 `middleware.ts`를 통해 JWT 흐름을 유지하고 `/api/health`로 서비스 상태를 확인.

## 시스템 구성
- **프런트**: React 19 + Tailwind v4. `app/components/dashboard/AdminOverview.tsx`가 홈/대시보드 UI를 담당하며, `app/admin/applications` 아래로 Memorial 전처리 UI가 집중됩니다.
- **상태 관리**: `useMemorialStore`(Zustand + persist/devtools)가 신청 목록, 상세, Bulk 액션을 담당. 대시보드 카드/활동은 정적 JSON 혹은 차후 관리자 API로 전환 예정.
- **백엔드 연동**: `app/lib/memorial-api.ts`가 `MEMORIAL_API_URL`로 REST 호출을 프록시. `app/api/applications/**/*` 라우트는 Next.js 서버에서 인증 헤더를 정리한 뒤 외부 API로 전달.
- **보안 계층**: `middleware.ts`가 `/admin/**` 접근 시 `auth_token` 존재를 검사하고 `/admin/dashboard/auth/login`으로 리디렉션. `/api/auth/verify`는 JWKS 기반 RS256으로 토큰을 검증합니다.
- **관측 툴 연동**: Sidebar/Observability shortcuts가 Grafana/Kiali/Prometheus/Kafka UI 외부 URL을 새 창으로 열어 준다. 더 이상 내부 proxy/health-check 라우트는 사용하지 않습니다.

## 기능 요구사항
1. **인증 & 접근 제어**
   - 클라이언트는 `localStorage`/쿠키의 `auth_token`을 확인하고 `/api/auth/verify`로 RS256 검증. 실패 시 토큰 제거 후 `/admin/dashboard/auth/login`으로 이동.
2. **관리자 대시보드 (`/` & `/dashboard`)**
   - `AdminOverview`가 하이라이트 카드, Quick Actions, Recent Activity, Observability Shortcuts를 표시.
   - 카드 데이터는 운영 요구에 맞춰 JSON/REST로 확장 가능해야 하며, CTA는 `/admin/applications` 또는 외부 링크로 이동.
3. **Memorial 신청 관리 (`/admin/applications`)**
   - `useMemorialStore`가 페이지네이션, 캐릭터 검색, 사용자별 조회, Bulk 승인/거절/삭제 호출(`/api/applications/*`)을 담당.
   - `ApplicationList` + `ApplicationDetail` 조합으로 상태 통계, 검색/필터, 체크박스 선택, 모달 상세를 제공.
4. **Observability Shortcuts**
   - Sidebar 및 Overview 섹션에서 Grafana/Kiali/Prometheus/Kafka UI 외부 URL을 새 창으로 열어 준다.
   - URL은 환경 변수/상수로 관리 가능하며, 링크 실패 시 사용자에게 안내 메시지를 보여야 함.
5. **API & 지원 유틸**
   - `/api/health`는 런타임/버전/메모리와 주요 외부 엔드포인트(Memorial API, JWT Issuer)를 보고.
   - `app/lib/logger.ts`는 민감 데이터 마스킹, `app/lib/rate-limiter.ts`는 향후 인증 시도 제한에 활용.

## 데이터 모델 & 외부 연동
- **MemorialApplication**: `memorialApplicationId`, `userId`, `characterId`, `content`, `state`, `likes` 등.
- **Dashboard Highlights**: JSON 객체 `{ label, value, helper }` 리스트, 향후 API 응답으로 대체 가능.
- **ObservabilityLink**: `{ title, description, href }` 형태로 Sidebar/Overview에서 재사용.
- **환경 변수**: `MEMORIAL_API_URL`, `JWT_ISSUER`, `NEXT_PUBLIC_GRAFANA_URL` 등 외부 툴 URL(추가 예정), `RATE_LIMIT_*`.

## 비기능 요구사항
- **성능**: 대시보드 초기 로딩 ≤3s, `/admin/applications` 무한 스크롤은 요청당 20건 기준 500ms 이내.
- **가용성**: Memorial API 실패 시 사용자에게 오류/재시도 UI 노출 및 로거에 기록.
- **보안**: JWT 만료 처리, secrets는 환경변수, Sidebar 외부 링크는 `noopener noreferrer`로 열기.
- **관측성**: 현재 로그 기반 추적만 제공; 추후 신청 상태 변경 이벤트를 중앙 로깅으로 전송 계획.
- **테스트**: `npm run test` 도입 필요. 우선 `useMemorialStore` 단위 테스트와 `/admin/applications` 렌더링 테스트부터 작성.

## 리스크 & 향후 과제
- AdminOverview 카드 데이터가 하드코딩 상태이므로 운영/API 기반으로 치환하는 백로그 필요.
- `useMemorialStore`는 승인/거절/삭제 시 형태만 정의되어 있어 API 에러 처리/낙관적 업데이트 개선 필요.
- 테스트/CI 미구현.
- Sidebar 외부 URL이 환경별로 상이할 경우 `.env`로 분리하고 타입 보강 필요.
