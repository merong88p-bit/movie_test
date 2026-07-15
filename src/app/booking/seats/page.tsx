"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../../../store/bookingStore";
import { useAuth } from "../../../context/AuthContext";
import { getMovieTimetables } from "../../../services/tmdb"; // 동적 시간표 리스너 추가
import { X, AlertCircle } from "lucide-react";

// 극장 좌석 행/열 정의 (A열~N열, 1~13번)
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
const SEAT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
// 복도 배치 (공백 삽입용 열 번호)
const AISLE_NUMBERS = [4, 9]; 

// bookedCount 만큼 결정론적인 가상 예약 좌석 생성
const generatePseudoReservedSeats = (
  movieId: number, 
  date: string, 
  time: string, 
  bookedCount: number
): string[] => {
  const pseudoSeats: string[] = [];
  const allSeats: string[] = [];
  // 전체 좌석 목록 생성
  ROWS.forEach(r => {
    SEAT_NUMBERS.forEach(num => {
      allSeats.push(`${r}${num}`);
    });
  });

  // 결정론적 시드 계산 (날짜, 시간, 영화 ID 조합)
  const dateNum = date.replace(/[-]/g, "").split("").reduce((a, b) => a + parseInt(b, 10), 0);
  const timeNum = parseInt(time.replace(/:/g, ""), 10);
  let seed = movieId + dateNum + timeNum;

  // 단순 결정론적 난수 생성기
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let count = 0;
  while (count < bookedCount && allSeats.length > 0) {
    const idx = Math.floor(random() * allSeats.length);
    const seat = allSeats.splice(idx, 1)[0];
    
    // 장애인석(A7, A8)은 가상 예약에서 제외하여 사용자가 선택 가능하도록 보장
    if (seat === "A7" || seat === "A8") {
      continue;
    }

    pseudoSeats.push(seat);
    count++;
  }
  return pseudoSeats;
}; 

