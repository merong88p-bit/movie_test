# 영화 예매 서비스 MVP 기획 및 스펙 정의서

본 문서는 **Next.js, TypeScript, Tailwind CSS v4** 스택을 활용하여 구축할 **반응형 영화 예매 서비스**의 1차 구현(MVP) 범위와 사양을 정의합니다.

---

## 1. 프로젝트 개요
* **프로젝트명**: MovieVerse (가칭) - 반응형 영화 예매 서비스
* **목표**: 사용자에게 직관적이고 끊김 없는 영화 탐색 및 예매 경험을 제공하는 웹 애플리케이션 구축
* **개발 범위**: 1차 MVP (Minimum Viable Product) 핵심 기능 중심 구현

---

## 2. 기술 스택
* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4.0 (최신 빌드 도구 및 향상된 테마 설정 활용)
* **State Management**: React Context API 또는 Zustand (가볍고 직관적인 상태 관리)
* **Icons**: Lucide React
* **API Integration**: TMDB (The Movie Database) API (최신 영화 정보 실시간 연동)

---

## 3. 핵심 기능 정의 (MVP 범위)

### 3.1. 사용자 인증 (Authentication)
* **방식**: 로컬 스토리지(LocalStorage) 기반 간편 인증
* **주요 기능**:
  * **회원가입**: 이메일, 비밀번호, 닉네임 입력 후 로컬 스토리지에 사용자 정보 저장
  * **로그인**: 가입된 계정 정보 검증 및 세션 유지 (로컬 스토리지 토큰 시뮬레이션)
  * **가상 계정 로그인**: 회원가입 절차 없이 즉시 테스트할 수 있는 데모 계정 제공
  * **로그아웃**: 세션 클리어 및 메인 페이지 리다이렉트

### 3.2. 영화 탐색 및 정보 (Movie Discovery)
* **TMDB API 연동**:
  * 현재 상영작(Now Playing), 인기작(Popular), 상영 예정작(Upcoming) 카테고리 구성
  * 검색창을 통한 영화 제목 검색 기능
* **영화 상세 페이지**:
  * 영화 포스터, 배경 이미지, 평점, 개봉일, 런타임, 장르 표시
  * 주요 출연진(Cast) 및 감독 정보
  * 줄거리(Synopsis) 및 가상 한줄평 요약

### 3.3. 예매 시스템 (Booking Flow)
* **단계별 예매 엔진**:
  1. **영화/극장/날짜/시간 선택**:
     * 영화 목록에서 선택 또는 예매 전용 페이지에서 드롭다운/버튼으로 선택
     * 서울/경기 등 지역별 가상 극장 목록 제공
     * 오늘을 기준으로 7일간의 날짜 선택 휠/바
     * 오전/오후 시간대별 상영 시간 세션 선택
  2. **인원 및 좌석 선택**:
     * 일반/청소년 인원 수 설정 (최대 4인)
     * 시각적인 극장 좌석 배치도 (Screen 영역 표시, 열/번호 조합의 좌석 레이아웃)
     * 이미 예매된 좌석(가상 데이터) 표시 및 선택 방지
     * 실시간으로 선택한 좌석 번호 및 결제 금액 계산 표시
  3. **가상 결제 (Payment Mock)**:
     * 결제 수단 선택 (신용카드, 카카오페이, 간편결제 등 - 가상 연동)
     * 포인트 충전 및 사용 시뮬레이션
     * '결제하기' 버튼 클릭 시 1~2초간 결제 진행 스피너 노출 후 성공 처리
  4. **예매 완료**:
     * 예매 번호(가상 생성), 영화 정보, 상영 시간, 상영관, 선택 좌석, 결제 금액 표시

### 3.4. 마이페이지 (My Page)
* **예매 내역 조회**:
  * 현재 예매 완료된 티켓 목록 표시
  * 과거 관람 완료된 내역 분리 표시 (선택 사항)
* **가상 모바일 티켓**:
  * 예매 상세 확인 시 모바일 입장용 가상 QR 코드 표시
* **예매 취소**:
  * 상영 시간 시작 전 취소 가능 처리 (로컬 스토리지 데이터 업데이트)
  * 취소 시 좌석 반납 및 포인트 복원 시뮬레이션

---

## 4. UI/UX 디자인 컨셉 및 반응형 레이아웃

### 4.1. 비주얼 컨셉
* **테마**: 프리미엄 다크 테마 (Cinema & Theater Mood)
* **색상 팔레트**:
  * **Background**: Rich Slate Blue & Charcoal Black (`#0B0F19`, `#121829`)
  * **Primary (Accent)**: Vibrant Coral/Red (`#F43F5E` - Rose 500) 또는 Neon Amber (`#F59E0B` - Amber 500)
  * **Text**: Pure White (`#FFFFFF`) 및 Slate Light Gray (`#94A3B8`)
* **스타일 요소**: Glassmorphism 효과, 부드러운 카드 호버 스케일 업 애니메이션, 로딩 스켈레톤 UI 적용

### 4.2. 반응형 레이아웃 설계 (Breakpoint Guide)
* **Mobile (under 768px)**:
  * 모바일 친화적인 Bottom Navigation Bar 제공 (홈, 예매, 마이페이지, 프로필)
  * 세로 스크롤 중심의 영화 카드 목록, 터치에 최적화된 좌석 선택 레이아웃
* **Desktop (768px ~ 1280px+)**:
  * 상단 네비게이션 헤더 (Logo, 메뉴, 프로필 상태)
  * 영화 상세 화면 및 예매 플로우에 2컬럼 레이아웃 활용 (좌측: 정보/스크린 배치, 우측: 요약/결제 패널)

---

## 5. 데이터 구조 설계 (로컬 스토리지용 Schema)

```typescript
// 유저 정보
interface User {
  id: string;
  email: string;
  nickname: string;
  points: number; // 가상 결제용 포인트
}

// 예매 내역
interface Booking {
  id: string; // 예매번호 (예: MV-20260714-XXXX)
  userId: string;
  movieId: number; // TMDB Movie ID
  movieTitle: string;
  moviePoster: string;
  theater: string; // 예: 강남 CGV
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  seats: string[]; // ['H12', 'H13']
  totalPrice: number;
  status: 'reserved' | 'cancelled';
  createdAt: string;
}
```

---

## 6. 개발 로드맵 (Milestone)
1. **[Phase 1] 환경 설정 및 공통 UI**: Next.js 프로젝트 생성, Tailwind v4 설정, 기본 레이아웃(헤더/푸터/바텀 네비게이션) 구축
2. **[Phase 2] TMDB API 연동 및 영화 목록/상세**: 홈 화면 구성, 상세 모달/페이지 개발, 스켈레톤 로딩 구현
3. **[Phase 3] 회원가입/로그인 & 마이페이지**: 로컬 스토리지 기반 인증 컨텍스트 구현, 마이페이지 티켓 목록 및 취소 기능
4. **[Phase 4] 예매 흐름 구현**: 날짜/시간 선택기, 극장 배치도 좌석 선택 인터페이스 개발
5. **[Phase 5] 가상 결제 & 예매 완료**: 결제 완료 화면, QR 코드 연동, 전체 사용자 플로우 검증 및 예외 처리
