"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Movie, getMovieDetails, getMovieImageUrl } from "../services/tmdb";
import { useBookingStore } from "../store/bookingStore";
import { X, Star, Calendar, Clock, Film, Users, Ticket } from "lucide-react";

interface MovieDetailModalProps {
  movieId: number | null;
  onClose: () => void;
}

export default function MovieDetailModal({ movieId, onClose }: MovieDetailModalProps) {
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const setSelectedMovie = useBookingStore((state) => state.setMovie);

  useEffect(() => {
    if (!movieId) return;

    const loadDetail = async () => {
      setLoading(true);
      const detail = await getMovieDetails(movieId);
      setMovie(detail);
      setLoading(false);
    };

    loadDetail();
  }, [movieId]);

  // ESC 키 클릭 시 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!movieId) return null;

  const handleBooking = () => {
    if (movie) {
      setSelectedMovie(movie);
      router.push("/booking");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* 백드롭 흐림 배경 */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 모달 박스 */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl transition-all duration-300 flex flex-col md:flex-row max-h-[85vh] md:max-h-[80vh]">
        
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full bg-slate-950/50 p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-950/80 border border-white/5"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center p-20 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-accent" />
            <p className="text-sm text-slate-400 font-medium">영하 정보를 불러오고 있습니다...</p>
          </div>
        ) : movie ? (
          <>
            {/* 좌측/상단: 포스터 및 백드롭 모바일 이미지 */}
            <div className="relative w-full md:w-2/5 aspect-[16/9] md:aspect-auto md:min-h-full bg-slate-950">
              <Image
                src={getMovieImageUrl(movie.poster_path, "original")}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
            </div>

            {/* 우측/하단: 상세 정보 텍스트 */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                {/* 영화 타이틀 및 원제 */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    {movie.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-medium italic">
                    {movie.original_title}
                  </p>
                </div>

                {/* 태그라인 / 메타 정보 */}
                <div className="mt-4 flex flex-wrap gap-3 items-center text-xs md:text-sm text-slate-300">
                  <div className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star size={14} className="fill-amber-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                  
                  {movie.release_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{movie.release_date}</span>
                    </div>
                  )}

                  {movie.runtime && (
                    <div className="flex items-center space-x-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>{movie.runtime}분</span>
                    </div>
                  )}
                </div>

                {/* 장르 태그 */}
                {movie.genres && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {movie.genres.map((genre) => (
                      <span 
                        key={genre}
                        className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs text-slate-300 font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* 줄거리 */}
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-400 mb-1.5">줄거리</h4>
                  <p className="text-sm leading-relaxed text-slate-300 line-clamp-5 md:line-clamp-none">
                    {movie.overview || "영화 상세 설명이 등록되어 있지 않습니다."}
                  </p>
                </div>

                {/* 감독 및 배우 */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                      <Film size={12} />
                      감독
                    </h5>
                    <p className="text-sm text-slate-300 font-semibold">{movie.director || "정보 없음"}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                      <Users size={12} />
                      출연
                    </h5>
                    <p className="text-sm text-slate-300 font-semibold truncate">
                      {movie.cast && movie.cast.length > 0 ? movie.cast.join(", ") : "정보 없음"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 예매하가 버튼 */}
              <div className="mt-8 pt-4 md:pt-0">
                <button
                  onClick={handleBooking}
                  className="w-full rounded-2xl bg-accent hover:bg-accent-hover text-white py-3.5 px-6 font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
                >
                  <Ticket size={20} />
                  이 영화 예매하기
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-20">
            <p className="text-sm text-slate-400">영화 정보를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
