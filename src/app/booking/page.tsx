"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "../../store/bookingStore";
import { MOCK_MOVIES, getMovieImageUrl, Movie, getMovieTimetables } from "../../services/tmdb";
import { X, Plus, Sun, SlidersHorizontal } from "lucide-react";

// 극장 탭 설정
const THEATERS = ["건대입구", "강남", "여의도", "홍대", "신촌"];

export default function BookingPage() {
  const router = useRouter();
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedTime,
    setMovie,
    setTheater,
    setDate,
    setTime
  } = useBookingStore();

  const [dateList, setDateList] = useState<{ raw: string; displayDate: string; displayDay: string }[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("전체");
  const [activeTheater, setActiveTheater] = useState("건대입구");
  const [timeFilter, setTimeFilter] = useState("전체");

  // 가로 영화 스와이프 드래그 스크롤 상태 및 헬퍼 추가
  const movieScrollRef = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const onDragStart = (e: React.MouseEvent) => {
    setIsDrag(true);
    setHasDragged(false);
    if (movieScrollRef.current) {
      setStartX(e.pageX - movieScrollRef.current.offsetLeft);
      setScrollLeftState(movieScrollRef.current.scrollLeft);
    }
  };

  const onDragEnd = () => {
    setIsDrag(false);
  };

  const onDragMove = (e: React.MouseEvent) => {
    if (!isDrag || !movieScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - movieScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    movieScrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMovieClick = (movie: any, e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasDragged) {
      setMovie(movie);
      // 클릭 대상 엘리먼트 가로 뷰포트 내 중앙 정렬 이식
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  };

  // 선택된 영화의 동적 시간표 목록 가져오기
  const timetables = selectedMovie ? getMovieTimetables(selectedMovie.id, selectedDate || "") : [];

  // 오전/오후/18시 이후/심야 시간대 필터링
  const filteredTimetables = timetables.filter((session) => {
    if (timeFilter === "전체") return true;

    const [hourStr] = session.time.split(":");
    const hour = parseInt(hourStr, 10);

    if (timeFilter === "오전") return hour < 12;
    if (timeFilter === "오후") return hour >= 12 && hour < 18;
    if (timeFilter === "18시 이후") return hour >= 18 && hour < 22;
    if (timeFilter === "심야") return hour >= 22;
    return true;
  });

  // 오늘부터 7일간의 날짜 리스트 생성 (수요일 15일 기준 또는 오늘 기준)
  useEffect(() => {
    const dates = [];
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      
      dates.push({
        raw: `${year}-${month}-${date}`,
        displayDate: `${d.getDate()}`,
        displayDay: days[d.getDay()]
      });
    }
    setDateList(dates);

    // 디폴트 날짜 셋팅
    if (dates.length > 0 && !selectedDate) {
      setDate(dates[0].raw);
    }
    // 디폴트 극장 셋팅
    if (!selectedTheater) {
      setTheater("건대입구");
    }
  }, [selectedDate, selectedTheater, setDate, setTheater]);

  // 기본 영화가 선택되어 있지 않은 경우 1순위 영화(호프)를 기본 세팅
  useEffect(() => {
    if (!selectedMovie && MOCK_MOVIES.length > 0) {
      setMovie(MOCK_MOVIES[0]);
    }
  }, [selectedMovie, setMovie]);

  const handleTimeSelect = (time: string) => {
    setTime(time);
    // 시간 선택 시 인원 선택 페이지(booking/personnel)로 즉시 라우팅
    router.push("/booking/personnel");
  };

  const ageBadge = (limit: string | undefined) => {
    if (!limit) return null;
    let color = "bg-green-500";
    let widthClass = "w-fit px-1 min-w-4";
    if (limit === "15") {
      color = "bg-orange-500";
      widthClass = "w-4";
    }
    if (limit === "12") {
      color = "bg-blue-500";
      widthClass = "w-4";
    }
    if (limit === "전체") {
      color = "bg-green-600";
    }
    return <span className={`text-[8px] md:text-[9px] font-black text-white rounded-xs ${color} ${widthClass} inline-flex items-center justify-center h-4 leading-none`}>{limit}</span>;
  };

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 select-none">
      
      {/* 1. 상단 타이틀 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white">
        <div className="flex space-x-4 text-sm font-bold items-center">
          <span className="text-slate-950 border-b-2 border-accent pb-0.5">영화별예매</span>
          <span className="text-slate-400 hover:text-slate-600 pb-0.5 cursor-pointer" onClick={() => alert("1차 MVP는 영화별 예매만 지원합니다.")}>
            극장별 예매
          </span>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </header>

      {/* 2. 포맷 필터 칩 (가로 스크롤) */}
      <section className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-white border-b border-slate-100 shrink-0">
        {["전체", "SCREENX", "4DX", "IMAX", "DOLBY ATMOS"].map((fmt) => (
          <button
            key={fmt}
            onClick={() => setSelectedFormat(fmt)}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFormat === fmt
                ? "bg-accent text-white"
                : "bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200"
            }`}
          >
            {fmt}
          </button>
        ))}
      </section>

      {/* 3. 영화 선택 가로 캐러셀 (호프 중심) */}
      <div 
        ref={movieScrollRef}
        onMouseDown={onDragStart}
        onMouseLeave={onDragEnd}
        onMouseUp={onDragEnd}
        onMouseMove={onDragMove}
        className={`px-4 py-4 flex gap-4 overflow-x-auto no-scrollbar bg-slate-50 border-b border-slate-100 items-center justify-start shrink-0 w-full ${
          isDrag ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {MOCK_MOVIES.map((movie) => {
          const isSelected = selectedMovie?.id === movie.id;
          return (
            <div
              key={movie.id}
              onClick={(e) => handleMovieClick(movie, e)}
              className={`flex flex-col items-center space-y-2 shrink-0 transition-all cursor-pointer ${
                isSelected ? "scale-105" : "opacity-40 hover:opacity-75"
              }`}
            >
              <div className={`relative w-[85px] aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                isSelected ? "border-accent shadow-md shadow-accent/20" : "border-transparent"
              }`}>
                <Image
                  src={getMovieImageUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
              {isSelected && (
                <div className="text-center w-[85px]">
                  <p className="text-[11px] font-black text-white truncate flex items-center justify-center gap-1">
                    {ageBadge(movie.age_limit)}
                    <span className="truncate">{movie.title}</span>
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{movie.runtime ? `${Math.floor(movie.runtime/60)}시간 ${movie.runtime%60}분` : "정보 없음"}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. 하얀색 배경의 상영 스케줄 시트 (바텀 시트 테마 모방) */}
      <section className="flex-1 bg-slate-50 text-slate-950 rounded-t-[32px] px-4 py-6 flex flex-col space-y-5 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] border-t border-slate-100">
        
        {/* 가로 날짜 선택 휠 */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 shrink-0">
          {dateList.map((d) => {
            const isSelected = selectedDate === d.raw;
            const isSunday = d.displayDay === "일";
            const isSaturday = d.displayDay === "토";
            
            return (
              <button
                key={d.raw}
                onClick={() => setDate(d.raw)}
                className={`flex flex-col items-center justify-center p-3.5 min-w-[52px] rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-accent border-accent text-white font-extrabold shadow-md shadow-accent/20"
                    : "bg-white border-slate-100 hover:bg-slate-100"
                }`}
              >
                <span className={`text-[10px] font-bold ${
                  isSelected ? "text-white/80" : isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-slate-400"
                }`}>
                  {d.displayDay}
                </span>
                <span className={`text-base font-black mt-1 leading-none ${
                  isSelected ? "text-white" : isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-slate-950"
                }`}>
                  {d.displayDate}
                </span>
              </button>
            );
          })}
        </div>

        {/* 시간대 필터 칩 */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {["전체", "오전", "오후", "18시 이후", "심야"].map((tChip) => (
            <button
              key={tChip}
              onClick={() => setTimeFilter(tChip)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                timeFilter === tChip
                  ? "bg-accent border-accent text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tChip}
            </button>
          ))}
        </div>

        {/* 극장 정보 라벨 */}
        <div className="flex items-center justify-between border-t border-b border-slate-100 py-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-accent text-white font-black text-xs px-4 py-2">
              {activeTheater}
            </span>
            <button 
              onClick={() => alert("1차 MVP는 건대입구 전용으로 작동합니다.")}
              className="text-slate-400 hover:text-slate-600 p-1 border border-slate-200 rounded-full cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="flex space-x-3 text-xs font-bold text-slate-500">
            <span className="text-slate-950 border-b border-accent">전체</span>
            <span>특별관</span>
          </div>
        </div>

        {/* 시간표 목록 그리드 */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5">
          <p className="text-[11px] font-black text-slate-400 mb-3 tracking-wider uppercase">2D 상영 정보</p>
          
          <div className="grid grid-cols-3 gap-2.5">
            {filteredTimetables.map((session) => {
              const seatsLeft = session.totalSeats - session.bookedCount;
              const isSelected = selectedTime === session.time;
              
              return (
                <button
                  key={session.id}
                  onClick={() => handleTimeSelect(session.time)}
                  className={`rounded-2xl p-3 border text-left flex flex-col justify-between h-[84px] transition-all cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-slate-200/80 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-black tracking-tight text-slate-950">
                      {session.time}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      -{session.endTime}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <p className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
                      {session.isMorning && <Sun size={10} className="text-amber-500 fill-amber-500" />}
                      {seatsLeft}석<span className="text-slate-400 font-medium">/{session.totalSeats}석</span>
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{session.hall}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </section>

    </div>
  );
}
