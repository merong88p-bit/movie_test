export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  runtime?: number;
  genres?: string[];
  director?: string;
  cast?: string[];
  booking_rate?: number; // CGV 예매율
  age_limit?: string; // 관람등급 (전체, 12, 15, 청불)
  d_day?: string; // D-Day 디스플레이
  formats?: string[]; // SCREENX, 4DX, IMAX, 2D 등
}

// CGV 레퍼런스 이미지(호프, 스파이더맨, 모아나2 등)와 완벽히 일치하는 오프라인 100% 로컬 데이터
export const MOCK_MOVIES: Movie[] = [
  {
    id: 9901,
    title: "호프",
    original_title: "HOPE",
    overview: "인류의 마지막 희망을 찾아 떠나는 나홍진 감독의 SF 대서사시. 기이한 존재들이 숲에서 발견되고 주민들은 점차 생존을 위해 대항하기 시작하는데...",
    poster_path: "/images/posters/hope.jpg", 
    backdrop_path: "/images/posters/hope.jpg",
    vote_average: 9.2,
    release_date: "2026-07-15",
    runtime: 156,
    genres: ["SF", "스릴러", "미스터리"],
    director: "나홍진",
    cast: ["황정민", "조인성", "정호연", "마이클 패스벤더"],
    booking_rate: 41.8,
    age_limit: "15",
    d_day: "D-3",
    formats: ["IMAX", "4DX", "SCREENX"]
  },
  {
    id: 9902,
    title: "스파이더맨: 비욘드 더 유니버스",
    original_title: "Spider-Man: Beyond the Spider-Verse",
    overview: "멀티버스를 넘나드는 스파이더맨 마일스 모랄레스의 마지막 여정. 모든 차원의 스파이더맨들이 얽히고설키는 사상 최대의 스펙터클이 펼쳐집니다.",
    poster_path: "/images/posters/spiderman_v2.jpg", 
    backdrop_path: "/images/posters/spiderman_v2.jpg",
    vote_average: 8.9,
    release_date: "2026-07-20",
    runtime: 140,
    genres: ["애니메이션", "액션", "모험"],
    director: "호아킴 도스 산토스",
    cast: ["샤메익 무어", "헤일리 스타인펠드", "제이크 존슨"],
    booking_rate: 28.5,
    age_limit: "12",
    d_day: "D-8",
    formats: ["4DX", "SCREENX", "2D"]
  },
  {
    id: 9903,
    title: "모아나 2",
    original_title: "Moana 2",
    overview: "바다가 부르는 새로운 모험. 선조들의 부름을 받아 마우이와 함께 길들여지지 않은 머나먼 바다로 떠나는 모아나의 푸른 여정.",
    poster_path: "/images/posters/moana.jpg", 
    backdrop_path: "/images/posters/moana.jpg",
    vote_average: 8.7,
    release_date: "2026-07-30",
    runtime: 110,
    genres: ["애니메이션", "가족", "모험", "뮤지컬"],
    director: "데이브 데릭 주니어",
    cast: ["아우이 크라발호", "드웨인 존슨"],
    booking_rate: 15.2,
    age_limit: "전체",
    d_day: "D-18",
    formats: ["2D", "IMAX"]
  },
  {
    id: 1011985,
    title: "파묘",
    original_title: "Exhuma",
    overview: "거액의 의뢰를 받은 무당 화림과 봉길은 집안의 기이한 병의 원인이 조상의 묫자리임을 알아채고 상덕, 영근과 함께 파묘를 시작하는데...",
    poster_path: "/images/posters/exhuma.jpg", 
    backdrop_path: "/images/posters/exhuma.jpg",
    vote_average: 8.2,
    release_date: "2024-02-22",
    runtime: 134,
    genres: ["미스터리", "공포", "스릴러"],
    director: "장재현",
    cast: ["최민식", "김고은", "유해진", "이도현"],
    booking_rate: 8.2,
    age_limit: "15",
    formats: ["2D"]
  },
  {
    id: 124905,
    title: "범죄도시 4",
    original_title: "The Roundup: Punishment",
    overview: "괴물형사 마석도, 필리핀에 거점을 둔 온라인 불법 도박 조직을 소탕하기 위해 특수부대 용병 출신 백창기와 IT 천재 장동철에 맞서는데...",
    poster_path: "/images/posters/roundup.jpg", 
    backdrop_path: "/images/posters/roundup.jpg",
    vote_average: 7.9,
    release_date: "2024-04-24",
    runtime: 109,
    genres: ["액션", "범죄", "스릴러"],
    director: "허명행",
    cast: ["마동석", "김무열", "박지환", "이동휘"],
    booking_rate: 5.6,
    age_limit: "15",
    formats: ["2D"]
  },
  {
    id: 157336,
    title: "인터스텔라",
    original_title: "Interstellar",
    overview: "세계 각국의 정부와 경제가 붕괴된 미래, 인류의 생존을 위해 시공간의 틈을 찾아 우주로 떠나는 탐사대의 거대한 여정.",
    poster_path: "/images/posters/interstellar.jpg", 
    backdrop_path: "/images/posters/interstellar.jpg",
    vote_average: 8.6,
    release_date: "2014-11-06",
    runtime: 169,
    genres: ["SF", "드라마", "모험"],
    director: "크리스토퍼 놀란",
    cast: ["매튜 맥커너히", "앤 해서웨이", "제시카 차스테인", "마이클 케인"],
    booking_rate: 3.1,
    age_limit: "12",
    formats: ["IMAX", "2D"]
  }
];

