"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, setToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ScoutEmblem } from "@/components/ui/scout-emblem";
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const res = await apiClient.post("/auth/login", {
          email,
          password,
        });

        if (res.session?.access_token) {
          setToken(res.session.access_token);
        }

        router.push("/portal");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Thông tin đăng nhập không chính xác.");
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#120D26] via-background to-[#170E2B] mesh-bg px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      {/* Ambient decorative glowing orbs matching Scout palette */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-[#7D58D9]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-[#EDB55E]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-[#5CB856]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10 glass rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="p-6 sm:p-10 space-y-5 sm:space-y-6">
          {/* Header & Scout Emblem */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-[#7D58D9]/20 via-[#EDB55E]/15 to-[#5CB856]/15 border border-[#7D58D9]/30 shadow-md shadow-[#7D58D9]/10 group transition-transform hover:scale-105">
              <ScoutEmblem className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-sm" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7D58D9] dark:text-[#A78BFA]">
                <Sparkles className="h-3.5 w-3.5 text-[#EDB55E]" />
                <span>Hệ Thống Hướng Đạo Việt Nam</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Scouts Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Đăng nhập để quản lý đoàn sinh, ngành và kinh phí
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs sm:text-sm text-destructive font-medium"
              >
                {error}
              </div>
            ) : null}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-foreground/85 flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email đăng nhập
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="truong@huongdao.org…"
                  className="flex h-11 w-full rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm px-3.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D58D9] focus-visible:border-transparent transition-all hover:bg-background/80"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground/85 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="flex h-11 w-full rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm px-3.5 pr-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D58D9] focus-visible:border-transparent transition-all hover:bg-background/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7D58D9] to-[#6C42D0] hover:from-[#6C42D0] hover:to-[#5B33BE] text-white font-bold shadow-lg shadow-[#7D58D9]/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập…
                </span>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>

          {/* 5 Scout Sections Footer Indicator */}
          <div className="pt-2 border-t border-border/40 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium">
                5 Ngành Sinh Hoạt:
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: "#F97316" }}
                  title="Ngành Nhi (Cam)"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: "#EDB55E" }}
                  title="Ngành Ấu (Vàng)"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: "#5CB856" }}
                  title="Ngành Thiếu (Xanh lá)"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: "#881337" }}
                  title="Ngành Kha (Đỏ bầm)"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: "#E01205" }}
                  title="Ngành Tráng (Đỏ)"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              Châm ngôn Hướng Đạo: Sắp Sẵn • Be Prepared
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
