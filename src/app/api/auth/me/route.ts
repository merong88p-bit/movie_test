import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

// 유저 프로필 및 실시간 자산 정보 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "유저 ID가 누락되었습니다." }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ success: false, message: "유저를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "서버 오류" }, { status: 500 });
  }
}

// 포인트 충전 및 차감 반영
export async function POST(request: Request) {
  try {
    const { userId, amount, type, description } = await request.json();

    if (!userId || amount === undefined || !type) {
      return NextResponse.json({ success: false, message: "필수 인자가 누락되었습니다." }, { status: 400 });
    }

    // 1. 유저 정보 단건 락(조회)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("points")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "유저를 찾을 수 없습니다." }, { status: 404 });
    }

    let nextPoints = user.points;
    if (type === "CHARGE") {
      nextPoints += amount;
    } else if (type === "DEDUCT") {
      if (nextPoints < amount) {
        return NextResponse.json({ success: false, message: "포인트 잔액이 부족합니다." }, { status: 400 });
      }
      nextPoints -= amount;
    }

    // 2. 포인트 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ points: nextPoints })
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // 3. 거래 내역 로그 기록
    const { error: historyError } = await supabase
      .from("point_histories")
      .insert({
        user_id: userId,
        amount: type === "CHARGE" ? amount : -amount,
        type,
        description: description || "포인트 변동"
      });

    if (historyError) {
      console.warn("Failed to record point history", historyError);
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (e: any) {
    console.error("User me API Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류" }, { status: 500 });
  }
}
