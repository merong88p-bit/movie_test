"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Award, Sparkles, HelpCircle, Film, CheckCircle2 } from "lucide-react";
import { useBookingStore } from "../../store/bookingStore";
import { useAuth } from "../../context/AuthContext";

export default function ClubsPage() {
  const router = useRouter();
  const { myBookings } = useBookingStore();
  const { chargePoints } = useAuth();

  // 실제 예매 내역(myBookings)을 스캔하여 스페셜 포맷이 포함되었는지 판단
  const hasImax = myBookings.some(b => b.movieFormats?.includes("IMAX"));
  const has4dx = myBookings.some(b => b.movieFormats?.includes("4DX"));
  const hasScreenx = myBookings.some(b => b.movieFormats?.includes("SCREENX"));

  const stampCount = [hasImax, has4dx, hasScreenx].filter(Boolean).length;

  const handleClaimClubBonus = () => {
    if (stampCount < 3) {
      alert("IMAX, 4DX, SCREENX 특별관을 각각 최소 1회씩 모두 관람하여 스탬프 3개를 채워야 보너스를 받으실 수 있습니다!");
      return;
    }
    chargePoints(20000);
    alert("🎉 특별관 마니아 미션 완료! 20,000P 가상 포인트 보너스가 계정으로 즉시 지급되었습니다!");
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
          특별관 클럽 서비스
        </button>
        <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
          MANIA CLUB
        </span>
      </header>

      {/* 2. 클럽 멤버십 안내 카드 */}
      <div className="flex-1 bg-slate-50 px-4 py-5 space-y-5 overflow-y-auto no-scrollbar">
        
        {/* 클럽 상태 대시보드 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">특별관 마니아 스탬프 북</h3>
              <p className="text-[10px] text-slate-400 font-bold">특별관을 예매해 관람하면 도장이 자동으로 쾅!</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center text-xs font-bold border border-slate-100">
            <span className="text-slate-500">완성된 스탬프</span>
            <span className="text-accent text-sm font-black">{stampCount} / 3 개</span>
          </div>
        </div>

        {/* 3. 스탬프 다이어리 보드 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6 shadow-xs">
          <h4 className="text-xs font-black text-slate-950 border-b border-slate-100 pb-2 flex items-center gap-1">
            <Film size={14} className="text-accent" />
            나의 특별관 스탬프 현황
          </h4>

          {/* 스탬프 도장 목록 그리드 */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* 스탬프 1: IMAX */}
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${
                hasImax 
                  ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10 scale-103" 
                  : "border-dashed border-slate-200 bg-slate-50"
              }`}>
                {hasImax ? (
                  <>
                    <div className="absolute inset-1 rounded-full border border-amber-500/40 border-dashed" />
                    <span className="text-[10px] font-black text-amber-600 tracking-wider">IMAX</span>
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-200/60 px-1 rounded-xs mt-1">관람 완료</span>
                    <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full shadow-xs" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black text-slate-300">IMAX</span>
                    <span className="text-[8px] text-slate-400 font-bold mt-1">미완료</span>
                  </>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-700">IMAX 스탬프</p>
            </div>

            {/* 스탬프 2: 4DX */}
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${
                has4dx 
                  ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10 scale-103" 
                  : "border-dashed border-slate-200 bg-slate-50"
              }`}>
                {has4dx ? (
                  <>
                    <div className="absolute inset-1 rounded-full border border-amber-500/40 border-dashed" />
                    <span className="text-[10px] font-black text-amber-600 tracking-wider">4DX</span>
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-200/60 px-1 rounded-xs mt-1">관람 완료</span>
                    <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full shadow-xs" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black text-slate-300">4DX</span>
                    <span className="text-[8px] text-slate-400 font-bold mt-1">미완료</span>
                  </>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-700">4DX 스탬프</p>
            </div>

            {/* ... 스탬프 3: SCREENX */}
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${
                hasScreenx 
                  ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10 scale-103" 
                  : "border-dashed border-slate-200 bg-slate-50"
              }`}>
                {hasScreenx ? (
                  <>
                    <div className="absolute inset-1 rounded-full border border-amber-500/40 border-dashed" />
                    <span className="text-[10px] font-black text-amber-600 tracking-wider">SCREENX</span>
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-200/60 px-1 rounded-xs mt-1">관람 완료</span>
                    <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full shadow-xs" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black text-slate-300">SCREENX</span>
                    <span className="text-[8px] text-slate-400 font-bold mt-1">미완료</span>
                  </>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-700">SCREENX 스탬프</p>
            </div>

          </div>

          {/* 예매되지 않은 스탬프가 있을 경우 안내 */}
          {stampCount < 3 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 text-[10px] text-slate-500 font-semibold leading-relaxed flex items-start gap-1.5 animate-fadeIn">
              <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span>아직 수집하지 못한 스탬프가 있습니다. 무비차트에서 특별관 포맷(IMAX, 4DX, SCREENX) 영화를 예매하여 관람을 완료해 주세요!</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. 마니아 보너스 보상 청구 버튼 */}
        <div className="w-full">
          <button
            onClick={handleClaimClubBonus}
            disabled={stampCount < 3}
            className={`w-full rounded-xl py-3.5 text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-md ${
              stampCount === 3
                ? "bg-accent hover:bg-accent-hover cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent shadow-none"
            }`}
          >
            <Sparkles size={14} />
            마니아 클럽 20,000P 받기
          </button>
        </div>

      </div>

    </div>
  );
}
