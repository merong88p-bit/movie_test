import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { userId, messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: "messages 배열이 누락되었습니다." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey.includes("placeholder")) {
      return NextResponse.json({ 
        success: false, 
        message: "Groq API Key가 서버에 설정되어 있지 않습니다. 프로젝트 루트의 .env 파일에 키를 올바르게 채워 주세요!" 
      }, { status: 500 });
    }

    // 1. Supabase에서 실시간 유저 정보 및 예매 현황 수집 (RAG)
    let userContext = "로그인 정보 없음";
    let bookingContext = "예매 내역 없음";

    if (userId) {
      // 유저 정보 조회
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (user) {
        userContext = `닉네임: ${user.nickname}, 보유 포인트: ${user.points}P`;
      }

      // 예매 정보 조회
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "reserved");

      if (bookings && bookings.length > 0) {
        bookingContext = bookings.map((b: any, index: number) => {
          return `[예매 ${index + 1}] 예매번호: ${b.id}, 영화: ${b.movie_title}, 극장/상영관: ${b.theater}, 날짜: ${b.date}, 시간: ${b.time}, 좌석: ${b.seats.join(", ")}, 결제금액: ${b.total_price}P`;
        }).join("\n");
      }
    }

    // 2. LLM의 상담 지침 프롬프트 설계 (System Prompt)
    const systemPrompt = {
      role: "system",
      content: `당신은 다인씨네마 영화 예매 사이트 'MovieVerse'의 유능하고 다정한 인공지능 비서 'AI 씨네톡'입니다.
다음 지침에 맞춰서 사용자의 물음에 친절하게 답변해 주세요:

1. 답변 톤앤매너:
   - 친절하고, 활기차며 이모티콘(🍿, 🎬, 🎟️, ✨ 등)을 적절히 섞어 씁니다.
   - 예쁜 한글 구어체를 사용합니다. ("~해 드릴게요!", "~랍니다!")
   
2. 소비자 개인화 정보 (실시간 데이터베이스 기반):
   - 현재 대화 중인 사용자 정보: ${userContext}
   - 사용자의 현재 예매 내역:
     ${bookingContext}
   
3. 영화 예매 서비스 기능 가이드:
   - 포인트 충전: 마이페이지(더보기 탭)에 진입해서 50,000P씩 무료 충전이 가능함을 적극 알려주세요.
   - 상영 영화: 현재 극장에 '호프(IMAX/4DX)', '스파이더맨(2D)', '모아나 2(2D)', '파묘(2D)' 등이 예매 가동 중입니다.
   - 좌석 예매: 중앙의 거대한 '예매·예약' 초록 버튼을 통해 실시간 예매할 수 있음을 가이드해 주세요.
   - 스탬프 클럽: 특별관(IMAX, 4DX, SCREENX) 예매 내역에 따라 도장이 쾅 찍히며, 3개를 채우면 20,000P를 적립받을 수 있는 특별관 멤버십 서비스가 홈 혜택 탭에 가동 중임을 홍보해 주세요.

4. 제약 사항:
   - 사용자가 본인의 포인트나 예약에 대해 물어보면, 위의 개인화 정보를 토대로 100% 팩트에 기반해 정확하게 알려주어야 합니다.
   - 이 데이터에 존재하지 않는 가짜 티켓을 지어내어 설명하면 안 됩니다.`
    };

    // 3. Groq completions API 비동기 호출
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API request failed", errText);
      return NextResponse.json({ success: false, message: "Groq 인공지능 응답을 받아오는데 실패했습니다." }, { status: 500 });
    }

    const resData = await response.json();
    const aiMessage = resData.choices?.[0]?.message;

    return NextResponse.json({ success: true, choice: aiMessage });
  } catch (e: any) {
    console.error("Chat API error", e);
    return NextResponse.json({ success: false, message: e.message || "서버 통신 실패" }, { status: 500 });
  }
}
