"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "../../../store/bookingStore";
import { useAuth } from "../../../context/AuthContext";
import { getMovieImageUrl } from "../../../services/tmdb";
import { ChevronLeft, ChevronRight, Search, CreditCard, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function BookingPaymentPage() {
  const router = useRouter();
  const { user, loading, chargePoints } = useAuth();
  
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedTime,
    addBooking,
    clearSelection
  } = useBookingStore();

  // 임시 결제 상세 상태 (좌석 선택 페이지에서 넘어옴)
  const [paymentData, setPaymentData] = useState<{
    seats: string[];
    price: number;
    adult: number;
    youth: number;
  } | null>(null);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (loading) return; // 세션 복원 완료 대기

    if (!selectedMovie || !selectedTheater || !selectedDate || !selectedTime) {
      router.replace("/booking");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    // 로컬 스토리지에서 결제 데이터 조회
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mv_temp_payment");
      if (saved) {
        try {
          setPaymentData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse payment data", e);
        }
      }
    }
  }, [selectedMovie, selectedTheater, selectedDate, selectedTime, user, loading, router]);

  const handleExecutePayment = async () => {
    if (!user || !selectedMovie || !selectedTheater || !selectedDate || !selectedTime || !paymentData) return;

    setPaymentError("");
    setIsPaying(true);

    try {
      // 백엔드 통합 예매 및 결제 API 호출
      const booking = await addBooking(
        user.id,
        selectedMovie,
        selectedTheater,
        selectedDate,
        selectedTime,
        paymentData.seats,
        paymentData.price
      );

      if (!booking) {
        setPaymentError("가상 포인트 잔액이 부족하거나, 이미 예약된 좌석입니다. 상태를 확인해 주세요.");
        setIsPaying(false);
        return;
      }

      // 내 포인트 정보 동기화 새로고침
      await chargePoints(0);

      // 폭죽 성공 애니메이션
      confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.6 }
      });

      // 임시 스토리지 청소
      localStorage.removeItem("mv_temp_personnel");
      localStorage.removeItem("mv_temp_payment");

      setIsPaying(false);
      
      // 성공 완료 페이지로 이동
      router.replace(`/booking/success/${booking.id}`);
    } catch (e) {
      setPaymentError("결제 통신 중 에러가 발생했습니다.");
      setIsPaying(false);
    }
  };

  const handleCharge = () => {
    chargePoints(50000);
    setPaymentError("");
  };

  if (!selectedMovie || !user || !paymentData) return null;

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 select-none">
      
      {/* 1. 상단 뒤로가기 헤더 (결제창1.jpg 복제) */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white shrink-0">
        <button 
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 font-black text-sm"
        >
          <ChevronLeft size={20} />
          결제
        </button>
        <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
          📍 {selectedTheater}
        </span>
      </header>

      {/* 2. 하얀색 배경의 결제 정보 바디 (결제창1.jpg 모방) */}
      <section className="flex-1 bg-slate-50 text-slate-900 rounded-t-[32px] p-5 flex flex-col space-y-4 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] border-t border-slate-100 overflow-y-auto no-scrollbar">
        
        {/* 상품정보 및 할인쿠폰 (아코디언) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <span className="text-xs font-black text-slate-950">상품정보 및 할인쿠폰</span>
            <span className="text-[10px] text-slate-400 font-bold">&or;</span>
          </div>

          <div className="flex gap-3">
            <div className="relative w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-950">
              <Image
                src={getMovieImageUrl(selectedMovie.poster_path)}
                alt={selectedMovie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-sm font-black text-slate-950 truncate">{selectedMovie.title}</h4>
              <p className="text-xs text-slate-500 font-extrabold mt-1">
                {paymentData.price.toLocaleString()}원
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {paymentData.seats.join(", ")} • 일반 {paymentData.adult}명, 청소년 {paymentData.youth}명
              </p>
            </div>
          </div>

          {/* 할인쿠폰 링크 */}
          <button 
            onClick={() => alert("1차 MVP 가상 결제는 할인쿠폰을 지원하지 않습니다.")}
            className="w-full flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-slate-100/50 cursor-pointer"
          >
            <span>할인쿠폰을 선택해 주세요</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>

        {/* 멤버십/관람권/제휴 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-xs">
          <div className="flex justify-between items-center text-xs font-black text-slate-950">
            <span>멤버십/관람권/제휴</span>
          </div>
          
          <button 
            onClick={() => alert("1차 MVP 준비 중인 결제 수단입니다.")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-950 text-left py-1 cursor-pointer"
          >
            <span>CGV영화관람권/기프트콘</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          
          <button 
            onClick={() => alert("1차 MVP 준비 중인 결제 수단입니다.")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-950 text-left py-1 cursor-pointer"
          >
            <span>CGV기간권/횟수권</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* 적용 가능한 멤버십 확인 버튼 */}
          <button 
            onClick={() => alert("조회 결과가 없습니다.")}
            className="w-full flex items-center justify-center gap-1.5 p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50/50 mt-2.5 cursor-pointer"
          >
            <Search size={14} />
            적용 가능한 멤버십/관람권/제휴 확인
          </button>
        </div>

        {/* 보유 가상 포인트 계정 (가상 결제 수단) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <CreditCard size={16} className="text-amber-500" />
            <span className="text-xs font-black text-slate-950">가상 포인트 간편 결제</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">내 보유 가상 포인트</span>
            <div className="text-right">
              <span className="font-black text-slate-950 text-sm">
                {user.points.toLocaleString()} P
              </span>
              {user.points < paymentData.price && (
                <p className="text-[9px] font-bold text-red-500 mt-1">
                  잔액이 {(paymentData.price - user.points).toLocaleString()}P 부족합니다.
                </p>
              )}
            </div>
          </div>

          {/* 충전 및 에러 표시 */}
          {user.points < paymentData.price && (
            <button
              onClick={handleCharge}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className="animate-spin" />
              50,000P 즉시 가상 충전하기
            </button>
          )}

          {paymentError && (
            <div className="rounded-xl bg-red-50/80 border border-red-200 p-3 text-[10px] text-red-600 flex items-start gap-1.5 font-bold animate-fadeIn">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}
        </div>

      </section>

      {/* 3. 최하단 최종 결제완료 액션 바 (결제창1.jpg 하단 버튼 복제) */}
      <footer className="bg-white p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={handleExecutePayment}
          disabled={isPaying}
          className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white py-3.5 text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-accent/20"
        >
          {isPaying ? (
            <>
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              가상 결제 처리 중...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              {paymentData.price.toLocaleString()}원 결제하기
            </>
          )}
        </button>
      </footer>

    </div>
  );
}
