"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, MessageSquareCode, User, Gift, Menu } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleBookingClick = () => {
    router.push("/booking");
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-border-color bg-white/95 backdrop-blur-md py-2.5 shrink-0 select-none">
      <div className="flex justify-around items-end px-2 relative">
        
        {/* 1. 홈 */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive("/") ? "text-accent" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Home size={22} className={isActive("/") ? "scale-105" : ""} />
          <span className="text-[10px] font-bold">홈</span>
        </Link>

        {/* 2. 씨네톡 (레퍼런스) */}
        <button
          onClick={() => alert("1차 MVP 준비 중인 기능입니다.")}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <MessageSquareCode size={22} />
          <span className="text-[10px] font-bold">씨네톡</span>
        </button>

        {/* 3. 예매·예약 (중앙 거대 초록 원형 버튼) */}
        <div className="relative -top-4">
          <button
            onClick={handleBookingClick}
            className={`w-[66px] h-[66px] rounded-full bg-gradient-to-br from-[#05d975] to-accent text-white flex items-center justify-center font-black text-xs shadow-[0_8px_20px_rgba(3,199,90,0.35)] border-[4px] border-background hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          >
            예매·예약
          </button>
        </div>

        {/* 4. 매점 (레퍼런스) */}
        <button
          onClick={() => alert("1차 MVP 준비 중인 기능입니다.")}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <Gift size={22} />
          <span className="text-[10px] font-bold">매점</span>
        </button>

        {/* 5. 더보기 (마이페이지 연동) */}
        <Link
          href="/mypage"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive("/mypage") ? "text-accent" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Menu size={22} className={isActive("/mypage") ? "scale-105" : ""} />
          <span className="text-[10px] font-bold">더보기</span>
        </Link>

      </div>
    </nav>
  );
}
