import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, getAuthSession } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("uz-UZ");
}

export default function UsersPage() {
  const session = getAuthSession();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    if (session?.role !== "admin") {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = await apiRequest("/admin/users", {}, { auth: true });
      setUsers(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.phone,
        user.profession,
        user.region,
        user.city,
        user.district,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(text)),
    );
  }, [query, users]);

  if (session?.role !== "admin") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="font-medium">Bu bo'lim faqat admin uchun ochiq.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg">Ro'yxatdan o'tgan foydalanuvchilar</CardTitle>
          <Button variant="outline" onClick={() => void fetchUsers()} disabled={isLoading}>
            Yangilash
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism, email, telefon, kasb, hudud bo'yicha qidiring..."
            className="h-11"
          />
          <p className="text-sm text-slate-500">Jami: {filteredUsers.length} ta user</p>
          <p className="text-xs text-slate-400">
            Xavfsizlik uchun parol ma'lumotlari ko'rsatilmaydi.
          </p>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-slate-300">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {user.role}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-slate-500">Ism/Familiya:</span> {user.firstName}{" "}
                {user.lastName}
              </p>
              <p>
                <span className="text-slate-500">Telefon:</span> {user.phone || "-"}
              </p>
              <p>
                <span className="text-slate-500">Kasbi:</span> {user.profession || "-"}
              </p>
              <p>
                <span className="text-slate-500">Manzil:</span> {user.address || "-"}
              </p>
              <p>
                <span className="text-slate-500">Hudud:</span>{" "}
                {[user.region, user.city, user.district].filter(Boolean).join(", ") || "-"}
              </p>
              <p>
                <span className="text-slate-500">Ro'yxatdan o'tgan sana:</span>{" "}
                {formatDate(user.createdAt)}
              </p>
              <p className="text-xs text-slate-400">ID: {user.id}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
