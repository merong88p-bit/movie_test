"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Movie, getMovieImageUrl } from "../services/tmdb";
import { useBookingStore } from "../store/bookingStore";
import { Star, Ticket, Info } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onOpenDetail?: (id: number) => void;
}

export default function MovieCard({ movie, onOpenDetail }: MovieCardProps) {
  const router = useRouter();
  const setMovie = useBookingStore((state) => state.setMovie);

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMovie(movie);
    router.push("/booking");
  };

  const handleDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenDetail) {
      onOpenDetail(movie.id);
    } else {
      router.push(`/movie/${movie.id}`);
    }
  };

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card-bg border border-border-color/50 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-700 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer"
      onClick={handleDetail}
    >
      {/* 포스터 영역 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <Image
          src={getMovieImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={movie.id === 1022789} // 인사이드 아웃2 등 메인작 우선 로딩
        />
        
        {/* 그래디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* 평점 배지 (좌측 상단) */}
        <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-lg bg-slate-900/80 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-sm border border-white/5">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>

        {/* 호버 오버레이 버튼 (데스크톱 전용) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/80 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden sm:flex">
          <button
            onClick={handleBooking}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20"
          >
            <Ticket size={14} />
            즉시 예매
          </button>
          <button
            onClick={handleDetail}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Info size={14} />
            상세 정보
          </button>
        </div>
      </div>

      {/* 영화 정보 영역 */}
      <div className="flex flex-col p-4 flex-1">
        <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{movie.release_date.split("-")[0]} 개봉</span>
          {movie.genres && movie.genres.length > 0 && (
            <span className="truncate max-w-[60%] text-slate-500 font-medium">
              {movie.genres[0]}
            </span>
          )}
        </div>

        {/* 모바일 화면 대응용 빠른 예매 버튼 */}
        <div className="mt-3 flex space-x-2 sm:hidden">
          <button
            onClick={handleBooking}
            className="flex-1 rounded-lg bg-accent/20 border border-accent/30 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-1"
          >
            <Ticket size={12} />
            예매
          </button>
          <button
            onClick={handleDetail}
            className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700/60 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-1"
          >
            상세
          </button>
        </div>
      </div>
    </div>
  );
}
