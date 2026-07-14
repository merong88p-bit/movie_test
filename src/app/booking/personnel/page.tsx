"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "../../../store/bookingStore";
import { useAuth } from "../../../context/AuthContext";
import { getMovieImageUrl, getMovieTimetables } from "../../../services/tmdb";
import { ChevronLeft, X, RotateCcw, AlertCircle } from "lucide-react";

// 인원 조절 타입
type PersonType = "adult" | "youth" | "special" | "senior";

export default function BookingPersonnelPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedTime,
    setTime,
    clearSelection
  } = useBookingStore();

  // 선택된 영화의 시간표 리스트 조회
  const timetables = selectedMovie ? getMovieTimetables(selectedMovie.id, selectedDate || "") : [];
  const activeIndex = timetables.findIndex((t) => t.time === selectedTime);
  const siblingSessions = timetables.length > 0 
    ? timetables.slice(Math.max(0, activeIndex - 1), Math.max(0, activeIndex - 1) + 3)
    : [];

  // 인원 수 상태 (레퍼런스 이미지에 맞춰 디폴트로 일반 2명이 활성화된 상태로 설정)
  const [personnel, setPersonnel] = useState<Record<PersonType, number>>({
    adult: 2,
    youth: 0,
    special: 0,
    senior: 0
  });

  const [totalCount, setTotalCount] = useState(2);

  useEffect(() => {
    if (!selectedMovie || !selectedTheater || !selectedDate || !selectedTime) {
      router.replace("/booking");
      return;
    }
  }, [selectedMovie, selectedTheater, selectedDate, selectedTime, router]);

  // 총 인원수 계산
  useEffect(() => {
    const sum = Object.values(personnel).reduce((acc, curr) => acc + curr, 0);
    setTotalCount(sum);
  }, [personnel]);

  const handleSelectCount = (type: PersonType, count: number) => {
    // 최대 8인 제한
    const currentSumWithoutType = Object.entries(personnel)
      .filter(([key]) => key !== type)
      .reduce((acc, [, val]) => acc + val, 0);

    if (currentSumWithoutType + count > 8) {
      alert("최대 8명까지 예매할 수 있습니다.");
      return;
    }

    setPersonnel({
      ...personnel,
      [type]: count
    });
  };

  const handleReset = () => {
    setPersonnel({
      adult: 0,
      youth: 0,
      special: 0,
      senior: 0
    });
  };

  const handleGoSeats = () => {
    if (totalCount <= 0) {
      alert("관람 인원을 최소 1명 이상 선택해 주세요.");
      return;
    }
    // 인원 세팅을 세션 스토리지 또는 로컬 스토리지에 임시 저장해서 seats 페이지로 넘겨줍니다.
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_temp_personnel", JSON.stringify({
        adult: personnel.adult,
        youth: personnel.youth,
        special: personnel.special,
        senior: personnel.senior,
        total: totalCount
      }));
    }
    router.push("/booking/seats");
  };

  if (!selectedMovie) return null;

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 select-none">
      
      {/* 1. 상단 백드롭 오버레이 헤더 (인원선택창.jpg 복제) */}
      <section className="relative p-6 pt-8 pb-7 bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 z-0">
          <Image
            src={getMovieImageUrl(selectedMovie.backdrop_path)}
            alt={selectedMovie.title}
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>

        {/* 제어 버튼 */}
        <div className="relative z-10 flex justify-between items-center text-slate-500 mb-6">
          <button 
            onClick={() => router.back()}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => {
              clearSelection();
              router.push("/");
            }}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 영화 정보 */}
        <div className="relative z-10 text-center space-y-1">
          <h2 className="text-lg font-black text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer">
            {selectedMovie.title}
            <span className="text-xs text-slate-400 font-bold">&gt;</span>
          </h2>
          <p className="text-xs text-slate-500 font-extrabold">{selectedDate} ({selectedTime})</p>
          <p className="text-[10px] text-slate-400 font-bold">{selectedTheater} • 5관 2D</p>
        </div>
      </section>

      {/* 2. 관람 인원 수 선택 칩 (하얀색 배경) */}
      <section className="flex-1 bg-slate-50 text-slate-900 rounded-t-[32px] p-5 flex flex-col space-y-6 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] border-t border-slate-100">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-950">관람인원</h3>
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
          >
            <RotateCcw size={12} />
            초기화
          </button>
        </div>

        {/* 인원 카운터 버튼 격자 */}
        <div className="space-y-4 text-xs font-bold text-slate-500">
          {/* 일반 */}
          <div className="flex items-center">
            <span className="w-12 shrink-0">일반</span>
            <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = personnel.adult === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSelectCount("adult", num)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center border font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "border-accent text-accent font-black scale-103"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 청소년 */}
          <div className="flex items-center">
            <span className="w-12 shrink-0">청소년</span>
            <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = personnel.youth === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSelectCount("youth", num)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center border font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "border-accent text-accent font-black scale-103"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우대 */}
          <div className="flex items-center">
            <span className="w-12 shrink-0 flex items-center gap-0.5">우대<span className="text-[10px] text-slate-300">?</span></span>
            <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = personnel.special === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSelectCount("special", num)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center border font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "border-accent text-accent font-black scale-103"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 경로 */}
          <div className="flex items-center">
            <span className="w-12 shrink-0 flex items-center gap-0.5">경로<span className="text-[10px] text-slate-300">?</span></span>
            <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = personnel.senior === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleSelectCount("senior", num)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center border font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "border-accent text-accent font-black scale-103"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 인접 시간대 칩셋 목록 */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 shrink-0 border-t border-slate-100 pt-5">
          {siblingSessions.map((session) => {
            const isSelected = session.time === selectedTime;
            const seatsLeft = session.totalSeats - session.bookedCount;
            return (
              <button
                key={session.id}
                onClick={() => setTime(session.time)}
                className={`rounded-xl p-3 min-w-[145px] text-left shrink-0 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent/40 bg-accent/5"
                    : "border-slate-100 bg-slate-50 opacity-60 hover:opacity-100"
                }`}
              >
                <p className={`text-base font-black tracking-tight ${isSelected ? "text-accent" : "text-slate-800"}`}>
                  {session.time}~{session.endTime}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {seatsLeft}석 / {session.totalSeats}석
                </p>
              </button>
            );
          })}
        </div>

        {/* 3. 하단 블렌디드 미니맵 영역 (인원선택창 아래쪽.jpg 복제) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4 flex flex-col justify-between h-[210px] shrink-0 shadow-xs">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">좌석을 선택해 주세요.</span>
            <button
              onClick={handleGoSeats}
              disabled={totalCount <= 0}
              className={`rounded-md py-1.5 px-4 text-xs font-black text-white transition-all cursor-pointer ${
                totalCount > 0
                  ? "bg-accent hover:bg-accent-hover shadow-md shadow-accent/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              선택
            </button>
          </div>

          {/* 미니맵 스크린 & 좌석 그래픽 */}
          <div className="flex flex-col items-center">
            <div className="w-1/2 h-[3px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full mb-3" />
            <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-4">screen</p>
            
            {/* 가상 미니 좌석 맵 */}
            <div className="grid grid-cols-12 gap-[2px] max-w-[140px] select-none pointer-events-none opacity-50">
              {[...Array(60)].map((_, idx) => (
                <div key={idx} className="w-[8px] h-[8px] rounded-[1px] bg-slate-300" />
              ))}
            </div>
          </div>

          {/* 범례 */}
          <div className="flex justify-center items-center gap-4 text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-slate-300 rounded-xs" />
              <span>일반석 (181)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
              <span>장애인석 (2)</span>
            </div>
          </div>
        </div>

      </section>

      {/* 4. 최하단 가짜 결제버튼 바 (0원 비활성화) */}
      <footer className="bg-white p-4 border-t border-slate-100 shrink-0">
        <button
          disabled
          className="w-full rounded-xl bg-slate-100 text-slate-400 py-3 text-sm font-black cursor-not-allowed"
        >
          0원 결제하기
        </button>
      </footer>

    </div>
  );
}
