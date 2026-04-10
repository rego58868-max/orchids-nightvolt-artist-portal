"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Calendar, ChevronDown, Download, Loader2, AlertCircle, CheckCircle, FileText, Info, ListMusic, Edit, Link as LinkIcon, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface Release {
  id: number;
  type: string;
  title: string;
  coverUrl: string;
  mainArtist: string;
  status: string;
  isAsap: boolean;
  artistName: string;
  artistComment: string | null;
  moderatorComment: string | null;
  createdAt: string;
  releaseDate: string | null;
  upc: string | null;
  label: string;
  genre: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  draft:            { label: "Черновик",              variant: "secondary",    color: "bg-muted text-muted-foreground border-border" },
  on_moderation:    { label: "На модерации",           variant: "default",      color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
  approved:         { label: "Одобрено",              variant: "outline",      color: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30" },
  published:        { label: "Опубликован",            variant: "outline",      color: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30" },
  rejected:         { label: "Отклонено",             variant: "destructive",  color: "bg-destructive/15 text-destructive border-destructive/30" },
  requires_changes: { label: "Требуются изменения",   variant: "destructive",  color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
};

export default function AdminReleases() {
  const router = useRouter();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [moderatorComment, setModeratorComment] = useState("");
  const [upc, setUpc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("releaseDate");

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/admin/releases", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }
      }
      
      const data = await response.json();
      setReleases(data.releases || []);
    } catch (error) {
      console.error("Error fetching releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (release: Release) => {
    setSelectedRelease(release);
    setNewStatus(release.status);
    setModeratorComment(release.moderatorComment || "");
    setUpc(release.upc || "");
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRelease) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/releases/${selectedRelease.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          moderatorComment,
          upc: upc || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Ошибка при обновлении" });
        return;
      }

      setMessage({ type: "success", text: "Релиз успешно обновлён!" });
      fetchReleases();
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCatalog = () => {
    const headers = ["Название", "Артист", "UPC", "Лейбл", "Дата создания", "Дата релиза", "Статус", "Жанр"];
    const rows = sortedAndFilteredReleases.map(r => [
      r.title,
      r.mainArtist,
      r.upc || "-",
      r.label,
      new Date(r.createdAt).toISOString().split("T")[0],
      r.releaseDate ? new Date(r.releaseDate).toISOString().split("T")[0] : "-",
        (statusMap[r.status] || statusMap.draft).label,
      r.genre
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nightvolt-catalog-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Фильтрация и сортировка
  const sortedAndFilteredReleases = releases
    .filter(release => {
      const matchesSearch = searchQuery === "" || 
        release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.mainArtist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.upc?.includes(searchQuery) ||
        release.label.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStartDate = startDateFilter === "" || 
        (release.releaseDate && new Date(release.releaseDate) >= new Date(startDateFilter));
      
      const matchesCreatedDate = createdDateFilter === "" || 
        (new Date(release.createdAt) >= new Date(createdDateFilter));
      
      return matchesSearch && matchesStartDate && matchesCreatedDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "releaseDate":
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isEditable = (status: string) => status === "requires_changes";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Управление релизами</h1>
        <p className="text-muted-foreground">
          Модерация и управление релизами артистов
        </p>
      </motion.div>

      {/* Блок поиска и фильтров */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="border-border/50 shadow-sm bg-muted/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по UPC, ISRC, треку, исполнителю, лейблу"
                  className="pl-10 h-12 bg-background border-border"
                />
              </div>

              {/* Фильтры */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="h-12 bg-background border-border">
                    <SelectValue placeholder="Площадки" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все площадки</SelectItem>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="apple">Apple Music</SelectItem>
                    <SelectItem value="youtube">YouTube Music</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="date"
                    placeholder="Дата старта"
                    className="h-12 bg-background border-border pr-10"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="date"
                    placeholder="Дата создания"
                    className="h-12 bg-background border-border pr-10"
                    value={createdDateFilter}
                    onChange={(e) => setCreatedDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Верхний блок управления */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold mb-1">Всего релизов: {sortedAndFilteredReleases.length}</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-0 h-auto p-0 w-auto hover:bg-transparent">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-sm">Сортировать по: {sortBy === "releaseDate" ? "Дата старта" : sortBy === "createdAt" ? "Дата создания" : "Дата релиза"}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="releaseDate">Дата старта</SelectItem>
              <SelectItem value="createdAt">Дата создания</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={handleDownloadCatalog}
          className="h-11 px-6 border-2"
        >
          <Download className="w-4 h-4 mr-2" />
          Скачать каталог
        </Button>
      </motion.div>

      {/* Карточки релизов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Загрузка релизов...</p>
              </div>
            </CardContent>
          </Card>
        ) : sortedAndFilteredReleases.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Релизы не найдены
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedAndFilteredReleases.map((release) => (
            <Card key={release.id} className="overflow-hidden hover:shadow-md transition-shadow border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Обложка */}
                  <div className="relative w-32 h-32 rounded-md overflow-hidden shrink-0 bg-muted">
                    <Image
                      src={release.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"}
                      alt={release.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    {/* Заголовок и артист */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-xl font-bold text-foreground">{release.title}</h3>
                        {(() => {
                          const st = statusMap[release.status] || statusMap.draft;
                          return (
                            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>
                              {st.label}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-base text-muted-foreground">{release.mainArtist}</p>
                    </div>

                    {/* Метаданные - Строка 1 */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">UPC</span>
                        <p className="font-medium">{release.upc || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Название лейбла</span>
                        <p className="font-medium">{release.label}</p>
                      </div>
                    </div>

                    {/* Метаданные - Строка 2 */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Дата создания</span>
                        <p className="font-medium">{formatDate(release.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Дата релиза</span>
                        <p className="font-medium">
                          {release.releaseDate ? formatDate(release.releaseDate) : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Дата старта</span>
                        <p className="font-medium">
                          {release.releaseDate ? formatDate(release.releaseDate) : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Территории</span>
                        <p className="font-medium flex items-center gap-1">
                          WorldWide
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                            <path d="M2 6h8M6 2v8" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Площадки</span>
                        <p className="font-medium flex items-center gap-1">
                          120+
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                            <path d="M2 6h8M6 2v8" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Жанр</span>
                        <p className="font-medium">{release.genre}</p>
                      </div>
                    </div>
                  </div>

                  {/* Блок иконок действий */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => router.push(`/admin/releases/${release.id}`)}
                      title="Просмотреть всю информацию о релизе"
                    >
                      <Info className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => router.push(`/admin/releases/${release.id}`)}
                      title="Открыть трек-лист и информацию о треках"
                    >
                      <ListMusic className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => router.push(`/admin/releases/${release.id}`)}
                      title="Редактировать релиз"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Удалить релиз"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}