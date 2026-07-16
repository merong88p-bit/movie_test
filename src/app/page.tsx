"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Movie, getPopularMovies, getNowPlayingMovies, getUpcomingMovies, getMovieImageUrl } from "../services/tmdb";
import { useBookingStore } from "../store/bookingStore";
import MovieDetailModal from "../components/MovieDetailModal";
import { Search, Bell, Ticket, Heart, SlidersHorizontal, Info, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const setMovieStore = useBookingStore((state) => state.setMovie);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"chart" | "now" | "upcoming">("chart");
  const [detailMovieId, setDetailMovieId] = useState<number | null>(null);
  
  // 좋아요(하트) 토글 상태
  const [likedMovies, setLikedMovies] = useState<number[]>([]);

  // 검색 토글
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 자동 롤링 및 페이지네이션을 위한 상태
  const [currentIndex, setCurrentIndex] = useState(0);

  // 드래그 스크롤을 위한 마우스 상태 정의
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const onDragStart = (e: React.MouseEvent) => {
    setIsDrag(true);
    setHasDragged(false);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeftState(scrollContainerRef.current.scrollLeft);
    }
  };

  const onDragEnd = () => {
    setIsDrag(false);
  };

  const onDragMove = (e: React.MouseEvent) => {
    if (!isDrag || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 드래그 민감도 배수
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // 수동 스크롤 시 도트 위치 동기화
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / 295);
      setCurrentIndex(index);
    }
  };



  const handleCardClick = (movieId: number) => {
    if (!hasDragged) {
      setDetailMovieId(movieId);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollAmount = 295; // 카드 너비 275 + 간격 20
      const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
      const nextIndex = Math.round(targetScroll / 295);
      setCurrentIndex(Math.max(0, Math.min(nextIndex, filteredMovies.length - 1)));
    }
  };

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      let data: Movie[] = [];
      if (activeSubTab === "chart") {
        data = await getPopularMovies();
      } else if (activeSubTab === "now") {
        data = await getNowPlayingMovies();
      } else if (activeSubTab === "upcoming") {
        data = await getUpcomingMovies();
      }
      setMovies(data);
      setLoading(false);
    };
    loadMovies();
  }, [activeSubTab]);

  const handleLikeToggle = (movieId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedMovies.includes(movieId)) {
      setLikedMovies(likedMovies.filter((id) => id !== movieId));
    } else {
      setLikedMovies([...likedMovies, movieId]);
    }
  };

  const handleBooking = (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMovieStore(movie);
    router.push("/booking");
  };

  // 등급 배지 컬러 헬퍼
  const getAgeLimitBadge = (limit: string | undefined) => {
    if (!limit) return null;
    let bgColor = "bg-green-500";
    let text = limit;
    let widthClass = "w-4";
    
    if (limit === "15") {
      bgColor = "bg-orange-500";
    } else if (limit === "12") {
      bgColor = "bg-blue-500";
    } else if (limit === "전체") {
      bgColor = "bg-green-600";
      text = "전체";
      widthClass = "w-fit px-1 min-w-4";
    } else if (limit === "청불" || limit === "19") {
      bgColor = "bg-red-600";
      text = "청불";
      widthClass = "w-fit px-1 min-w-4";
    }

    return (
      <span className={`h-4 rounded-xs flex items-center justify-center text-[8px] md:text-[9px] font-black text-white ${bgColor} ${widthClass} shrink-0 leading-none`}>
        {text}
      </span>
    );
  };

  // 검색어에 따른 필터링 리스트
  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3초마다 자동 롤링 타이머 (드래그 중이 아닐 때만 작동)
  useEffect(() => {
    if (filteredMovies.length === 0 || isDrag) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % filteredMovies.length;
      setCurrentIndex(nextIndex);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: nextIndex * 295,
          behavior: "smooth"
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, filteredMovies.length, isDrag]);

  const navigateToSlide = (index: number) => {
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * 295,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="flex flex-col text-slate-800 bg-white min-h-full">
      {/* 1. 상단 로고 & 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/95 sticky top-0 z-30 backdrop-blur-sm border-b border-slate-100">
        {/* CGV 스타일의 로고 */}
        <Link href="/" className="flex items-center space-x-1 select-none">
          <span className="text-[19px] font-black tracking-tighter text-accent italic">
            다인씨네마
          </span>
          <span className="text-[10px] font-extrabold text-slate-500 border border-slate-200 rounded-xs px-1 py-[1px] ml-1.5 leading-none">
            MVP
          </span>
        </Link>

        {/* 헤더 우측 유틸 아이콘 */}
        <div className="flex items-center space-x-4 text-slate-600">
          <button 
            onClick={() => router.push("/mypage")}
            className="hover:text-accent transition-colors cursor-pointer"
          >
            <Ticket size={20} />
          </button>
          <button 
            onClick={() => alert("알림이 없습니다.")}
            className="hover:text-accent transition-colors cursor-pointer"
          >
            <Bell size={20} />
          </button>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`hover:text-accent transition-colors cursor-pointer ${showSearch ? "text-accent" : ""}`}
          >
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* 실시간 검색창 오버레이 */}
      {showSearch && (
        <div className="px-4 py-2 bg-slate-50 border-b border-border-color animate-fadeIn">
          <input
            type="text"
            placeholder="영화 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
        </div>
      )}

      {/* 2. 카테고리 가로 스크롤 칩 (영화, 이벤트/혜택 등) */}
      <section className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar scroll-smooth">
        <button className="rounded-full bg-accent text-white font-extrabold text-[11px] px-3.5 py-1.5 shrink-0 cursor-pointer">
          🎬 영화
        </button>
        <button 
          onClick={() => router.push("/events")}
          className="rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] px-3.5 py-1.5 shrink-0 hover:text-slate-700 cursor-pointer"
        >
          🎉 이벤트/혜택
        </button>
        <button 
          onClick={() => router.push("/minions")}
          className="rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] px-3.5 py-1.5 shrink-0 hover:text-slate-700 cursor-pointer"
        >
          👾 미니언즈 탐구생활
        </button>
        <button 
          onClick={() => router.push("/clubs")}
          className="rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] px-3.5 py-1.5 shrink-0 hover:text-slate-700 cursor-pointer"
        >
          🏆 클럽서비스
        </button>
      </section>

      {/* 회색 구분용 파티션 */}
      <div className="w-full h-[1px] bg-slate-100" />

      {/* 3. 서브 메뉴 탭 (무비차트 등) */}
      <section className="flex items-center justify-between px-4 py-4 select-none">
        <div className="flex space-x-6 text-[13px] font-bold">
          <button
            onClick={() => setActiveSubTab("chart")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeSubTab === "chart"
                ? "text-slate-900 border-b-[2px] border-accent font-black"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            무비차트
          </button>
          <button
            onClick={() => setActiveSubTab("now")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeSubTab === "now"
                ? "text-slate-900 border-b-[2px] border-accent font-black"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            현재상영작
          </button>
          <button
            onClick={() => setActiveSubTab("upcoming")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeSubTab === "upcoming"
                ? "text-slate-900 border-b-[2px] border-accent font-black"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            상영예정
          </button>
        </div>
        
        <span className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
          전체보기 &gt;
        </span>
      </section>

      {/* 4. 메인 영화 카드 슬라이더 (CGV 홈 레이아웃 복제) */}
      <section className="flex-1 py-2 flex flex-col justify-center relative group/carousel">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
            <p className="text-xs text-slate-500 font-semibold">영화 목록 로드 중...</p>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="relative w-full flex flex-col items-center">
            <div className="relative w-full flex items-center">
              {/* 좌측 화살표 버튼 */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-2 z-30 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 border border-slate-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex cursor-pointer shadow-lg animate-fadeIn"
              >
                <ChevronLeft size={20} />
              </button>

              <div 
                ref={scrollContainerRef}
                onMouseDown={onDragStart}
                onMouseLeave={onDragEnd}
                onMouseUp={onDragEnd}
                onMouseMove={onDragMove}
                onScroll={handleScroll}
                className={`flex overflow-x-auto snap-x no-scrollbar gap-5 px-6 pb-6 scroll-smooth w-full ${
                  isDrag ? "cursor-grabbing select-none" : "cursor-grab"
                }`}
              >
              {filteredMovies.map((movie, index) => {
                const isLiked = likedMovies.includes(movie.id);
                const rank = index + 1;
                return (
                  <div
                    key={movie.id}
                    className="snap-center shrink-0 w-[275px] flex flex-col space-y-4 relative group"
                    onClick={() => handleCardClick(movie.id)}
                  >
                    {/* 포스터 프레임 */}
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.1)] cursor-pointer">
                      <Image
                        src={getMovieImageUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        sizes="280px"
                        className="object-cover transition-transform duration-500 group-hover:scale-103"
                        priority={rank === 1}
                      />

                      {/* 시네마 그라데이션 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-85" />

                      {/* 좋아요 (하트) 아이콘 */}
                      <button
                        onClick={(e) => handleLikeToggle(movie.id, e)}
                        className="absolute top-3 right-3 z-20 rounded-full bg-black/35 p-2 text-white border border-white/10 backdrop-blur-xs hover:bg-black/60 active:scale-90 transition-all cursor-pointer"
                      >
                        <Heart
                          size={16}
                          className={isLiked ? "fill-accent text-accent animate-pulse" : "text-white"}
                        />
                      </button>

                      {/* 등수 텍스트 배지 (포스터 좌측 하단 거대하게 렌더링) */}
                      <div className="absolute bottom-2 left-3 select-none pointer-events-none">
                        <span className="text-7xl font-black italic text-white/95 tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                          {rank}
                        </span>
                      </div>

                      {/* 상영 포맷 배지 목록 (우측 하단) */}
                      {movie.formats && (
                        <div className="absolute bottom-3 right-3 flex flex-wrap gap-1 items-end justify-end pointer-events-none select-none max-w-[65%]">
                          {movie.formats.map((fmt) => (
                            <span
                              key={fmt}
                              className="bg-black/60 border border-white/10 rounded-sm text-[8px] font-black text-white px-1 py-[1px] tracking-wide"
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 하단 텍스트 및 상세 */}
                    <div className="px-1 space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        {getAgeLimitBadge(movie.age_limit)}
                        <h3 className="text-base font-extrabold text-slate-900 truncate flex-1">
                          {movie.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>
                          예매율 <span className="text-slate-900 font-extrabold">{movie.booking_rate || 0}%</span>
                        </span>
                        <div className="flex space-x-1.5 items-center">
                          <span className="text-slate-300">|</span>
                          <span>{movie.release_date.replace(/-/g, ".")} 개봉</span>
                          {movie.d_day && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-accent font-black text-[10px]">{movie.d_day}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 예매하기 버튼 (초록색 테마) */}
                      <div className="pt-2">
                        <button
                          onClick={(e) => handleBooking(movie, e)}
                          className="w-full rounded-full bg-accent hover:bg-accent-hover text-white font-black py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          예매하기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* 우측 화살표 버튼 */}
              <button
                onClick={() => scroll("right")}
                className="absolute right-2 z-30 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 border border-slate-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex cursor-pointer shadow-lg animate-fadeIn"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 페이지네이션 인디케이터 도트 (원하는 부분 클릭 시 즉시 스크롤 이동) */}
            <div className="flex justify-center items-center space-x-2 pt-2 pb-6 select-none z-30 mb-2">
              {filteredMovies.map((_, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => navigateToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? "bg-accent w-4" 
                        : "bg-slate-200 w-2 hover:bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <SlidersHorizontal size={36} className="mb-2 opacity-30" />
            <p className="text-xs">일치하는 영화 정보가 없습니다.</p>
          </div>
        )}
      </section>

      {/* 5. 영화 상세 모달 */}
      <MovieDetailModal
        movieId={detailMovieId}
        onClose={() => setDetailMovieId(null)}
      />
    </div>
  );
}
