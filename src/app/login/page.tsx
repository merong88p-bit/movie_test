"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { LogIn, UserPlus, Sparkles, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, signUp, loginDemo } = useAuth();
  
  // 폼 입력 상태
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  
  // 에러 및 정보 알림 상태
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 리다이렉트 경로 설정 (예매 중간에 로그인한 경우)
  const redirectPath = searchParams.get("redirect") || "/";

  // 이미 로그인된 상태이면 리다이렉트
  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("이메일을 입력해 주세요.");
      return;
    }

    if (!isLoginMode && !nickname.trim()) {
      setErrorMsg("닉네임을 입력해 주세요.");
      return;
    }

    // 간단 이메일 정규식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (isLoginMode) {
      // 로그인 처리
      const res = await login(email);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => router.replace(redirectPath), 1000);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // 회원가입 처리
      const res = await signUp(email, nickname);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => router.replace(redirectPath), 1500);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    setSuccessMsg("데모 계정으로 로그인했습니다. 마이페이지에 80,000P가 충전되어 있습니다!");
    setTimeout(() => router.replace(redirectPath), 1000);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-3xl bg-card-bg border border-border-color p-8 shadow-2xl relative overflow-hidden">
        
        {/* 장식적 배경 블러 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-black text-white tracking-wide">
            Movie<span className="text-accent">Verse</span>에 오신 것을 환영합니다
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            영화 예매와 감상을 위한 스마트한 첫 걸음
          </p>
        </div>

        {/* 데모 로그인 배너 */}
        <button
          onClick={handleDemoLogin}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 px-4 text-sm transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Sparkles size={16} className="animate-bounce" />
          가상 데모 계정으로 즉시 로그인하기
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="absolute bg-card-bg px-3 text-xs text-slate-500 font-medium">OR</span>
        </div>

        {/* 로그인 / 회원가입 탭 */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setIsLoginMode(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              isLoginMode 
                ? "border-accent text-accent" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              !isLoginMode 
                ? "border-accent text-accent" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            간편 회원가입
          </button>
        </div>

        {/* 메시지 알림 배너 */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400 flex items-start gap-2">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 메인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">이메일 주소</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@movieverse.com"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

          {!isLoginMode && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-slate-400">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white py-3.5 px-4 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 mt-6 cursor-pointer shadow-lg shadow-accent/15"
          >
            {isLoginMode ? (
              <>
                <LogIn size={16} />
                로그인하기
              </>
            ) : (
              <>
                <UserPlus size={16} />
                회원가입 완료하기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

