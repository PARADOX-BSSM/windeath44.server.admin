# Technical PRD - Windeath44 Admin Portal User Management System

## 개요
Windeath44 Admin Portal의 사용자 관리 시스템을 구현하기 위한 기술적 요구사항과 구현 방식을 정의합니다.

## 기술 스택

### Frontend
- **Next.js 15.1.0** (App Router)
- **React 18.3.1** (Client Components)
- **TypeScript 5.5.4** (완전한 타입 안전성)
- **Tailwind CSS 3.4.10** (유틸리티 우선 스타일링)
- **PostCSS + Autoprefixer** (CSS 후처리)

### Backend API Integration
- **RESTful API** (OpenAPI 3.0.1 스펙 준수)
- **JWT 인증** (RS256 + JWKS 검증)
- **Fetch API** (네이티브 HTTP 클라이언트)
- **Next.js API Routes** (프록시 및 미들웨어)

### Development & Build
- **ESLint 8.57.0** (코드 품질)
- **Vitest 2.0.5** (테스팅 프레임워크)
- **Node.js 22.18.0** (런타임 환경)

## 아키텍처 설계

### 파일 구조
```
app/
├── api/
│   └── users/
│       ├── route.ts                    # GET /users, DELETE /users
│       ├── register/
│       │   ├── route.ts               # POST /users/register
│       │   └── admin/route.ts         # POST /users/register/admin
│       ├── profile/route.ts           # GET /users/profile
│       ├── change/
│       │   ├── profile/route.ts       # PATCH /users/change/profile
│       │   └── name/route.ts          # PATCH /users/change/name
│       └── retrieve/
│           ├── password/route.ts      # PATCH /users/retrieve/password
│           └── userId/route.ts        # POST /users/retrieve/userId
├── admin/
│   ├── dashboard/
│   │   ├── page.tsx                   # 메인 대시보드
│   │   └── auth/login/page.tsx        # 로그인 페이지
│   └── users/
│       ├── page.tsx                   # 사용자 목록
│       └── create/page.tsx            # 관리자 계정 생성
├── components/
│   ├── dashboard/
│   │   └── AdminOverview.tsx          # 대시보드 메인 컴포넌트
│   └── ui/
│       ├── Header.tsx                 # 공통 헤더
│       └── Sidebar.tsx                # 네비게이션 사이드바
├── types/
│   └── user.ts                        # 사용자 관련 TypeScript 인터페이스
└── config/
    └── observability.ts               # 외부 도구 설정
```

### API 통합 계층

#### 1. 프록시 API Routes (`/api/users/*`)
- 외부 API (`https://prod.windeath44.wiki/api`) 프록시 역할
- 요청/응답 변환 및 에러 핸들링
- 헤더 관리 및 인증 토큰 처리

#### 2. 데이터 타입 정의
```typescript
interface User {
  userId: string;
  email: string;
  name: string;
  remainToken: number;
  profile: string;
  role: 'ADMIN' | 'CHIEF' | 'USER' | 'TESTER' | 'ANONYMOUS';
  createdAt: string;
}

interface UserListResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalUserCount: number;
}
```

### UI/UX 구현

#### 1. 반응형 디자인 원칙
- **Mobile First** 접근 방식
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Grid System**: CSS Grid + Flexbox 하이브리드

#### 2. 컴포넌트 설계 패턴
- **Compound Components**: Header + Sidebar + Main 구조
- **Hook-based State**: useState, useEffect, useRouter 활용
- **Event-driven**: 사용자 인터랙션 기반 상태 관리

#### 3. 스타일링 전략
```css
/* Tailwind 유틸리티 클래스 우선 사용 */
.btn-primary: @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700;
.card: @apply bg-white border border-gray-200 rounded-2xl p-6 shadow-lg;
.input-field: @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500;
```

## 기능 모듈 상세

### 1. 사용자 목록 관리 (`/admin/users`)

#### 기능 요구사항
- **페이지네이션**: 20개 단위 페이징, 무한 스크롤 지원
- **고급 필터링**: 역할별, 등록일별, 키워드 검색
- **정렬**: 이름, 등록일, 마지막 활동 기준
- **벌크 작업**: 다중 선택 삭제, 역할 변경

#### 구현 상세
```typescript
// 상태 관리
const [users, setUsers] = useState<User[]>([]);
const [filters, setFilters] = useState({
  keyword: '',
  role: '',
  dateFrom: '',
  dateTo: '',
  sort: 'createdAt,desc'
});
const [pagination, setPagination] = useState({
  page: 0,
  size: 20,
  totalPages: 0
});

// API 호출
const fetchUsers = async () => {
  const params = new URLSearchParams({
    ...filters,
    page: pagination.page.toString(),
    size: pagination.size.toString()
  });
  
  const response = await fetch(`/api/users?${params}`);
  const data = await response.json();
  
  setUsers(data.data.content);
  setPagination(prev => ({
    ...prev,
    totalPages: data.data.totalPages
  }));
};
```

