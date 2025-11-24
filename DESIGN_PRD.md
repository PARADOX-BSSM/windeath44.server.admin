# Design & Branding PRD - Windeath44 Admin Portal

## 1. 디자인 철학 (Design Philosophy)
**"Premium, Immersive, Dynamic"**

Windeath44 Admin Portal은 단순한 관리 도구를 넘어, 사용자에게 시각적 즐거움과 몰입감을 제공하는 프리미엄 대시보드를 지향합니다.

- **Premium**: 고해상도 배경, 정교한 블러(Blur) 효과, 세련된 타이포그래피를 통해 고급스러운 느낌을 전달합니다.
- **Immersive**: 도시(City) 테마를 기반으로 한 배경과 일관된 컬러 팔레트로 사용자가 해당 공간에 있는 듯한 몰입감을 줍니다.
- **Dynamic**: 부드러운 트랜지션, 호버 효과, 미세한 애니메이션(Micro-interactions)을 통해 살아있는 인터페이스를 구현합니다.

## 2. 비주얼 아이덴티티 (Visual Identity)

### 2.1 타이포그래피 (Typography)
- **Primary Font**: `IBM Plex Sans`
  - 기계적이고 현대적인 느낌을 주며, 가독성이 뛰어나 데이터 중심의 대시보드에 적합합니다.
  - Weights: 300(Light), 400(Regular), 500(Medium), 600(SemiBold), 700(Bold)
- **Secondary Font**: `Inter`
  - 시스템 UI 및 본문 텍스트의 가독성을 보장하기 위한 보조 폰트입니다.

### 2.2 컬러 팔레트 (Color Palette)
시스템은 테마에 따라 동적으로 변화하는 CSS 변수 기반의 컬러 시스템을 사용합니다.

#### 공통 (Common)
- **Background**: `#050505` (Dark), `rgba(255, 255, 255, 0.6)` (Light)
- **Foreground**: `#ffffff` (Dark), `#000000` (Light)
- **Border**: `rgba(255, 255, 255, 0.03)` (Dark), `rgba(0, 0, 0, 0.1)` (Light)

#### 테마별 포인트 컬러 (Accent Colors)
| 테마 (Theme) | Accent Color | Hex Code | 의미 |
|---|---|---|---|
| **New York (Default)** | Blue | `#3b82f6` | 신뢰, 기술, 도시의 차가움 |
| **San Francisco** | Orange | `#f97316` | 골든 게이트 브리지, 따뜻함, 활력 |
| **Windeath44** | Pink | `#ec4899` | 브랜드 시그니처, 개성, 팝(Pop) |
| **Light Mode** | Black | `#000000` | 미니멀리즘, 깔끔함, 가독성 |

## 3. 테마 시스템 (Theming System)
사용자의 기분이나 환경에 맞춰 전환할 수 있는 4가지 핵심 테마를 제공합니다.

### 3.1 New York (Default)
- **컨셉**: 잠들지 않는 도시의 밤.
- **배경**: 뉴욕의 야경, 마천루, 비 오는 거리.
- **분위기**: 차분하면서도 웅장함.
- **주요 요소**: Glassmorphism 패널이 어두운 배경 위에서 빛을 발함.

### 3.2 San Francisco
- **컨셉**: 안개 낀 금문교와 샌프란시스코의 거리.
- **배경**: 골든 게이트 브리지, 케이블카, 베이 브리지.
- **분위기**: 몽환적이고 따뜻한 톤.
- **주요 요소**: 오렌지색 포인트가 안개 낀 배경과 대비됨.

### 3.3 Windeath44 (Signature)
- **컨셉**: 브랜드 아이덴티티를 강조한 전용 테마.
- **배경**: 커스텀 브랜드 아트워크 (`windeath44.png`).
- **분위기**: 유니크하고 강렬함.
- **주요 요소**: 핑크색 글로우(Glow) 효과로 브랜드 존재감 부각.

### 3.4 Light Mode
- **컨셉**: 밝고 깨끗한 업무 환경.
- **배경**: 밝은 톤의 이미지 또는 단색 배경.
- **분위기**: 전문적이고 명료함.
- **주요 요소**: 높은 가독성, 그림자(Shadow)를 활용한 깊이감 표현 (Glassmorphism 대신).

## 4. UI/UX 패턴 (UI/UX Patterns)

### 4.1 Glassmorphism (유리 질감)
- **적용 대상**: 사이드바, 헤더, 대시보드 카드.
- **구현**: `backdrop-filter: blur(12px)`, 반투명 배경색, 미세한 테두리(`border-white/10`).
- **목적**: 배경 이미지를 은은하게 비추어 공간감을 형성하고 콘텐츠에 집중하게 함.

### 4.2 Text Glow (텍스트 발광)
- **적용 대상**: 주요 헤드라인, 활성화된 메뉴, 강조 데이터.
- **구현**: `text-shadow: 0 0 20px rgba(255, 255, 255, 0.1)`.
- **목적**: 사이버펑크/미래지향적인 느낌을 더하고 중요 정보를 강조.

### 4.3 Interactive Elements
- **Hover Effects**:
  - 카드: 살짝 떠오르는 효과 (`transform: translateY(-2px)`), 테두리 밝기 증가.
  - 버튼: 배경색 불투명도 증가, 글로우 효과 강화.
- **Transitions**: 모든 테마 변경 및 호버 효과는 `duration-300` 이상의 부드러운 트랜지션을 가짐.

## 5. 컴포넌트 가이드 (Component Guidelines)

### 5.1 Layout
- **Sidebar**: 좌측 고정, 아이콘 위주의 네비게이션. 유리 질감 적용.
- **Header**: 상단 고정, 페이지 타이틀 및 유틸리티 버튼(테마 변경 등). 유리 질감 적용.
- **Content Area**: 중앙 그리드 레이아웃. 반응형으로 카드 배치 조정.

### 5.2 Cards (Widgets)
- **구조**: 타이틀, 메인 콘텐츠(데이터/차트), 푸터(액션/상태).
- **스타일**: `glass-card` 유틸리티 클래스 사용.
- **인터랙션**: 클릭 가능한 카드는 커서 변경 및 호버 효과 적용.

### 5.3 Buttons
- **Primary**: Accent Color 배경, 흰색 텍스트, 약간의 글로우.
- **Secondary**: 투명 배경, Accent Color 테두리/텍스트.
- **Ghost**: 투명 배경, 호버 시 배경색 나타남.

## 6. 향후 디자인 과제 (Future Design Tasks)
- **모바일 최적화**: 작은 화면에서도 배경과 Glassmorphism이 조화롭게 보이도록 조정.
- **데이터 시각화**: 차트 라이브러리(Recharts 등) 도입 시 테마 컬러와 연동.
- **애니메이션 강화**: 페이지 전환 시 페이드/슬라이드 효과 추가.
