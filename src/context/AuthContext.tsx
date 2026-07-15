"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  nickname: string;
  points: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, nickname: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  loginDemo: () => void;
  logout: () => void;
  chargePoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기화 시 로컬 스토리지에서 세션 확인
  useEffect(() => {
    const savedSession = localStorage.getItem("mv_session");
    if (savedSession) {
      try {
        const sessionUser = JSON.parse(savedSession);
        // 최신 포인트 정보를 로컬 스토리지의 회원 데이터베이스에서 갱신
        const users = JSON.parse(localStorage.getItem("mv_users") || "[]");
        const found = users.find((u: any) => u.id === sessionUser.id);
        if (found) {
          setUser(found);
          localStorage.setItem("mv_session", JSON.stringify(found));
        } else {
          setUser(sessionUser);
        }
      } catch (e) {
        console.error("Session restoration error", e);
      }
    }
    setLoading(false);
  }, []);

  // 회원가입
  const signUp = async (email: string, nickname: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "회원가입에 실패했습니다." };
      }

      setUser(data.user);
      localStorage.setItem("mv_session", JSON.stringify(data.user));
      return { success: true, message: "회원가입에 성공했습니다. 50,000P가 지급되었습니다!" };
    } catch (e) {
      return { success: false, message: "회원가입 처리 중 오류가 발생했습니다." };
    }
  };

  // 로그인
  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "로그인에 실패했습니다." };
      }

      setUser(data.user);
      localStorage.setItem("mv_session", JSON.stringify(data.user));
      return { success: true, message: "로그인 되었습니다." };
    } catch (e) {
      return { success: false, message: "로그인 처리 중 오류가 발생했습니다." };
    }
  };

  // 가상 데모 계정 원클릭 로그인
  const loginDemo = async () => {
    // 데모 계정이 DB에 없다면 자동으로 가입시키거나 로그인 수행
    const demoEmail = "demo@movieverse.com";
    const demoNickname = "시네필매니아";
    
    let res = await login(demoEmail);
    if (!res.success) {
      // 가입되어 있지 않으면 가입 처리
      res = await signUp(demoEmail, demoNickname);
    }
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem("mv_session");
  };

  // 가상 포인트 충전
  const chargePoints = async (amount: number) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          type: "CHARGE",
          description: "무료 포인트 충전"
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("mv_session", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Failed to charge points", e);
    }
  };

  // 가상 포인트 차감
  const deductPoints = (amount: number): boolean => {
    // 백엔드 연동 하에 프론트 임시 상태 동기화용 (실제 차감은 bookings API 내부에서 수행)
    if (!user) return false;
    if (user.points < amount) return false;
    
    const updatedUser = { ...user, points: user.points - amount };
    setUser(updatedUser);
    localStorage.setItem("mv_session", JSON.stringify(updatedUser));
    return true;
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        login,
        loginDemo,
        logout,
        chargePoints,
        deductPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
