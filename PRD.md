# Product Requirements Document

## 제품 개요
- **목표**: `windeath44.server.admin`은 운영/보안 담당자가 서버와 커뮤니티 상태를 요약해 보고 외부 관측 도구로 이동할 수 있는 Next.js 15 기반 관리자 포털입니다.
- **핵심 가치**: 인증된 사용자가 한 번의 로그인으로 상태 카드, 최근 활동, 관측 링크를 확인하고 즉시 후속 조치를 취할 수 있도록 합니다.
- **범위**: App Router 기반 SPA(`app/components/dashboard/AdminOverview.tsx`, `/admin/dashboard`, `/admin/dashboard/auth/login`)와 서버 라우트(`/api/auth/*`, `/api/health`), `middleware.ts`로 구성됩니다.

## 주요 사용자 & 시나리오
- **운영 담당자**: 홈/대시보드에서 위험 신호, 활동 피드, 빠른 작업 CTA를 확인하고 외부 Grafana/Kiali/Prometheus/Kafka UI로 진입합니다.
- **사용자 관리자**: 사용자 목록 조회, 프로필 변경 승인, 계정 복구 지원, 역할 기반 권한 관리를 통해 플랫폼 사용자를 효율적으로 관리합니다.
- **보안 담당자**: 로그인 흐름과 `/api/auth/verify`를 사용해 JWT를 검증하고 `/api/health`로 런타임 상태를 확인하며, 사용자 토큰 상태를 모니터링합니다.
- **경영진/리더십**: 단일 진입점에서 시스템 전반의 맥락(활성 모더레이터 수, 플래그 현황, 사용자 통계 등)을 공유받습니다.

## 시스템 구성
- **프런트엔드**: React 19 + Tailwind v4. `AdminOverview`가 Header/Sidebar/카드를 포함한 UI를 단일 소스로 제공합니다.
- **인증 레이어**: `/admin/dashboard/auth/login`이 upstream 인증 API에 로그인 요청을 보내고 토큰을 쿠키/로컬스토리지에 저장합니다. `middleware.ts`가 `/admin/**` 접근 시 `auth_token` 존재를 검사합니다.
- **서버 라우트**: `/api/auth/verify`가 RS256(JWKS) 기반 JWT 검증을 처리하고 `/api/health`가 버전·메모리·환경 값을 노출합니다.
- **외부 툴 연동**: Sidebar/Observability Shortcut 카드가 Grafana/Argo CD/Kiali/Prometheus/Kafka UI 링크를 새 창으로 띄우며 URL은 환경 변수나 상수로 관리합니다.

## 라우팅 & Base Path 설정 (Routing & Base Path Configuration)
- **Base Path**: `/admin/dashboard`
  - 모든 내부 라우트와 에셋 경로는 이 Base Path를 기준으로 동작해야 합니다.
  - `next.config.ts`에 `basePath: '/admin/dashboard'`가 설정되어 있습니다.
- **링크 처리**:
  - `next/link` 컴포넌트 사용 시 Next.js가 자동으로 Base Path를 처리하므로 `/users`와 같이 작성하면 실제로는 `/admin/dashboard/users`로 렌더링됩니다.
  - `window.location`이나 일반 `<a>` 태그를 사용할 경우 반드시 Base Path를 포함해야 합니다.
  - `useRouter().push()` 사용 시에도 자동으로 Base Path가 적용됩니다.
- **에셋 처리**:
  - `public` 폴더의 이미지를 참조할 때는 `/admin/dashboard/images/...`와 같이 Base Path를 포함한 절대 경로를 사용해야 합니다.
  - CSS `url()` 사용 시에도 Base Path를 고려해야 합니다.

## 기능 요구사항
1. **사용자 관리 (User Management)**
   - **어드민 계정 생성**: 새로운 관리자 계정 생성을 위한 완전한 워크플로우를 제공해야 합니다:
     - 이메일 인증: `/api/auth/email` API로 이메일 주소 검증 요청을 보내고, `/api/auth/email/valid` API로 인증 코드 확인
     - 회원가입: `/api/users/register` API를 통해 userId, email, name, password를 입력받아 계정 생성
     - 비밀번호는 8~20자 사이여야 하며, 이메일 인증을 먼저 완료해야 함
   - **사용자 조회**: `/api/users/profile` API를 통해 개별 사용자 정보(userId, name, remainToken, profile, role)를 조회하고 관리자 대시보드에서 확인할 수 있어야 합니다.
   - **사용자 목록 조회**: `/api/users` API를 사용해 여러 사용자를 한 번에 조회하고 페이지네이션 및 필터링 기능을 제공해야 합니다.
   - **프로필 관리**: 관리자가 사용자의 프로필 사진(`/api/users/change/profile`)과 이름(`/api/users/name`) 변경을 승인하거나 관리할 수 있어야 합니다.
   - **계정 복구 지원**: 사용자 ID 찾기(`/api/users/retrieve/userId`)와 비밀번호 재설정(`/api/users/retrieve/password`) 요청을 관리자가 모니터링하고 지원할 수 있어야 합니다.
   - **역할 기반 접근 제어**: 사용자의 role 정보를 기반으로 관리 권한을 차등 적용하고, ADMIN 역할 사용자에 대한 특별 관리 기능을 제공해야 합니다.
   - **토큰 관리**: 사용자별 remainToken 상태를 모니터링하고 필요시 토큰 재발급이나 제한을 관리할 수 있어야 합니다.
