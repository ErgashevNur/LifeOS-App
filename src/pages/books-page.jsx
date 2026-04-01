import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Heart, Plus, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "Tugatildi") {
    return <Badge>Tugatildi</Badge>;
  }
  if (status === "O'qilmadi") {
    return <Badge variant="secondary">O'qilmadi</Badge>;
  }
  return <Badge variant="outline">O'qilmoqda</Badge>;
}

export default function BooksPage() {
  const { data, actions, selectors } = useLifeOSData();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    pages: "250",
  });

  const categories = useMemo(() => {
    const values = new Set(data.content.books.categories);
    selectors.booksWithMeta.forEach((book) => values.add(book.category));
    return [...values];
  }, [data.content.books.categories, selectors.booksWithMeta]);

  useEffect(() => {
    if (!form.category && categories.length > 0) {
      setForm((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories, form.category]);

  const activeCategory = form.category;

  const filteredBooks = useMemo(
    () =>
      selectors.booksWithMeta.filter(
        (book) => !activeCategory || book.category === activeCategory,
      ),
    [activeCategory, selectors.booksWithMeta],
  );

  const selectedBook =
    selectors.booksWithMeta.find((book) => book.id === selectedBookId) ?? null;

  const addBook = () => {
    actions.addBook({
      title: form.title,
      author: form.author,
      category: form.category,
      pages: Number(form.pages),
    });
    setForm((prev) => ({ ...prev, title: "", author: "", pages: "250" }));
  };

  const submitComment = () => {
    if (!selectedBook) {
      return;
    }
    actions.addBookComment(selectedBook.id, comment);
    setComment("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kitob qo'shish</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="book-title">Nomi</Label>
            <Input
              id="book-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-author">Muallif</Label>
            <Input
              id="book-author"
              value={form.author}
              onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-category">Kategoriya</Label>
            <select
              id="book-category"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-pages">Sahifa soni</Label>
            <Input
              id="book-pages"
              type="number"
              min="1"
              value={form.pages}
              onChange={(event) => setForm((prev) => ({ ...prev, pages: event.target.value }))}
              className="h-11"
            />
          </div>
          <div className="md:col-span-2 xl:col-span-5">
            <Button onClick={addBook}>
              <Plus className="h-4 w-4" />
              Kitob qo'shish
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategoriyalar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, category }))}
              className={
                activeCategory === category
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white"
                  : "rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:border-slate-900"
              }
            >
              {category}
            </button>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBooks.map((book) => (
          <Card
            key={book.id}
            className="cursor-pointer border-slate-300 hover:border-slate-900"
            onClick={() => setSelectedBookId(book.id)}
          >
            <CardContent className="space-y-3 pt-6">
              <div className="flex h-28 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-2xl font-semibold">
                {book.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{book.title}</p>
                <p className="text-sm text-slate-500">{book.author}</p>
              </div>
              <ProgressBar value={book.progress} />
              <div className="flex items-center justify-between text-sm">
                <span>{book.progress}%</span>
                <StatusBadge status={book.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {selectedBook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-2xl border-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">{selectedBook.title}</CardTitle>
              <button
                type="button"
                onClick={() => setSelectedBookId(null)}
                className="rounded-md border border-slate-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">{selectedBook.author}</p>
              <StatusBadge status={selectedBook.status} />

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={
                      index < selectedBook.rating
                        ? "h-4 w-4 fill-slate-900 text-slate-900"
                        : "h-4 w-4 text-slate-300"
                    }
                  />
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-progress">Progress (sahifa)</Label>
                <Input
                  id="book-progress"
                  type="number"
                  min="0"
                  max={selectedBook.pages}
                  value={selectedBook.readPages}
                  onChange={(event) =>
                    actions.updateBookReadPages(selectedBook.id, Number(event.target.value))
                  }
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm text-slate-700">{selectedBook.note}</p>
              </div>

              <Button variant="outline" onClick={() => actions.toggleBookLike(selectedBook.id)}>
                <Heart className="h-4 w-4" />
                Like ({selectedBook.likes})
              </Button>

              <div className="space-y-2">
                <p className="font-medium">Izohlar</p>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
                  {selectedBook.comments.map((item, index) => (
                    <p key={`${item}-${index}`} className="rounded-md bg-slate-100 p-2 text-sm">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Izoh yozing..."
                    className="h-10"
                  />
                  <Button onClick={submitComment}>Yozish</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