export default function SeatsSelectionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Zustand 스토어 연동
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedTime,
    selectedSeats,
    toggleSeat,
    setSelectedSeats,
    getReservedSeats,
    loadBookings,
    clearSelection
  } = useBookingStore();

  // 인원수 상태 (로컬 스토리지에서 파싱)
  const [adultCount, setAdultCount] = useState(2);
  const [youthCount, setYouthCount] = useState(0);
  const [totalPersonnel, setTotalPersonnel] = useState(2);

  // 예약 불가 좌석
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return; // 세션 로딩 중일 때는 판단 대기

    if (!selectedMovie || !selectedTheater || !selectedDate || !selectedTime) {
      router.replace("/booking");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    // 인원수 데이터 로드
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mv_temp_personnel");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAdultCount(parsed.adult || 0);
          setYouthCount(parsed.youth || 0);
          setTotalPersonnel(parsed.total || 2);
        } catch (e) {
          console.error("Failed to parse temp personnel", e);
        }
      }
    }

    const initSeats = async () => {
      // 1. 최신 예매 현황 백엔드 API에서 로드 동기화
      await loadBookings(user.id);

      // 2. 이미 다른 세션에서 예약 완료된 좌석 로딩
      const reservedFromStore = getReservedSeats(
        selectedMovie.id,
        selectedTheater,
        selectedDate,
        selectedTime
      );

      // 선택한 세션의 bookedCount(예매 좌석수) 가져오기
      const timetables = getMovieTimetables(selectedMovie.id, selectedDate || "");
      const currentSession = timetables.find((t) => t.time === selectedTime);
      const bookedCount = currentSession ? currentSession.bookedCount : 35;

      // 결정론적 가상 예약 완료 좌석 생성
      const pseudoReserved = generatePseudoReservedSeats(
        selectedMovie.id,
        selectedDate,
        selectedTime,
        bookedCount
      );

      // 실제 스토어 예매 정보 + 가상 예약 정보 병합
      const finalReserved = Array.from(new Set([...reservedFromStore, ...pseudoReserved]));
      setReservedSeats(finalReserved);
    };

    initSeats();
    
    // 이전 좌석 초기화
    setSelectedSeats([]);
  }, [selectedMovie, selectedTheater, selectedDate, selectedTime, user, loading, router, getReservedSeats, loadBookings, setSelectedSeats]);

  const handleSeatClick = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return;
    
    const isAlreadySelected = selectedSeats.includes(seatId);
    
    if (!isAlreadySelected && selectedSeats.length >= totalPersonnel) {
      // 지정한 인원수보다 초과하여 좌석을 누르면, 가장 오래된 선택을 빼고 새로 추가
      const newSeats = [...selectedSeats.slice(1), seatId];
      setSelectedSeats(newSeats);
    } else {
      toggleSeat(seatId);
    }
  };

  const handleSeatComplete = () => {
    if (selectedSeats.length !== totalPersonnel) {
      alert(`관람 인원(${totalPersonnel}명)과 선택한 좌석 수(${selectedSeats.length}개)가 일치해야 합니다.`);
      return;
    }

    // 가격 계산 및 임시 저장 후 결제 페이지로 이동
    const totalPrice = adultCount * 14000 + youthCount * 11000;
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_temp_payment", JSON.stringify({
        seats: selectedSeats,
        price: totalPrice,
        adult: adultCount,
        youth: youthCount
      }));
    }

    router.push("/booking/payment");
  };

  if (!selectedMovie || !user) return null;

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 select-none">
      
      {/* 1. 상단 타이틀 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-sm font-black text-slate-950 tracking-wide flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            {selectedTheater} <span className="text-slate-400 font-bold text-xs">5관</span>
          </h1>
        </div>
        <button 
          onClick={() => {
            clearSelection();
            router.push("/");
          }}
          className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </header>

      {/* 2. 메인 좌석 맵 보드 (자리선택창.jpg 디자인 완벽 복제) */}
      <section className="flex-1 px-3 py-6 flex flex-col items-center overflow-x-auto min-h-[460px] relative bg-slate-50">
        
        {/* 가상 오버레이 뷰포트 미니맵 미니어처 (좌측 상단 고정) */}
        <div className="absolute top-4 left-4 w-[76px] h-[105px] border border-slate-200 bg-white rounded-md p-1.5 flex flex-col justify-between hidden sm:flex select-none pointer-events-none z-10 shadow-xs">
          <div className="w-full h-[2px] bg-slate-300 rounded-full" />
          <div className="grid grid-cols-8 gap-[1px] opacity-40">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="w-[5px] h-[5px] bg-slate-400 rounded-3xs" />
            ))}
          </div>
          <div className="w-full h-4 border border-accent/40 rounded bg-accent/5" />
        </div>

        {/* Screen Banner */}
        <div className="w-full max-w-xs mb-10 text-center select-none">
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full shadow-[0_1px_4px_rgba(3,199,90,0.1)]" />
          <span className="text-[8px] uppercase tracking-[0.4em] font-extrabold text-slate-400 block mt-2">Screen</span>
        </div>

        {/* 범례 표시 */}
        <div className="flex items-center space-x-4 text-[9px] font-bold text-slate-400 mb-6 select-none">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-md bg-white border border-slate-200" />
            <span>일반석</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-md bg-blue-500" />
            <span>장애인석</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-md bg-slate-200 border border-slate-200 flex items-center justify-center text-[7px] text-slate-400">/</div>
            <span>예약불가</span>
          </div>
        </div>

        {/* Light존 배지 */}
        <div className="mb-4 shrink-0 select-none">
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500 font-black text-[9px] px-2 py-0.5 uppercase tracking-wider">
            ⚡ Light존
          </span>
        </div>

        {/* 좌석 그리드 맵 */}
        <div className="space-y-1 select-none pr-1 min-w-[360px]">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center space-x-1 justify-center">
              
              {/* 행 문자 */}
              <span className="w-4 text-[10px] font-bold text-slate-500 text-center shrink-0 pr-1">{row}</span>

              {/* 열 루프 */}
              {SEAT_NUMBERS.map((num) => {
                const seatId = `${row}${num}`;
                const isReserved = reservedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isAisle = AISLE_NUMBERS.includes(num);
                const isDisabilitySeat = row === "A" && (num === 7 || num === 8); // 맨 앞열 7,8번을 장애인석으로 배치

                // 좌석 버튼 컬러 정의
                let btnColor = "bg-white border-slate-200 text-slate-900 hover:bg-slate-50";
                if (isDisabilitySeat) {
                  btnColor = "bg-blue-500 border-blue-600 text-white font-extrabold";
                }
                
                if (isReserved) {
                  // 대각선 취소선 표시의 비활성화 상태 (초록/화이트 테마이므로 회색)
                  btnColor = "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed";
                } else if (isSelected) {
                  btnColor = "bg-accent border-accent text-white font-black scale-103 shadow-md shadow-accent/20";
                }

                return (
                  <div key={num} className="flex items-center shrink-0">
                    <button
                      disabled={isReserved}
                      onClick={() => handleSeatClick(seatId)}
                      className={`w-6 h-6 text-[8px] rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${btnColor}`}
                    >
                      {isReserved ? (
                        <span className="text-[9px] opacity-75 font-light">/</span>
                      ) : (
                        num
                      )}
                    </button>
                    {/* 통로 빈공간 삽입 */}
                    {isAisle && <div className="w-3.5 shrink-0" />}
                  </div>
                );
              })}

            </div>
          ))}
        </div>

      </section>

      {/* 3. 하단 요약 정보 바 & 선택완료 버튼 (자리선택창.jpg 하단 복제) */}
      <footer className="bg-slate-50 p-4 border-t border-slate-100 shrink-0 flex flex-col space-y-4 shadow-[0_-8px_24px_rgba(0,0,0,0.03)]">
        
        {/* 인원 요약 및 변경 버튼 */}
        <div className="flex justify-between items-center text-xs font-bold px-1 select-none">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">관람 인원</span>
            <span className="text-slate-950 font-black">일반 {totalPersonnel}</span>
          </div>
          <button
            onClick={() => router.push("/booking/personnel")}
            className="rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 px-3.5 py-1.5 transition-colors cursor-pointer"
          >
            인원변경
          </button>
        </div>

        {/* 선택 완료 (결제 단계 이동) 버튼 */}
        <button
          onClick={handleSeatComplete}
          disabled={selectedSeats.length !== totalPersonnel}
          className={`w-full rounded-xl py-3.5 text-sm font-black text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
            selectedSeats.length === totalPersonnel
              ? "bg-accent hover:bg-accent-hover shadow-accent/20"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent shadow-none"
          }`}
        >
          {selectedSeats.length === totalPersonnel ? "선택완료" : `${totalPersonnel - selectedSeats.length}개의 좌석을 더 선택하세요`}
        </button>

      </footer>

    </div>
  );
}