2. **인증 & 접근 제어 (서버 사이드 보안)**
   - 로그인 페이지는 upstream `https://prod.windeath44.wiki/api/auth/login`에 POST하고 응답 토큰을 쿠키(`auth_token`)와 `localStorage`에 보관합니다.
   - **서버 사이드 검증**: `middleware.ts`는 모든 `/admin/dashboard/**` 요청에 대해 서버에서 토큰을 검증합니다:
     1. 토큰 존재 여부 확인
     2. `https://prod.windeath44.wiki/api/users/profile` API 호출로 토큰 유효성 검증
     3. `role === 'ADMIN'` 확인
     4. 검증 실패 시 토큰 삭제 후 로그인 페이지로 강제 리다이렉트
   - **클라이언트 사이드 우회 방지**: 모든 인증 로직이 서버 사이드에서 처리되어 브라우저 개발자 도구나 JavaScript 조작으로 우회 불가능합니다.
   - **자동 토큰 정리**: 유효하지 않은 토큰이나 ADMIN 권한이 없는 경우 자동으로 쿠키에서 토큰이 삭제됩니다.
2. **관리자 대시보드 (`/` & `/admin/dashboard`)**
   - `AdminOverview`는 Highlight Stats, Quick Actions, Recent Activity, Observability Shortcuts, User Management 섹션을 렌더링합니다.
   - User Management 섹션은 전체 사용자 수, 활성 사용자 수, ADMIN 역할 사용자 수, 최근 가입자 등의 통계를 표시하며, 어드민 계정 생성 버튼을 제공합니다.
   - CTA는 `/admin/dashboard/auth/login`, `/admin/users`, `/admin/users/create` 같은 내부 경로 또는 외부 관측 링크를 가리킬 수 있어야 합니다.
3. **Sidebar & Navigation**
   - `app/components/ui/Sidebar.tsx`는 클라이언트 컴포넌트로 훅/라우터를 사용해 내부 페이지 이동 및 외부 링크 오픈을 담당하며, Grafana/Argo CD/Kafka UI 등을 새 탭으로 리디렉션할 수 있어야 합니다.
   - 사용자 관리 메뉴(`/admin/users`, `/admin/users/create`, `/admin/users/roles`, `/admin/users/tokens`)를 포함하여 권한 기반 네비게이션을 제공합니다.
4. **관측·배포 툴 접근**
   - Observability Shortcuts와 Sidebar는 Grafana(메트릭), Argo CD(CD 파이프라인), Kafka UI(이벤트 스트림), Kiali/Prometheus 등의 URL을 제공하고 `window.open` + `rel="noopener noreferrer"`로 새 창을 띄웁니다.
5. **사용자 관리 API 연동**
   - `/api/users/register`를 통한 새로운 어드민 계정 생성 폼과 이메일 인증 워크플로우를 구현합니다.
   - `/api/users/profile`를 통한 개별 사용자 정보 조회 및 관리 인터페이스를 제공합니다.
   - `/api/users`를 통한 사용자 목록 페이지네이션과 검색 기능을 구현합니다.
   - 사용자 프로필 변경 요청(`/api/users/change/profile`, `/api/users/name`) 승인 워크플로우를 관리합니다.
   - 계정 복구 요청(`/api/users/retrieve/userId`, `/api/users/retrieve/password`) 모니터링 대시보드를 제공합니다.
6. **Health 모니터링**
   - `/api/health`는 버전, NODE_ENV, uptime, 메모리 사용량, `MEMORIAL_API_URL`/`JWT_ISSUER` 값을 노출해 지속적인 상태 검사를 지원합니다.

