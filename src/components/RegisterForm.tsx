"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

import { EmailVerification } from "@/components/EmailVerification";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"register" | "pending">("register");
  const [email, setEmail] = useState("");

  // Registration state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    artistNameOrLabel: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при регистрации");
      }

      setStep("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "pending") {
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
            <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Заявка отправлена!
              </h1>
              <p className="text-gray-600 mb-8">
                Спасибо за регистрацию. Ваша заявка находится на рассмотрении. 
                Мы проверим данные и активируем ваш аккаунт в ближайшее время.
              </p>
              <Button 
                onClick={() => router.push("/")}
                className="w-full h-[48px] bg-[#5BBFB9] hover:bg-[#4AAEAA] text-white text-base font-medium rounded-lg transition-colors"
              >
                Вернуться на главную
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10 text-center">
            <h1 className="text-[28px] font-semibold text-gray-900 mb-6">
              Технический перерыв
            </h1>
            <p className="text-gray-600 mb-8">
              В данный момент регистрация недоступна. Пожалуйста, попробуйте позже.
            </p>
            <Button 
              onClick={() => router.push("/")}
              className="w-full h-[48px] bg-[#5BBFB9] hover:bg-[#4AAEAA] text-white text-base font-medium rounded-lg transition-colors"
            >
              Вернуться на страницу входа
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
