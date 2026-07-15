import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-placeholder";

// Next.js SSR 및 API 런타임에서 안전하게 호출할 수 있는 Supabase 싱글톤 클라이언트 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // API Route Handlers 환경에서는 세션 쿠키 메모리 상태 유지를 막는 것이 안전함
  }
});