// 영화 포스터 URL 헬퍼
export function getMovieImageUrl(path: string | null, size?: string): string {
  if (!path) return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";
  return path;
}

// 1. 현재 상영작 가져오기 (호프, 스파이더맨, 파묘)
export async function getNowPlayingMovies(): Promise<Movie[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([MOCK_MOVIES[0], MOCK_MOVIES[1], MOCK_MOVIES[3]]);
    }, 100);
  });
}

// 2. 인기 영화 가져오기 (호프, 스파이더맨, 모아나 2)
export async function getPopularMovies(): Promise<Movie[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([MOCK_MOVIES[0], MOCK_MOVIES[1], MOCK_MOVIES[2]]);
    }, 100);
  });
}

// 3. 상영 예정작 가져오기 (모아나 2, 호프, 스파이더맨)
export async function getUpcomingMovies(): Promise<Movie[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([MOCK_MOVIES[2], MOCK_MOVIES[0], MOCK_MOVIES[1]]);
    }, 100);
  });
}

// 4. 영화 상세 정보 가져오기
export async function getMovieDetails(id: number): Promise<Movie | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const movie = MOCK_MOVIES.find((m) => m.id === id);
      resolve(movie || null);
    }, 100);
  });
}

// 5. 영화 검색하기
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = MOCK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.original_title.toLowerCase().includes(query.toLowerCase())
      );
      resolve(results);
    }, 150);
  });
}

export interface TimetableSession {
  id: string;
  time: string;
  endTime: string;
  hall: string;
  totalSeats: number;
  bookedCount: number;
  isMorning: boolean;
}

