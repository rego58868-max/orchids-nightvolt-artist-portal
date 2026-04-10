"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const login = formData.get("login") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка авторизации");
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("bearer_token", data.token);
      }

      if (data.user.isAdmin) {
        router.push("/admin/dashboard");
      } else if (data.user.isManager) {
        router.push("/manager/artists");
      } else {
        router.push("/artist/dashboard");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
        <header className="w-full border-b border-[#e6e9ee] bg-white flex-shrink-0">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/175b7615-9aa8-4afa-a42b-d4602f227d92-1766680751038.png?width=8000&height=8000&resize=contain" 
                alt="NIGHTVOLT Logo" 
                className="w-14 h-14 object-contain"
              />
              <div className="leading-tight">
                <div className="text-2xl font-bold text-gray-900">NIGHTVOLT</div>
                <div className="text-sm text-gray-500">Label/Distributor</div>
              </div>
            </div>
        </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10">
            <h1 className="text-[28px] font-semibold text-gray-900 mb-6">Вход</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="login"
                  type="text"
                  placeholder="Введите логин"
                  required
                  disabled={isLoading}
                  className="h-[48px] text-base placeholder:text-gray-400 border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#5BBFB9] focus-visible:border-[#5BBFB9]"
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading}
                  className="h-[48px] text-base placeholder:text-gray-400 border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#5BBFB9] focus-visible:border-[#5BBFB9]"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-[48px] bg-[#5BBFB9] hover:bg-[#4AAEAA] text-white text-base font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm mt-4">
                <a href="https://pyrus.com/form/2381667" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
                  Пользовательское соглашение
                </a>
                <a href="#" className="text-gray-500 hover:underline">
                  Политика конфиденциальности
                </a>
              </div>
            </form>
          </div>
            <div className="mt-6 text-center">
              <span className="text-gray-600">Нет аккаунта? </span>
              <button 
                type="button"
                onClick={() => toast.error("Технический перерыв. В данный момент регистрация недоступна.")}
                className="text-[#5BBFB9] font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Зарегистрироваться
              </button>
            </div>
        </div>
      </main>
    </div>
  );
}
