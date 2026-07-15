"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, Send, Sparkles, AlertCircle, RefreshCw, MessageSquareCode } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🍿 안녕하세요! 저는 MovieVerse의 초고속 예매 비서 **'AI 씨네톡'**입니다!\n\n오늘 상영 중인 영화 추천이나, 고객님의 실시간 보유 포인트, 예매 티켓 좌석 확인 등 궁금하신 점이 있으시다면 무엇이든 물어보세요! ✨"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 동기화
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // 비인증 세션 보호
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setErrorText("");

    try {
      // 백엔드 Groq API Route 호출
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          messages: [...messages, userMessage]
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "AI 비서 응답 생성에 실패했습니다.");
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.choice.content
      }]);
    } catch (e: any) {
      console.error(e);
      setErrorText(e.message || "서버 통신 실패");
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
        <RefreshCw className="animate-spin mb-1 mr-2" size={18} />
        <span className="text-xs font-black">AI 씨네톡 접속 중...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f7f6] text-slate-800 select-none pb-14 relative">
      
      {/* 1. 헤더 (상단 고정) */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-30 shrink-0 shadow-xs">
        <button 
          onClick={() => router.push("/")}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 font-black text-sm"
        >
          <ChevronLeft size={20} />
          AI 씨네톡
        </button>
        <span className="text-[10px] bg-accent/15 text-accent font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-accent/25">
          <Sparkles size={10} className="animate-pulse" />
          Llama3 Powered
        </span>
      </header>

      {/* 2. 실시간 대화창 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div 
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* AI 프로필 아이콘 */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-xs">
                  <MessageSquareCode size={16} />
                </div>
              )}

              {/* 말풍선 버블 */}
              <div className="max-w-[75%] flex flex-col">
                {!isUser && (
                  <span className="text-[10px] text-slate-400 font-extrabold mb-1 ml-1">AI 씨네톡</span>
                )}
                <div 
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser 
                      ? "bg-accent text-white rounded-tr-xs font-medium shadow-sm" 
                      : "bg-white text-slate-800 border border-slate-200/60 rounded-tl-xs shadow-xs"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI 타이핑 대기 애니메이션 버블 */}
        {isSending && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-xs">
              <MessageSquareCode size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-extrabold mb-1 ml-1">AI 씨네톡</span>
              <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5 min-w-[65px] justify-center">
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-[bounce_1.4s_infinite_0s]" />
                <span className="w-1.5 h-1.5 bg-accent/70 rounded-full animate-[bounce_1.4s_infinite_0.2s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-[bounce_1.4s_infinite_0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* 오류 안내 배너 */}
        {errorText && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 flex items-start gap-2 text-red-600 text-[10px] leading-normal font-semibold shadow-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              {errorText}
              <button 
                onClick={() => setErrorText("")} 
                className="block underline font-extrabold mt-1 cursor-pointer"
              >
                메시지 닫기
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. 하단 메시지 인풋 영역 */}
      <form 
        onSubmit={handleSend}
        className="px-3.5 py-2.5 border-t border-slate-100 bg-white sticky bottom-0 left-0 right-0 z-30 shrink-0 flex items-center gap-2"
      >
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="메시지를 입력해 보세요..."
          disabled={isSending}
          className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent focus:bg-white transition-all disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-xs"
        >
          <Send size={14} />
        </button>
      </form>

    </div>
  );
}