## 데이터 모델 & 외부 연동
- **Dashboard Highlights**: `{ label, value, helper }` 배열로 관리되며 향후 API 연동 시 동일 스키마를 유지합니다.
- **Observability Links**: `{ title, description, href }` 구조로 Sidebar와 Overview에서 공유됩니다.
- **환경 변수**: `MEMORIAL_API_URL`(JWT 검증 및 로그인 대상), `JWT_ISSUER`, Grafana/Kiali/Prometheus/Kafka/Argo CD URL(향후 `NEXT_PUBLIC_*`로 승격 가능).
- **API 엔드포인트 설정**: 
  - 프로덕션 API 서버: `https://prod.windeath44.wiki/api/`
  - 모든 클라이언트 측 fetch 요청은 프로덕션 API 서버로 향해야 함
  - 로컬 `/api/` 라우트는 프록시 역할로만 사용하며, 실제 비즈니스 로직은 프로덕션 API에서 처리
  - **인증 관련 API**:
    - `POST https://prod.windeath44.wiki/api/auth/login`: 사용자 로그인
    - `POST https://prod.windeath44.wiki/api/auth/verify`: JWT 토큰 검증 (Authorization 헤더 필요)
    - `POST https://prod.windeath44.wiki/api/auth/email`: 이메일 인증 코드 발송 (Authorization 헤더 필요)
    - `POST https://prod.windeath44.wiki/api/auth/email/valid`: 이메일 인증 코드 확인 (Authorization 헤더 필요)
  - **사용자 관리 API**:
    - `GET https://prod.windeath44.wiki/api/users`: 사용자 목록 조회 (페이지네이션, 필터링 지원, Authorization 헤더 필요)
    - `DELETE https://prod.windeath44.wiki/api/users`: 사용자 삭제 (Authorization 헤더 필요)
    - `GET https://prod.windeath44.wiki/api/users/profile`: 개별 사용자 프로필 조회 (Authorization 헤더 필요)
    - `POST https://prod.windeath44.wiki/api/users/register`: 일반 사용자 회원가입
    - `POST https://prod.windeath44.wiki/api/users/register/admin`: 관리자 계정 생성 (Authorization 헤더 필요)
    - `PUT https://prod.windeath44.wiki/api/users/change/profile`: 사용자 프로필 사진 변경 (Authorization 헤더 필요)
    - `PUT https://prod.windeath44.wiki/api/users/change/name`: 사용자 이름 변경 (Authorization 헤더 필요)
    - `POST https://prod.windeath44.wiki/api/users/retrieve/userId`: 사용자 ID 찾기 (Authorization 헤더 필요)
    - `POST https://prod.windeath44.wiki/api/users/retrieve/password`: 비밀번호 재설정 (Authorization 헤더 필요)
  - **Authorization 헤더**: 
    - 로그인을 제외한 모든 API 요청에는 `Authorization: Bearer {token}` 헤더가 필요
    - 토큰은 쿠키(`auth_token`) 또는 localStorage에서 자동으로 가져와서 헤더에 추가
    - 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트

## 비기능 요구사항
- **성능**: AdminOverview 초기 렌더는 3초 이내, 네트워크 의존 없이 정적 데이터로 즉시 페인트 가능해야 함.
- **가용성**: `/api/auth/verify` 실패 시 클라이언트에 명확한 에러를 전달하고 재로그인을 유도합니다.
- **보안**: 토큰은 `SameSite=Lax`, HTTPS 배포 시 `Secure` 플래그를 적용하고 외부 링크는 `rel="noopener noreferrer"`를 사용합니다.
- **관측성**: `/api/health` 로그와 클라이언트 콘솔 메시지에 민감 정보가 남지 않도록 합니다.
- **테스트**: Auth/page 컴포넌트에 대한 unit/E2E 테스트를 추가할 준비가 되어 있어야 합니다.

## 개발 규칙 & 컨벤션
### **Git 커밋 컨벤션**
```
행동 :: 내용 [이슈 스크럼]
```
- **행동**: `feat`, `fix`, `chore`, `refactor`, `docs`, `test` 등
- **내용**: 변경 사항에 대한 간결한 설명
- **이슈 스크럼**: 브랜치명의 마지막 부분 (예: 브랜치가 `feat-0.1.3/sidebar/PW-389`면 `[PW-389]`)


## 리스크 & 향후 과제
- 로그인 흐름에서 JWT 검증을 임시로 건너뛴 구간이 있으므로 프로덕션 투입 전에 `/api/auth/verify` 연동을 되살리고 로깅을 정리해야 합니다.
- AdminOverview 데이터가 정적 JSON에 머물러 있어 운영 API로 대체해야 실시간성이 확보됩니다.
- 외부 관측 링크는 환경마다 달라질 수 있어 `.env` 혹은 CMS로 분리할 계획이 필요합니다.
