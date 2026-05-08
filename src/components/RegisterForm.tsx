"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Info } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    socialNetwork: "",
    artistName: "",
    password: "",
    howDidYouHear: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при регистрации");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "h-[48px] text-base placeholder:text-gray-400 border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#cd792f] focus-visible:border-[#cd792f]";

  const header = (
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
  );

  if (done) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
        {header}
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
                С вами свяжется менеджер в указанной социальной сети для
                уточнения деталей и создания рабочей беседы.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="w-full h-[48px] bg-[#cd792f] hover:bg-[#b8661f] text-white text-base font-medium rounded-lg transition-colors"
              >
                Вернуться на страницу входа
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
      {header}

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-10">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10">
            <h1 className="text-[26px] font-semibold text-gray-900 mb-6">
              Регистрация
            </h1>

            {/* Important note */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                После регистрации с вами свяжется менеджер в указанной
                социальной сети для уточнения деталей и создания рабочей
                беседы. В случае отказа в сотрудничестве ваш аккаунт будет
                отклонён.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Ваше имя"
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Ваша фамилия"
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Почта *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="example@mail.ru"
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="socialNetwork">
                  Соцсеть для связи * (Telegram / VK / Discord)
                </Label>
                <Input
                  id="socialNetwork"
                  value={form.socialNetwork}
                  onChange={set("socialNetwork")}
                  placeholder="Например: @username в Telegram"
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="artistName">Псевдоним *</Label>
                <Input
                  id="artistName"
                  value={form.artistName}
                  onChange={set("artistName")}
                  placeholder="Ваш творческий псевдоним"
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Придумайте пароль"
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="howDidYouHear">
                  Как вы узнали о нас? (необязательно)
                </Label>
                <Input
                  id="howDidYouHear"
                  value={form.howDidYouHear}
                  onChange={set("howDidYouHear")}
                  placeholder="Например: от друга, ВКонтакте, реклама..."
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-[48px] bg-[#cd792f] hover:bg-[#b8661f] text-white text-base font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Зарегистрироваться"
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-600">Уже есть аккаунт? </span>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-[#cd792f] font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Войти
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
