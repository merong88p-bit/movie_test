import { NextResponse } from "next/server";
import { getMovieTimetables } from "../../../services/tmdb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieIdStr = searchParams.get("movieId");
    const date = searchParams.get("date");

    if (!movieIdStr || !date) {
      return NextResponse.json({ success: false, message: "movieId와 date는 필수입니다." }, { status: 400 });
    }

    const movieId = parseInt(movieIdStr, 10);
    const timetables = getMovieTimetables(movieId, date);

    return NextResponse.json({ success: true, timetables });
  } catch (e) {
    console.error("Showtimes API error", e);
    return NextResponse.json({ success: false, message: "서버 오류" }, { status: 500 });
  }
}
