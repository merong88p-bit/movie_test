import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "이메일 주소를 입력해 주세요." }, { status: 400 });
    }

    // Supabase에서 해당 이메일 회원 단건 조회
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "가입되지 않은 이메일입니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    console.error("Login API Supabase error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
