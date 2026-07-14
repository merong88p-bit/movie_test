"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { useBookingStore } from "../store/bookingStore";
import Navbar from "./Navbar";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const loadBookings = useBookingStore((state) => state.loadBookings);

  // 마운트 시 로컬 예매 내역 불러오기
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <AuthProvider>
      {/* 데스크톱용 영화적 오버레이 배경 */}
      <div className="fixed inset-0 z-0 bg-[#f1f5f9] flex items-center justify-center overflow-hidden">
        {/* 은은한 그라데이션 원형 블러 */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        
        {/* 사이드 장식용 브랜드 네임 */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col text-slate-300/40 tracking-widest font-black select-none pointer-events-none">
          <span className="text-8xl rotate-90 origin-left opacity-30">MOVIEVERSE</span>
        </div>
      </div>

      {/* 실질적인 반응형 모바일 셸 컨테이너 */}
      <div className="relative z-10 min-h-screen w-full flex justify-center items-center">
        {
          /* 
            데스크톱: 430px 너비의 모바일 프레임으로 렌더링 (그림자, 테두리 추가)
            모바일: 100vw, 100vh 꽉 찬 화면
          */
        }
        <div className="w-full max-w-[430px] min-h-screen md:min-h-[850px] md:max-h-[92vh] md:rounded-[40px] md:border-[6px] md:border-slate-200/80 bg-background text-foreground flex flex-col shadow-[0_20px_50px_rgba(3,199,90,0.08)] overflow-hidden relative">
          
          {/* 가상 모바일 상태바 장식 (데스크톱 셸 상단에만 렌더링) */}
          <div className="w-full h-6 bg-slate-100 px-6 justify-between items-center text-[10px] text-slate-500 font-bold hidden md:flex shrink-0">
            <span>12:30</span>
            <div className="flex items-center space-x-1">
              <span>5G</span>
              <div className="w-4 h-2 border border-slate-400 rounded-sm p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-500 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* 메인 스크롤 콘텐츠 영역 */}
          <main className="flex-1 overflow-y-auto no-scrollbar pb-16 relative">
            {children}
          </main>

          {/* 바텀 탭바 (셸 하단에 고정) */}
          <Navbar />
        </div>
      </div>
    </AuthProvider>
  );
}
