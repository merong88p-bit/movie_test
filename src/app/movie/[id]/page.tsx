"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Movie, getMovieDetails, getMovieImageUrl } from "../../../services/tmdb";
import { useBookingStore } from "../../../store/bookingStore";
import { ArrowLeft, Star, Calendar, Clock, Film, Users, Ticket } from "lucide-react";

export default function MovieDetailPage() {
  const router = useRouter();
  const params = useParams();
  const movieId = Number(params.id);
  const setSelectedMovie = useBookingStore((state) => state.setMovie);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(movieId)) return;

    const loadDetail = async () => {
      setLoading(true);
      const detail = await getMovieDetails(movieId);
      setMovie(detail);
      setLoading(false);
    };

    loadDetail();
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-accent" />
        <p className="text-sm text-slate-400 font-medium">영화 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-slate-400 text-sm">영화 정보를 찾을 수 없습니다.</p>
        <Link href="/" className="rounded-2xl bg-accent text-white px-5 py-2.5 text-xs font-bold">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const handleBooking = () => {
    setSelectedMovie(movie);
    router.push("/booking");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 뒤로가기 버튼 */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-slate-800 p-2.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-slate-400 font-semibold">영화 상세 정보</span>
      </div>

      {/* 영화 디테일 컨테이너 */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* 백드롭 흐림 배경 */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getMovieImageUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        {/* 좌측: 포스터 */}
        <div className="relative z-10 w-full md:w-[350px] aspect-[2/3] md:aspect-auto md:min-h-full bg-slate-950/60 border-r border-slate-800/80">
          <Image
            src={getMovieImageUrl(movie.poster_path, "original")}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t md:hidden from-slate-900 via-slate-900/30 to-transparent" />
        </div>

        {/* 우측: 디테일 텍스트 */}
        <div className="relative z-10 flex-1 p-6 md:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            {/* 타이틀 */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{movie.title}</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1 italic font-semibold">{movie.original_title}</p>
            </div>

            {/* 평점 / 장르 등 메타 스펙 */}
            <div className="flex flex-wrap gap-3 items-center text-xs md:text-sm text-slate-300">
              <div className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                <Star size={14} className="fill-amber-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
              {movie.release_date && (
                <div className="flex items-center space-x-1">
                  <Calendar size={14} className="text-slate-500" />
                  <span>{movie.release_date} 개봉</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} className="text-slate-500" />
                  <span>{movie.runtime}분</span>
                </div>
              )}
            </div>

            {/* 장르 태그 */}
            {movie.genres && (
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-slate-800 border border-slate-700 px-3 py-0.5 text-xs text-slate-300 font-semibold"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* 시놉시스 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">줄거리</h3>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                {movie.overview || "등록된 영화 설명이 존재하지 않습니다."}
              </p>
            </div>

            {/* 감독 / 캐스트 */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Film size={12} />
                  감독
                </h4>
                <p className="text-sm text-slate-300 font-extrabold">{movie.director || "정보 없음"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Users size={12} />
                  주요 출연진
                </h4>
                <p className="text-sm text-slate-300 font-extrabold truncate">
                  {movie.cast && movie.cast.length > 0 ? movie.cast.join(", ") : "정보 없음"}
                </p>
              </div>
            </div>
          </div>

          {/* 예매 트리거 버튼 */}
          <div className="pt-8">
            <button
              onClick={handleBooking}
              className="w-full md:w-auto rounded-2xl bg-accent hover:bg-accent-hover text-white py-4 px-8 font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/25 cursor-pointer"
            >
              <Ticket size={20} />
              이 영화 예매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
