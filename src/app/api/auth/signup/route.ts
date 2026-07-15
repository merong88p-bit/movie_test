import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { User } from "../../../../context/AuthContext";

export async function POST(request: Request) {
  try {
    const { email, nickname } = await request.json();

    if (!email || !nickname) {
      return NextResponse.json({ success: false, message: "이메일과 닉네임은 필수입니다." }, { status: 400 });
    }

    // 1. 중복 가입 체크
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json({ success: false, message: "이미 가입된 이메일입니다." }, { status: 400 });
    }

    // 2. 신규 유저 생성 DTO
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email,
      nickname,
      points: 50000, // 회원가입 기본 포인트
    };

    // 3. Supabase INSERT 실행
    const { error: insertUserError } = await supabase
      .from("users")
      .insert(newUser);

    if (insertUserError) {
      throw insertUserError;
    }

    // 4. 가입 보상 포인트 기록
    const { error: insertHistoryError } = await supabase
      .from("point_histories")
      .insert({
        user_id: newUser.id,
        amount: 50000,
        type: "CHARGE",
        description: "회원가입 축하 혜택"
      });

    if (insertHistoryError) {
      console.warn("Failed to insert initial point history log", insertHistoryError);
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (e: any) {
    console.error("Signup API Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
