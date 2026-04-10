'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Loader2, XCircle, Mail, User as UserIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PendingUser {
  id: number;
  email: string;
  name: string;
  surname: string;
  artistName: string;
  emailVerified: boolean;
  isApproved: boolean;
  accessRequestMessage: string | null;
  createdAt: string;
}

export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/admin/pending-users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/users/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Вы уверены, что хотите отклонить заявку от "${name}"? Пользователь будет удален.`)) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/users/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Заявки на регистрацию</h1>
        <p className="text-muted-foreground">
          Управление новыми пользователями и запросами на доступ
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Ожидают подтверждения ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет новых заявок
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя + ФИО</TableHead>
                    <TableHead>Псевдоним</TableHead>
                    <TableHead>Почта</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-primary">
                          <UserIcon className="w-3 h-3" />
                          {user.artistName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-sm italic break-words" title={user.accessRequestMessage || ""}>
                          {user.accessRequestMessage || "Нет сообщения"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(user.id)}
                            disabled={processingId === user.id}
                          >
                            {processingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Подтвердить
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.id, user.name)}
                            disabled={processingId === user.id}
                          >
                            {processingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Отклонить
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
