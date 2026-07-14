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
      const users = JSON.parse(localStorage.getItem("mv_users") || "[]");
      const exists = users.some((u: any) => u.email === email);
      if (exists) {
        return { success: false, message: "이미 가입된 이메일입니다." };
      }

      const newUser: User = {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        email,
        nickname,
        points: 50000, // 기본 가입 축하금 50,000원 상당 포인트
      };

      users.push(newUser);
      localStorage.setItem("mv_users", JSON.stringify(users));

      // 가입 후 바로 로그인
      setUser(newUser);
      localStorage.setItem("mv_session", JSON.stringify(newUser));
      return { success: true, message: "회원가입에 성공했습니다. 50,000P가 지급되었습니다!" };
    } catch (e) {
      return { success: false, message: "회원가입 처리 중 요류가 발생했습니다." };
    }
  };

  // 로그인
  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const users = JSON.parse(localStorage.getItem("mv_users") || "[]");
      const found = users.find((u: any) => u.email === email);
      if (!found) {
        return { success: false, message: "가입되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요." };
      }

      setUser(found);
      localStorage.setItem("mv_session", JSON.stringify(found));
      return { success: true, message: "로그인 되었습니다." };
    } catch (e) {
      return { success: false, message: "로그인 처리 중 오류가 발생했습니다." };
    }
  };

  // 가상 데모 계정 원클릭 로그인
  const loginDemo = () => {
    const demoUser: User = {
      id: "usr_demo123",
      email: "demo@movieverse.com",
      nickname: "시네필매니아",
      points: 80000, // 테스트를 위해 넉넉히 제공
    };

    // 로컬 회원 DB에 데모 회원 정보 저장/업데이트
    const users = JSON.parse(localStorage.getItem("mv_users") || "[]");
    const existsIdx = users.findIndex((u: any) => u.id === demoUser.id);
    if (existsIdx > -1) {
      // 이미 데모 계정이 있다면 그 계정의 최신 정보를 사용하되 세션에 복사
      setUser(users[existsIdx]);
      localStorage.setItem("mv_session", JSON.stringify(users[existsIdx]));
    } else {
      users.push(demoUser);
      localStorage.setItem("mv_users", JSON.stringify(users));
      setUser(demoUser);
      localStorage.setItem("mv_session", JSON.stringify(demoUser));
    }
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem("mv_session");
  };

  // 가상 포인트 충전
  const chargePoints = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, points: user.points + amount };
    updateUserInDB(updatedUser);
  };

  // 가상 포인트 차감
  const deductPoints = (amount: number): boolean => {
    if (!user) return false;
    if (user.points < amount) return false;
    
    const updatedUser = { ...user, points: user.points - amount };
    updateUserInDB(updatedUser);
    return true;
  };

  // 로컬 DB 및 세션에 사용자 정보 동기화
  const updateUserInDB = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("mv_session", JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem("mv_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === updatedUser.id);
    if (idx > -1) {
      users[idx] = updatedUser;
      localStorage.setItem("mv_users", JSON.stringify(users));
    }
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
