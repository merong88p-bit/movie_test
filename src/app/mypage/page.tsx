"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useBookingStore, Booking } from "../../store/bookingStore";
import { Search, Bell, Ticket, Gift, CreditCard, User, LogOut, Trash2, ChevronLeft, AlertCircle } from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { user, loading, logout, chargePoints } = useAuth();
  const { bookings, loadBookings, cancelBooking } = useBookingStore();
  
  // 마이페이지 서브화면: "list" (기본 마이페이지), "history" (예약/결제내역 리스트)
  const [subView, setSubView] = useState<"list" | "history">("list");

  useEffect(() => {
    if (loading) return; // 세션 복원 완료 대기

    if (!user) {
      router.replace("/login");
      return;
    }
    loadBookings(user.id);
  }, [user, loading, router, loadBookings]);

  // 해당 유저의 예약 목록 필터링
  const myBookings = bookings.filter((b) => b.userId === user?.id);

  const handleCancel = async (bookingId: string) => {
    if (confirm("정말로 예매를 취소하시겠습니까? 결제금액은 가상 포인트로 전액 환불되었습니다.")) {
      const res = await cancelBooking(bookingId);
      if (res.success) {
        alert("예매가 취소되었습니다. 결제 금액이 전액 환불되었습니다.");
        if (user) {
          // 결제 취소 후 포인트 동기화를 위해 잔액 리로드 호출
          chargePoints(0);
        }
      } else {
        alert("예매 취소 처리에 실패했습니다.");
      }
    }
  };

  const handleChargePoints = () => {
    chargePoints(50000);
    alert("50,000P 가상 포인트가 충전되었습니다!");
  };

  if (!user) return null;

  // 1. 기본 마이페이지 메인 리스트 뷰 (마이페이지.jpg 완벽 복제)
  if (subView === "list") {
    return (
      <div className="flex flex-col text-slate-800 min-h-full bg-white select-none">
        
        {/* 상단 툴 바 */}
        <header className="flex justify-end items-center px-4 py-3.5 space-x-5 text-slate-500 bg-white shrink-0">
          <button onClick={() => setSubView("history")} className="hover:text-accent transition-colors cursor-pointer">
            <Ticket size={20} />
          </button>
          <button onClick={() => alert("새로운 알림이 없습니다.")} className="hover:text-accent transition-colors cursor-pointer">
            <Bell size={20} />
          </button>
          <button onClick={() => alert("검색 기능은 준비 중입니다.")} className="hover:text-accent transition-colors cursor-pointer">
            <Search size={20} />
          </button>
        </header>

        {/* 유저 닉네임 & 게이지 바 */}
        <section className="px-5 py-3.5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-950">
                {user.nickname || "용감한납득이5754"} 님
              </h2>
              <button 
                onClick={() => alert("VIP 등급 승급 기준을 채우지 못했습니다.")}
                className="text-[10px] text-slate-400 font-extrabold flex items-center gap-0.5 hover:text-slate-600 cursor-pointer"
              >
                내 등급 보러 가기 &gt;
              </button>
            </div>
            
            {/* 회색 원형 프로필 */}
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 select-none">
              <User size={24} />
            </div>
          </div>

          {/* 등급 게이지 바 */}
          <div className="space-y-1.5">
            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-[2%] bg-accent" />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span className="bg-accent text-white px-1.5 py-[1px] rounded-xs font-black">0점</span>
              <span>10,000점</span>
            </div>
          </div>
        </section>

        {/* 포인트 및 보유 자산 (CJ ONE Point 카드) */}
        <section className="px-4 py-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500" />
                <span className="text-xs font-black text-slate-600">CJ ONE Point</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-slate-950">{user.points.toLocaleString()}P</span>
                <button
                  onClick={handleChargePoints}
                  className="rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[8px] font-black px-2 py-1 text-slate-600 cursor-pointer"
                >
                  무료 충전
                </button>
              </div>
            </div>

            {/* 4열 자산 정보 그리드 */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200/60 text-center select-none">
              <div className="space-y-1 cursor-pointer">
                <p className="text-sm font-black text-slate-950">8</p>
                <p className="text-[10px] text-slate-400 font-bold">쿠폰</p>
              </div>
              <div 
                onClick={() => setSubView("history")}
                className="space-y-1 cursor-pointer hover:opacity-80"
              >
                <p className="text-sm font-black text-accent">{myBookings.length}</p>
                <p className="text-[10px] text-slate-400 font-bold">관람/예매내역</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-950">0</p>
                <p className="text-[10px] text-slate-400 font-bold">기간횟수권</p>
              </div>
              <div className="space-y-1 flex flex-col items-center justify-center">
                <Gift size={16} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 font-bold mt-1">기프트카드</p>
              </div>
            </div>
          </div>
        </section>

        {/* 나의 정보 관리 메뉴 (2컬럼 그리드) */}
        <section className="px-4 py-5 space-y-4">
          <p className="text-[10px] font-black text-slate-500 tracking-wider">나의 정보 관리</p>
          
          <div className="grid grid-cols-2 gap-y-4.5 gap-x-6 text-xs font-bold text-slate-600">
            <button onClick={() => alert("현재 관람 내역이 없습니다.")} className="text-left hover:text-slate-900 cursor-pointer">내가 본 영화</button>
            <button onClick={() => alert("준비 중인 기능입니다.")} className="text-left hover:text-slate-900 cursor-pointer">보관함</button>
            
            <button onClick={() => alert("준비 중인 기능입니다.")} className="text-left hover:text-slate-900 cursor-pointer">스마트결제관리</button>
            <button 
              onClick={() => setSubView("history")} 
              className="text-left hover:text-slate-900 cursor-pointer text-accent font-black"
            >
              예약/결제내역 &gt;
            </button>
            
            <button onClick={() => alert("준비 중인 기능입니다.")} className="text-left hover:text-slate-900 cursor-pointer">내 차량번호 조회</button>
            <button onClick={() => alert("준비 중인 기능입니다.")} className="text-left hover:text-slate-900 cursor-pointer">자주가는 다인씨네마</button>
          </div>
        </section>

        {/* 로그아웃 */}
        <section className="px-4 py-8 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors font-bold cursor-pointer"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </section>

      </div>
    );
  }

  // 2. 예약/결제내역 서브화면 뷰 (예약/결제 내역 관리)
  return (
    <div className="flex flex-col text-slate-100 min-h-full bg-slate-900 select-none">
      
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3.5 border-b border-slate-950 bg-slate-950 shrink-0">
        <button 
          onClick={() => setSubView("list")} 
          className="text-slate-400 hover:text-white mr-6 cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-sm font-black text-white flex-1">예약/결제내역</span>
      </header>

      {/* 예매 예약 목록 */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar">
        {myBookings.length > 0 ? (
          myBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-slate-950 border border-slate-800/80 p-4 space-y-3.5 shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    가상 결제완료
                  </span>
                  <h4 className="text-base font-black text-white mt-1.5">{b.movieTitle}</h4>
                </div>
                
                {/* 예매 취소 버튼 */}
                <button
                  onClick={() => handleCancel(b.id)}
                  className="p-2 text-slate-500 hover:text-red-500 border border-transparent hover:border-slate-800 rounded-lg hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-semibold space-y-1 pt-1.5 border-t border-slate-900">
                <p>📍 {b.theater} • 5관 2D</p>
                <p>📅 {b.date} • {b.time}</p>
                <p className="text-accent font-black">🎟️ {b.seats.join(", ")}</p>
                <p className="text-white font-extrabold mt-1">{b.totalPrice.toLocaleString()}원 결제</p>
              </div>

              {/* 모바일 티켓 즉시 확인 버튼 */}
              <button
                onClick={() => router.push(`/booking/success/${b.id}`)}
                className="w-full text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 py-2.5 transition-colors border border-slate-800 mt-1 cursor-pointer"
              >
                모바일 티켓 바로보기
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center space-y-2">
            <AlertCircle size={32} className="opacity-30 mb-1" />
            <h4 className="text-xs font-black text-slate-400">예약 및 결제 내역이 없습니다.</h4>
            <p className="text-[10px] text-slate-600">상단의 예매하기 버튼을 통해 극장표를 결제할 수 있습니다.</p>
          </div>
        )}
      </div>

    </div>
  );
}
