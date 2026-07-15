import { NextResponse } from "next/server";
import { MOCK_MOVIES } from "../../../services/tmdb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "chart";

    let data = MOCK_MOVIES;

    if (tab === "now") {
      // 호프, 스파이더맨, 파묘
      data = [MOCK_MOVIES[0], MOCK_MOVIES[1], MOCK_MOVIES[3]];
    } else if (tab === "chart") {
      // 호프, 스파이더맨, 모아나 2
      data = [MOCK_MOVIES[0], MOCK_MOVIES[1], MOCK_MOVIES[2]];
    } else if (tab === "upcoming") {
      // 모아나 2, 호프, 스파이더맨
      data = [MOCK_MOVIES[2], MOCK_MOVIES[0], MOCK_MOVIES[1]];
    }

    return NextResponse.json({ success: true, movies: data });
  } catch (e) {
    return NextResponse.json({ success: false, message: "서버 오류" }, { status: 500 });
  }
}
