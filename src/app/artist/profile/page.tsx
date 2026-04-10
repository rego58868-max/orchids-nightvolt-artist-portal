"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sun, Moon, Snowflake, User as UserIcon, Mail, Shield, Award, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasAdvancedFeatures, canEditLabel, getUserPlanName, getPlanFeatures } from "@/lib/permissions";

export default function ArtistProfile() {
  const { user, loading, refreshUser } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState(user?.theme || "light");
  const [showSnowflakes, setShowSnowflakes] = useState(user?.showSnowflakes || false);
  const [showGarland, setShowGarland] = useState(user?.showGarland || false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, showSnowflakes, showGarland }),
      });

      if (response.ok) {
        await refreshUser();
        // Применяем тему сразу
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isAdvanced = hasAdvancedFeatures(user);
  const isLabel = canEditLabel(user);
  const planName = getUserPlanName(user);
  const planFeatures = getPlanFeatures(user);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Профиль</h1>
        <p className="text-muted-foreground">
          Управление вашим профилем и настройками
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
                <CardDescription>
                  Основная информация о вашем аккаунте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={isLabel ? "default" : isAdvanced ? "default" : "secondary"} className="text-sm px-3 py-1">
                    {planName}
                  </Badge>
                </div>

                <div className="grid gap-4 pt-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <UserIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Имя артиста</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Лейбл</p>
                      <p className="font-medium">{user.label}</p>
                      {isLabel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Вы можете изменить название лейбла при загрузке релизов
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Тип плана</p>
                      <p className="font-medium">{planName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isLabel 
                          ? "Назначен администратором. Полный доступ ко всем функциям + редактирование лейбла."
                          : isAdvanced 
                            ? "Назначен администратором. Доступ ко всем расширенным функциям."
                            : "Назначен администратором. Стандартный набор функций."}
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Примечание:</strong> План, лейбл и другие основные данные могут быть изменены только администратором. 
                    При изменении плана администратором все функции автоматически обновляются в вашем профиле.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Тема и анимация</CardTitle>
                <CardDescription>
                  Настройте внешний вид интерфейса
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Тема оформления</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Sun className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Светлая</p>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Moon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Тёмная</p>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Snowflake className="w-5 h-5 text-blue-500" />
                    <div>
                      <Label htmlFor="snowflakes" className="cursor-pointer">
                        Анимация снежинок
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Доступно только для тёмной темы
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="snowflakes"
                    checked={showSnowflakes}
                    onCheckedChange={setShowSnowflakes}
                    disabled={theme !== "dark"}
                  />
                </div>

                <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <div>
                      <Label htmlFor="garland" className="cursor-pointer">
                        Новогодняя гирлянда
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Доступно только для тёмной темы
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="garland"
                    checked={showGarland}
                    onCheckedChange={setShowGarland}
                    disabled={theme !== "dark"}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить изменения"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ваш план</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <Badge
                    variant={isLabel || isAdvanced ? "default" : "secondary"}
                    className="text-lg px-4 py-2"
                  >
                    {planName}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {planFeatures.map((feature, index) => (
                    <p key={index} className="text-muted-foreground">{feature}</p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Для смены плана обратитесь к администратору
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Помощь</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Забыли пароль или нужна помощь?
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:support@nightvolt.app">
                    Связаться с администратором
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}