### 2. 관리자 계정 생성 (`/admin/users/create`)

#### 워크플로우
1. **이메일 인증**: `/api/auth/email` 통한 인증 코드 발송
2. **코드 확인**: `/api/auth/email/valid` 통한 검증
3. **계정 생성**: `/api/users/register/admin` 통한 최종 생성

#### 폼 검증 로직
```typescript
const validateForm = (): FormErrors => {
  const errors: FormErrors = {};
  
  // 사용자 ID: 6-16자, 영숫자만
  if (!/^[a-zA-Z0-9]{6,16}$/.test(formData.userId)) {
    errors.userId = 'User ID must be 6-16 alphanumeric characters';
  }
  
  // 이메일: RFC 5322 준수
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // 비밀번호: 8-20자, 특수문자 포함
  if (!/^(?=.*[!@#$%^&*])(.{8,20})$/.test(formData.password)) {
    errors.password = 'Password must be 8-20 chars with special character';
  }
  
  return errors;
};
```

### 3. 대시보드 통합 (`/admin/dashboard`)

#### 메트릭 표시
- **사용자 통계**: 전체/활성/신규 사용자 수
- **역할별 분포**: ADMIN/CHIEF/USER 비율
- **활동 지표**: 토큰 사용량, 로그인 빈도

#### 실시간 업데이트
```typescript
// 5분마다 통계 갱신
useEffect(() => {
  const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

## 보안 및 성능

### 1. 보안 요구사항
- **입력 검증**: XSS, SQL 인젝션 방지
- **CSRF 보호**: SameSite 쿠키 설정
- **권한 검증**: 역할 기반 접근 제어 (RBAC)
- **토큰 관리**: JWT 자동 갱신 및 만료 처리

### 2. 성능 최적화
- **코드 분할**: 페이지별 번들 분리
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **캐싱 전략**: SWR 패턴 적용
- **번들 크기**: Lighthouse 기준 90점 이상

### 3. 접근성 (A11y)
- **WCAG 2.1 AA 준수**: 색상 대비, 키보드 네비게이션
- **스크린 리더 지원**: ARIA 레이블, 시맨틱 HTML
- **Focus 관리**: 탭 순서, 포커스 트랩

## 테스트 전략

### 1. 단위 테스트 (Vitest)
```typescript
// 컴포넌트 테스트
describe('UserList Component', () => {
  test('renders user list with pagination', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });
});

// API 함수 테스트
describe('User API Functions', () => {
  test('fetchUsers returns paginated user list', async () => {
    const users = await fetchUsers({ page: 0, size: 20 });
    expect(users.content).toHaveLength(20);
    expect(users.totalPages).toBeGreaterThan(0);
  });
});
```

### 2. 통합 테스트
- **API 엔드포인트**: 전체 CRUD 작업 검증
- **인증 플로우**: 로그인부터 대시보드까지
- **에러 처리**: 네트워크 실패, 인증 오류 시나리오

## 배포 및 운영

### 1. 빌드 설정
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: {
    domains: ['localhost', 'img.freepik.com'],
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  }
};
```

### 2. 환경 변수 관리
```env
# 필수 환경 변수
MEMORIAL_API_URL=https://prod.windeath44.wiki/api
JWT_ISSUER=windeath44.wiki
NODE_ENV=production

# 선택적 환경 변수
NEXT_PUBLIC_APP_NAME=windeath44-admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. 모니터링
- **에러 추적**: 클라이언트 사이드 에러 로깅
- **성능 메트릭**: Core Web Vitals 모니터링
- **사용자 분석**: 페이지 뷰, 사용 패턴 분석

## 마이그레이션 계획

### Phase 1: 기본 사용자 관리 (완료)
- ✅ 사용자 목록 조회 및 필터링
- ✅ 관리자 계정 생성
- ✅ 기본 대시보드 통합

### Phase 2: 고급 기능 (예정)
- 🔄 벌크 사용자 관리
- 🔄 역할 기반 권한 세밀화
- 🔄 활동 로그 및 감사

### Phase 3: 확장 기능 (예정)
- 📋 사용자 분석 대시보드
- 📋 자동화된 사용자 온보딩
- 📋 고급 보안 정책

## 품질 기준

### 1. 코드 품질
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: strict mode, 100% 타입 커버리지
- **테스트 커버리지**: 80% 이상

### 2. 성능 기준
- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1

### 3. 브라우저 지원
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

---

**작성일**: 2024-11-22  
**버전**: 1.0  
**상태**: 구현 완료 (Phase 1)