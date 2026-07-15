"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBookingStore, Booking } from "../../../../store/bookingStore";
import { useAuth } from "../../../../context/AuthContext";
import { getMovieImageUrl } from "../../../../services/tmdb";
import { ChevronLeft, Home, QrCode, RefreshCw, AlertCircle, Sparkles, MapPin, Calendar, Clock, Ticket } from "lucide-react";

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { user } = useAuth();
  const { bookings, loadBookings } = useBookingStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState("전체");

  useEffect(() => {
    if (user) {
      loadBookings(user.id);
    }
  }, [loadBookings, user]);

  useEffect(() => {
    if (bookingId && bookings.length > 0) {
      const found = bookings.find((b) => b.id === bookingId);
      if (found) {
        setBooking(found);
      }
    }
  }, [bookingId, bookings]);

  // 티켓이 없거나 비정상 데이터일 때 예외 렌더러 (티켓창.jpg 복제)
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col min-h-full bg-slate-900 text-white select-none">
        {/* 헤더 */}
        <header className="flex items-center px-4 py-3.5 border-b border-slate-950 bg-slate-950 shrink-0">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white mr-4 cursor-pointer">
            <ChevronLeft size={22} />
          </button>
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white mr-6 cursor-pointer">
            <Home size={20} />
          </button>
          <span className="text-sm font-black text-white flex-1 text-center pr-12">모바일 티켓</span>
        </header>

        {/* 탭바 */}
        <section className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-slate-950 shrink-0 border-b border-slate-900">
          {["전체", "시네마 0", "매점 0", "포토플레이 0"].map((tab) => (
            <span
              key={tab}
              className={`rounded-full px-3.5 py-1 text-xs font-bold shrink-0 ${
                tab === "전체" ? "bg-white text-slate-950" : "bg-slate-900 text-slate-500"
              }`}
            >
              {tab}
            </span>
          ))}
        </section>

        {/* 빈 예외 화면 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
          {/* 가상 팝콘 캐릭터 장식 (SVG 렌더링) */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/10 rounded-full blur-2xl absolute" />
            <svg viewBox="0 0 100 100" className="w-28 h-28 text-slate-500 fill-current opacity-80">
              {/* 캐릭터 구름 머리 */}
              <path d="M50,20 C58,20 64,25 65,31 C72,32 77,37 77,44 C77,51 72,56 65,57 C64,63 58,68 50,68 C42,68 36,63 35,57 C28,56 23,51 23,44 C23,37 28,32 35,31 C36,25 42,20 50,20 Z" />
              {/* 캐릭터 몸뚱이 */}
              <rect x="42" y="60" width="16" height="18" rx="4" />
              {/* 발 */}
              <circle cx="44" cy="80" r="3" />
              <circle cx="56" cy="80" r="3" />
              {/* 얼굴 표정 */}
              <circle cx="42" cy="40" r="2.5" className="text-slate-950 fill-current" />
              <circle cx="58" cy="40" r="2.5" className="text-slate-950 fill-current" />
              <path d="M47,48 Q50,51 53,48" stroke="black" strokeWidth="2" fill="none" />
              {/* 3D 안경 */}
              <rect x="33" y="34" width="34" height="6" rx="2" className="text-red-500 fill-current" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-slate-300">예매하신 모바일 티켓이 없습니다.</h3>
            <p className="text-[10px] text-slate-500">지금 바로 예매 가능한 영화를 확인해 보세요!</p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-black px-6 py-2.5 shadow-md shadow-accent/20 cursor-pointer"
          >
            영화 보러 가기
          </button>
        </div>
      </div>
    );
  };

  if (!booking) {
    return renderEmptyState();
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-900 text-white select-none">
      
      {/* 1. 상단 모바일 티켓 헤더 */}
      <header className="flex items-center px-4 py-3.5 border-b border-slate-950 bg-slate-950 shrink-0">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white mr-4 cursor-pointer">
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white mr-6 cursor-pointer">
          <Home size={20} />
        </button>
        <span className="text-sm font-black text-white flex-1 text-center pr-12">모바일 티켓</span>
      </header>

      {/* 2. 탭 리스트 */}
      <section className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-slate-950 shrink-0 border-b border-slate-900">
        {["전체", "시네마 1", "매점 0", "포토플레이 0"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3.5 py-1 text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              tab.startsWith("전체") || tab.startsWith("시네마")
                ? "bg-white text-slate-950"
                : "bg-slate-900 text-slate-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* 3. 모바일 티켓 세부 카드 (CGV 디자인 실재 렌더링) */}
      <div className="flex-1 p-5 overflow-y-auto no-scrollbar flex flex-col items-center justify-start space-y-6">
        
        {/* 티켓 박스 */}
        <div className="w-full rounded-[24px] bg-slate-950 border border-slate-800 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden relative">
          
          {/* 티켓 컷아웃 데코레이션 */}
          <div className="absolute top-[48%] -left-3 w-6 h-6 rounded-full bg-slate-900 border-r border-slate-800 z-10" />
          <div className="absolute top-[48%] -right-3 w-6 h-6 rounded-full bg-slate-900 border-l border-slate-800 z-10" />

          {/* 상단: 영화 썸네일 & 극장 정보 */}
          <div className="relative p-5 border-b border-dashed border-slate-800 flex gap-4 bg-slate-950/40">
            <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
              <Image
                src={getMovieImageUrl(booking.moviePoster)}
                alt={booking.movieTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="rounded bg-accent/15 border border-accent/25 px-2 py-0.5 text-[9px] font-black text-accent w-fit uppercase tracking-wider">
                Confirmed Ticket
              </span>
              <h3 className="text-base font-black text-white truncate mt-2">{booking.movieTitle}</h3>
              <p className="text-xs text-slate-400 font-extrabold mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-600" />
                {booking.theater}
              </p>
            </div>
          </div>

          {/* 중간: 일시 및 좌석 2컬럼 레이아웃 */}
          <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-2 text-xs border-b border-dashed border-slate-800 bg-slate-950/20">
            <div>
              <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">예매 번호</p>
              <p className="text-white font-extrabold mt-1">{booking.id}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">결제 상태</p>
              <p className="text-amber-500 font-extrabold mt-1">포인트 결제완료</p>
            </div>

            <div className="flex gap-1.5 items-start mt-2">
              <Calendar size={14} className="text-slate-500 mt-0.5" />
              <div>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">관람일</p>
                <p className="text-white font-bold mt-0.5">{booking.date}</p>
              </div>
            </div>
            <div className="flex gap-1.5 items-start mt-2">
              <Clock size={14} className="text-slate-500 mt-0.5" />
              <div>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">상영 시간</p>
                <p className="text-white font-bold mt-0.5">{booking.time} ~ 상영관 5관</p>
              </div>
            </div>

            <div className="col-span-2 border-t border-slate-900 pt-4 mt-2 flex gap-1.5 items-start">
              <Ticket size={14} className="text-slate-500 mt-0.5" />
              <div>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">관람 좌석</p>
                <p className="text-accent font-black text-sm mt-0.5">{booking.seats.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* 하단: 바코드 대신 QR 검표 렌더러 */}
          <div className="p-5 bg-slate-950/70 flex flex-col items-center justify-center space-y-3.5 select-none">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-800 shadow-md">
              <QrCode size={110} className="text-slate-950" />
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-xs font-black text-white">모바일 입장용 가상 QR</p>
              <p className="text-[9px] text-slate-500">입장 게이트의 스캐너에 QR 코드를 대어 주세요.</p>
            </div>
          </div>

        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex gap-3 w-full shrink-0">
          <Link
            href="/"
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 py-3 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            홈으로 이동
          </Link>
          <Link
            href="/mypage"
            className="flex-1 rounded-xl bg-accent hover:bg-accent-hover py-3 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-accent/25"
          >
            마이페이지 확인
          </Link>
        </div>

      </div>

    </div>
  );
}
