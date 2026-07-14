"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Calendar, Award, Sparkles, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import { getMovieImageUrl } from "../../services/tmdb";

export default function EventsPage() {
  const router = useRouter();
  const { user, chargePoints } = useAuth();

  const handleClaimPoints = () => {
    chargePoints(10000);
    alert("🎉 그린 시네마 이벤트 참여 감사 선물로 10,000P가 지급되었습니다! 마이페이지에서 확인하실 수 있습니다.");
  };

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 select-none pb-12">
      
      {/* 1. 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-30 shrink-0">
        <button 
          onClick={() => router.push("/")}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 font-black text-sm"
        >
          <ChevronLeft size={20} />
          이벤트 / 혜택
        </button>
        <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
          CINE GREEN
        </span>
      </header>

      {/* 2. 이벤트 배너 & 리스트 */}
      <div className="flex-1 bg-slate-50 px-4 py-5 space-y-5 overflow-y-auto no-scrollbar">
        
        {/* 이벤트 1: 그린 시네마 피크닉 (초록 테마 포인트 지급 미션) */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
          {/* 가상 이미지 배너 */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 h-[140px] p-5 flex flex-col justify-between text-white relative">
            <span className="absolute top-4 right-4 bg-white/20 border border-white/10 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
              D-7
            </span>
            <div className="space-y-1">
              <span className="rounded bg-white/25 text-[9px] font-black px-1.5 py-0.5 inline-block">포인트 미션</span>
              <h3 className="text-base font-black tracking-tight leading-tight">그린 시네마 피크닉</h3>
            </div>
            <p className="text-[10px] text-white/80 font-medium">참석 완료 시 10,000P 100% 즉시 증정!</p>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-white">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900">그린 시네마 감사 선물 받기</p>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={11} /> 2026.07.14 ~ 07.21
              </p>
            </div>
            <button
              onClick={handleClaimPoints}
              className="rounded-full bg-accent hover:bg-accent-hover text-white text-[10px] font-black px-4 py-2 shadow-sm shadow-accent/20 cursor-pointer transition-colors"
            >
              10,000P 받기
            </button>
          </div>
        </div>

        {/* 이벤트 2: 매주 수요일 더블 포인트 */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
          <div className="bg-gradient-to-br from-amber-500 to-emerald-600 h-[140px] p-5 flex flex-col justify-between text-white relative">
            <span className="absolute top-4 right-4 bg-white/20 border border-white/10 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
              상시 진행
            </span>
            <div className="space-y-1">
              <span className="rounded bg-white/25 text-[9px] font-black px-1.5 py-0.5 inline-block">예매 적립</span>
              <h3 className="text-base font-black tracking-tight leading-tight">매주 수요일 더블 적립 DAY</h3>
            </div>
            <p className="text-[10px] text-white/80 font-medium">수요일 상영 세션 예매 시 포인트 2배 자동 누적</p>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-white">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900">예매 시 2배 자동 적용</p>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Award size={11} /> 수요일 상영일 예매 고객 대상
              </p>
            </div>
            <button
              onClick={() => router.push("/booking")}
              className="rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black px-4 py-2 cursor-pointer transition-colors"
            >
              예매하러 가기
            </button>
          </div>
        </div>

        {/* 이벤트 3: 팝콘콤보 할인쿠폰 */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
          <div className="bg-gradient-to-br from-emerald-600 to-slate-700 h-[140px] p-5 flex flex-col justify-between text-white relative">
            <span className="absolute top-4 right-4 bg-white/20 border border-white/10 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
              선착순
            </span>
            <div className="space-y-1">
              <span className="rounded bg-white/25 text-[9px] font-black px-1.5 py-0.5 inline-block">매점 할인</span>
              <h3 className="text-base font-black tracking-tight leading-tight">팝콘&음료 콤보 2천원 할인권</h3>
            </div>
            <p className="text-[10px] text-white/80 font-medium">매점 키오스크 바코드 스캔 즉시 할인 적용</p>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-white">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900">선착순 쿠폰 발급 받기</p>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Gift size={11} /> ID당 매월 1회 지급
              </p>
            </div>
            <button
              onClick={() => alert("🎉 매점 콤보 2,000원 할인쿠폰이 쿠폰함에 발급되었습니다!")}
              className="rounded-full bg-accent hover:bg-accent-hover text-white text-[10px] font-black px-4 py-2 shadow-sm shadow-accent/20 cursor-pointer transition-colors"
            >
              쿠폰 다운로드
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