// 영화별 동적 상영 시간표 가상 데이터 제공 (요일 및 날짜 시드 활용)
export function getMovieTimetables(movieId: number, date: string): TimetableSession[] {
  // 날짜 기반 시드 생성 (요일 및 일수 계산)
  let dObj = new Date(date);
  if (!date || isNaN(dObj.getTime())) {
    dObj = new Date();
  }
  const dayOfWeek = dObj.getDay(); // 0(일) ~ 6(토)
  const dayOfMonth = dObj.getDate(); // 1 ~ 31
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 요일 및 날짜에 따른 시간 시프트 오프셋 (분 단위)
  const minuteShift = (dayOfMonth % 4) * 15; // 0, 15, 30, 45분
  const hourShift = (dayOfMonth % 2) === 0 ? 0 : 1; // 0시간 또는 1시간

  // 시프트 헬퍼 함수
  const shiftTime = (originalTime: string, durationMin: number) => {
    const [h, m] = originalTime.split(":").map(Number);
    let newH = h + hourShift;
    let newM = m + minuteShift;
    if (newM >= 60) {
      newH += Math.floor(newM / 60);
      newM = newM % 60;
    }
    newH = newH % 24;

    const endH = (newH + Math.floor(durationMin / 60) + (newM + (durationMin % 60) >= 60 ? 1 : 0)) % 24;
    const endM = (newM + (durationMin % 60)) % 60;

    return {
      time: `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`,
      endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
    };
  };

  // 영화별 베이스 세션 리스트 정의
  let baseSessions: { time: string; duration: number; hall: string; totalSeats: number; bookedCount: number }[] = [];

  if (movieId === 9901) {
    // 호프
    baseSessions = [
      { time: "09:30", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 22 },
      { time: "12:40", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 54 },
      { time: "15:50", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 112 },
      { time: "19:00", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 145 },
      { time: "22:10", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 38 },
      { time: "11:00", duration: 156, hall: "2관 (4DX)", totalSeats: 153, bookedCount: 65 },
      { time: "14:10", duration: 156, hall: "2관 (4DX)", totalSeats: 153, bookedCount: 92 },
      { time: "17:20", duration: 156, hall: "2관 (4DX)", totalSeats: 153, bookedCount: 130 }
    ];

    // 주말에는 추가 심야/오후 세션 개설
    if (isWeekend) {
      baseSessions.push(
        { time: "20:30", duration: 156, hall: "2관 (4DX)", totalSeats: 153, bookedCount: 140 },
        { time: "23:40", duration: 156, hall: "5관 (IMAX)", totalSeats: 183, bookedCount: 15 }
      );
    }
  } else if (movieId === 9902) {
    // 스파이더맨
    baseSessions = [
      { time: "08:40", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 35 },
      { time: "11:20", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 110 },
      { time: "14:00", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 162 },
      { time: "16:40", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 95 },
      { time: "19:20", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 171 },
      { time: "22:00", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 88 }
    ];

    if (isWeekend) {
      baseSessions.push(
        { time: "12:30", duration: 140, hall: "4DX Special", totalSeats: 120, bookedCount: 98 },
        { time: "15:10", duration: 140, hall: "4DX Special", totalSeats: 120, bookedCount: 115 },
        { time: "00:40", duration: 140, hall: "1관 2D", totalSeats: 180, bookedCount: 12 }
      );
    }
  } else if (movieId === 9903) {
    // 모아나 2
    baseSessions = [
      { time: "09:50", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 88 },
      { time: "12:00", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 135 },
      { time: "14:10", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 142 },
      { time: "16:20", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 75 },
      { time: "18:30", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 125 }
    ];

    if (isWeekend) {
      baseSessions.push(
        { time: "20:40", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 138 },
        { time: "22:50", duration: 110, hall: "3관 2D", totalSeats: 150, bookedCount: 45 }
      );
    }
  } else {
    // 디폴트 (파묘 등 기타 영화)
    baseSessions = [
      { time: "10:00", duration: 130, hall: "4관 2D", totalSeats: 127, bookedCount: 22 },
      { time: "13:00", duration: 130, hall: "4관 2D", totalSeats: 127, bookedCount: 84 },
      { time: "16:00", duration: 130, hall: "4관 2D", totalSeats: 127, bookedCount: 91 },
      { time: "19:00", duration: 130, hall: "4관 2D", totalSeats: 127, bookedCount: 110 }
    ];

    if (isWeekend) {
      baseSessions.push(
        { time: "22:00", duration: 130, hall: "4관 2D", totalSeats: 127, bookedCount: 48 }
      );
    }
  }

  // 베이스 세션에 요일/일자별 시프트 오프셋 적용하여 리턴
  return baseSessions.map((session, index) => {
    const shifted = shiftTime(session.time, session.duration);
    const hour = parseInt(shifted.time.split(":")[0], 10);
    
    // 조조 상영 판단 (10시 이전 상영 시작)
    const isMorning = hour < 10;

    return {
      id: `${movieId}_${dayOfWeek}_${dayOfMonth}_${index}`,
      time: shifted.time,
      endTime: shifted.endTime,
      hall: session.hall,
      totalSeats: session.totalSeats,
      bookedCount: session.bookedCount,
      isMorning
    };
  }).sort((a, b) => a.time.localeCompare(b.time)); // 시간대 순으로 정렬
}

