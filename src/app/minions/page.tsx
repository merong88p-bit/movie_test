"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const MINION_SAYINGS = [
  "Bello! (안녕!)",
  "Poopaye! (잘 가!)",
  "Tank yu! (고마워!)",
  "Banana! (바나나!)",
  "Tulaliloo ti amo! (사랑해!)",
  "Gelato! (아이스크림!)",
  "Kanpai! (건배!)",
  "Muak muak muak! (쪽쪽!)",
  "Baboi! (장난감!)",
  "Poka? (무슨 일이야?)"
];

export default function MinionsPage() {
  const router = useRouter();
  const { chargePoints } = useAuth();

  const [gauge, setGauge] = useState(0);
  const [saying, setSaying] = useState("Bello! 나를 탭해서 바나나 에너지를 채워줘!");
  const [isShaking, setIsShaking] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Web Audio API를 활용한 귀여운 8비트 미니언즈풍 하이피치 사운드 생성기
  const playMinionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // 음표 1 (도)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      // 음표 2 (시차를 둔 미)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.08); // B5
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.08);
      }, 50);

    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  };

  const handleMinionTap = () => {
    // 셰이킹 모션 발동
    setIsShaking(true);
    playMinionSound();
    
    // 무작위 말풍선 문구 설정
    const randIdx = Math.floor(Math.random() * MINION_SAYINGS.length);
    setSaying(MINION_SAYINGS[randIdx]);

    // 게이지 상승 (최대 100)
    if (gauge < 100) {
      setGauge(prev => Math.min(prev + 10, 100));
    }

    setTimeout(() => {
      setIsShaking(false);
    }, 300);
  };

  const handleClaimReward = () => {
    if (gauge < 100 || claimed) return;
    chargePoints(1500);
    setClaimed(true);
    alert("🎉 바나나 에너지 풀 충전 완료! 미니언즈의 축하 선물로 1,500P 가상 포인트가 지급되었습니다.");
  };

  return (
    <div className="flex flex-col min-h-full bg-amber-400 text-slate-900 select-none pb-12">
      
      {/* 1. 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-amber-500/30 bg-amber-400 sticky top-0 z-30 shrink-0">
        <button 
          onClick={() => router.push("/")}
          className="text-slate-800 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1.5 font-black text-sm"
        >
          <ChevronLeft size={20} />
          미니언즈 탐구생활
        </button>
        <span className="text-xs text-amber-900 font-extrabold flex items-center gap-1">
          BANANA ZONE
        </span>
      </header>

      {/* 2. 메인 게임 보드 */}
      <div className="flex-1 px-5 py-6 flex flex-col items-center justify-between space-y-6">
        
        {/* 상단 미션 안내 */}
        <div className="w-full bg-white/80 backdrop-blur-xs border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5 shadow-sm">
          <span className="bg-amber-500 text-white rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider animate-pulse inline-block">
            미션 진행 중
          </span>
          <h3 className="text-sm font-black text-slate-900 leading-tight">미니언즈를 탭하여 바나나 에너지를 채워주세요!</h3>
          
          {/* 바나나 게이지 바 */}
          <div className="space-y-1.5 pt-1">
            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
              <div 
                className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${gauge}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
              <span>바나나 {gauge}%</span>
              <span>100% 충전</span>
            </div>
          </div>
        </div>

        {/* 미니언즈 말풍선 */}
        <div className="relative bg-white border-2 border-slate-900 rounded-2xl px-4 py-3 shadow-md max-w-[280px] text-center animate-bounce">
          <p className="text-xs font-black text-slate-900 leading-snug">{saying}</p>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-t-8 border-t-slate-900 border-x-8 border-x-transparent" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-t-8 border-t-white border-x-8 border-x-transparent" />
        </div>

        {/* 미니언즈 캐릭터 인터랙션 타겟 */}
        <div 
          onClick={handleMinionTap}
          className={`relative w-[200px] aspect-[1/1.2] cursor-pointer select-none transition-transform duration-100 ${
            isShaking ? "animate-wiggle scale-95" : "hover:scale-105 active:scale-95"
          }`}
        >
          {/* 가상 SVG 미니언즈 캐릭터 그래픽 */}
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)]">
            {/* 노란색 몸통 */}
            <rect x="25" y="15" width="50" height="75" rx="25" fill="#FBBF24" stroke="#1E293B" strokeWidth="3" />
            
            {/* 데님 멜빵바지 */}
            <path d="M25,65 L75,65 L75,90 C75,98 65,98 50,98 C35,98 25,98 25,90 Z" fill="#2563EB" stroke="#1E293B" strokeWidth="3" />
            <rect x="42" y="65" width="16" height="15" fill="#1D4ED8" stroke="#1E293B" strokeWidth="2" />
            {/* 멜빵 끈 */}
            <line x1="25" y1="50" x2="42" y2="65" stroke="#1E293B" strokeWidth="4" />
            <line x1="75" y1="50" x2="58" y2="65" stroke="#1E293B" strokeWidth="4" />

            {/* 고글 & 눈 */}
            <rect x="20" y="32" width="60" height="8" fill="#1E293B" />
            <circle cx="50" cy="36" r="14" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
            <circle cx="50" cy="36" r="10" fill="#FFFFFF" />
            <circle cx="50" cy="36" r="4" fill="#78350F" />
            <circle cx="48" cy="34" r="1.5" fill="#FFFFFF" /> {/* 눈동자 하이라이트 */}

            {/* 입 */}
            <path d="M42,52 Q50,58 58,52" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            
            {/* 머리카락 */}
            <path d="M45,15 Q43,8 41,15 M50,15 Q50,6 50,15 M55,15 Q57,8 59,15" stroke="#1E293B" strokeWidth="2.5" fill="none" />

            {/* 신발 */}
            <rect x="32" y="98" width="10" height="5" rx="2" fill="#1E293B" />
            <rect x="58" y="98" width="10" height="5" rx="2" fill="#1E293B" />
          </svg>

          {/* 탭 유도 핑거 배지 */}
          <div className="absolute bottom-12 right-2 bg-slate-900 text-white rounded-full p-2 text-[9px] font-black border border-white/20 shadow-md animate-ping pointer-events-none">
            TAP!
          </div>
        </div>

        {/* 보너스 리워드 버튼 */}
        <div className="w-full">
          <button
            onClick={handleClaimReward}
            disabled={gauge < 100 || claimed}
            className={`w-full rounded-xl py-3.5 text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-md ${
              gauge === 100 && !claimed
                ? "bg-slate-900 hover:bg-slate-950 active:scale-98 cursor-pointer"
                : claimed
                ? "bg-emerald-600 text-white cursor-not-allowed shadow-none"
                : "bg-amber-300 text-amber-700 cursor-not-allowed border border-amber-500/20 shadow-none"
            }`}
          >
            {claimed ? (
              <>
                <Sparkles size={14} />
                리워드 1,500P 지급 완료!
              </>
            ) : (
              <>
                <Trophy size={14} />
                보너스 1,500P 리워드 받기
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
