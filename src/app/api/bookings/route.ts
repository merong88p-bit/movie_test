import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { Booking } from "../../../store/bookingStore";

// 내 예매 내역 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId가 필요합니다." }, { status: 400 });
    }

    // Supabase에서 내 예매 내역 전부 쿼리
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // TypeScript 타입 보정을 위해 DTO 포맷 구조화
    const formattedBookings: Booking[] = (bookings || []).map((b: any) => ({
      id: b.id,
      userId: b.user_id,
      movieId: b.movie_id,
      movieTitle: b.movie_title,
      moviePoster: b.movie_poster,
      theater: b.theater,
      date: b.date,
      time: b.time,
      seats: b.seats,
      totalPrice: b.total_price,
      status: b.status,
      createdAt: b.created_at
    }));

    return NextResponse.json({ success: true, bookings: formattedBookings });
  } catch (e: any) {
    console.error("Bookings GET Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류" }, { status: 500 });
  }
}

// 신규 예매 등록 및 결제
export async function POST(request: Request) {
  try {
    const { 
      userId, 
      movieId, 
      movieTitle, 
      moviePoster, 
      theater, 
      date, 
      time, 
      seats, 
      totalPrice 
    } = await request.json();

    if (!userId || !movieId || !seats || seats.length === 0 || !totalPrice) {
      return NextResponse.json({ success: false, message: "필수 예매 인자가 부족합니다." }, { status: 400 });
    }

    // 1. 유저 계정 확인 및 포인트 잔액 검증
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "유저 정보가 존재하지 않습니다." }, { status: 404 });
    }

    if (user.points < totalPrice) {
      return NextResponse.json({ success: false, message: "가상 포인트 잔액이 부족합니다." }, { status: 400 });
    }

    // 2. 동시성 좌석 중복 점유 검증 (Race Condition 방지)
    const { data: activeBookings, error: bookingError } = await supabase
      .from("bookings")
      .select("seats")
      .eq("movie_id", movieId)
      .eq("theater", theater)
      .eq("date", date)
      .eq("time", time)
      .eq("status", "reserved");

    if (bookingError) throw bookingError;

    const alreadyReservedSeats = (activeBookings || []).reduce<string[]>((acc, b: any) => [...acc, ...b.seats], []);
    const hasOverlap = seats.some((s: string) => alreadyReservedSeats.includes(s));

    if (hasOverlap) {
      return NextResponse.json({ 
        success: false, 
        message: "선택하신 좌석 중 일부가 이미 그 사이에 다른 사람에게 예약되었습니다. 좌석을 다시 선택해 주세요!" 
      }, { status: 400 });
    }

    // 3. 포인트 차감
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ points: user.points - totalPrice })
      .eq("id", userId);

    if (userUpdateError) throw userUpdateError;

    // 예매 번호 조합: MV-YYYYMMDD-Random
    const bookingId = "MV-" + new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 8) + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const newBooking = {
      id: bookingId,
      user_id: userId,
      movie_id: movieId,
      movie_title: movieTitle,
      movie_poster: moviePoster,
      theater,
      date,
      time,
      seats,
      total_price: totalPrice,
      status: "reserved"
    };

    // 4. 예매 정보 생성
    const { data: insertedBooking, error: insertError } = await supabase
      .from("bookings")
      .insert(newBooking)
      .select("*")
      .single();

    if (insertError) {
      // 롤백: 포인트 복원
      await supabase.from("users").update({ points: user.points }).eq("id", userId);
      throw insertError;
    }

    // 5. 포인트 결제 내역 기록
    const { error: historyError } = await supabase
      .from("point_histories")
      .insert({
        user_id: userId,
        amount: -totalPrice,
        type: "DEDUCT",
        description: `${movieTitle} 예매 결제 (${seats.join(", ")})`
      });

    if (historyError) {
      console.warn("Failed to record point history", historyError);
    }

    const formattedBooking: Booking = {
      id: insertedBooking.id,
      userId: insertedBooking.user_id,
      movieId: insertedBooking.movie_id,
      movieTitle: insertedBooking.movie_title,
      moviePoster: insertedBooking.movie_poster,
      theater: insertedBooking.theater,
      date: insertedBooking.date,
      time: insertedBooking.time,
      seats: insertedBooking.seats,
      totalPrice: insertedBooking.total_price,
      status: insertedBooking.status,
      createdAt: insertedBooking.created_at
    };

    return NextResponse.json({ success: true, booking: formattedBooking });
  } catch (e: any) {
    console.error("Booking Create API Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 예매 취소 및 전액 환불
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ success: false, message: "bookingId가 필요합니다." }, { status: 400 });
    }

    // 1. 기존 예매 상태 상세 쿼리
    const { data: booking, error: getError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (getError || !booking) {
      return NextResponse.json({ success: false, message: "예매 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ success: false, message: "이미 취소된 예매 내역입니다." }, { status: 400 });
    }

    // 2. 예매 상태 취소 변경
    const { error: cancelError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (cancelError) throw cancelError;

    // 3. 포인트 환원 및 환불 로그
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("points")
      .eq("id", booking.user_id)
      .maybeSingle();

    if (userError) throw userError;

    let updatedUser = null;
    if (user) {
      const { data: newUser, error: userRefundError } = await supabase
        .from("users")
        .update({ points: user.points + booking.total_price })
        .eq("id", booking.user_id)
        .select("*")
        .single();

      if (userRefundError) throw userRefundError;
      updatedUser = newUser;

      // 환불 거래 내역 기록
      await supabase.from("point_histories").insert({
        user_id: booking.user_id,
        amount: booking.total_price,
        type: "REFUND",
        description: `${booking.movie_title} 예매 취소 환불`
      });
    }

    return NextResponse.json({ success: true, refundedPrice: booking.total_price, user: updatedUser });
  } catch (e: any) {
    console.error("Booking Cancel API Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류" }, { status: 500 });
  }
}
