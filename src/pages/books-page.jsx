import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Heart, Plus, Star, X, BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function ProgressBar({ value }) {
  return (
    <div className="h-3.5 rounded-full bg-slate-100/80 overflow-hidden shadow-inner">
      <div className="h-3.5 rounded-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "Tugatildi") {
    return <Badge className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest bg-emerald-500 shadow-none border-0">Tugatildi</Badge>;
  }
  if (status === "O'qilmadi") {
    return <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest border-0 bg-slate-100 text-slate-500 shadow-none">O'qilmadi</Badge>;
  }
  return <Badge variant="outline" className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest border-0 bg-indigo-50 text-indigo-600 shadow-sm">O'qilmoqda</Badge>;
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
    <div className="space-y-8">
      <Card className="border-0 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Kitob qo'shish</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 p-6 rounded-[2rem] bg-slate-50 border-0 ring-1 ring-slate-200/50 shadow-inner">
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="book-title" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Asar nomi</Label>
              <Input
                id="book-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                placeholder="Masalan: Raqamli Qal'a"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-author" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Muallif</Label>
              <Input
                id="book-author"
                value={form.author}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                placeholder="Den Braun"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-category" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Kategoriya</Label>
              <select
                id="book-category"
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold text-sm px-4 outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-pages" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Sahifa soni</Label>
              <Input
                id="book-pages"
                type="number"
                min="1"
                value={form.pages}
                onChange={(event) => setForm((prev) => ({ ...prev, pages: event.target.value }))}
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold"
              />
            </div>
            <div className="md:col-span-2 xl:col-span-5 pt-2">
              <Button onClick={addBook} className="h-14 w-full rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-transform hover:-translate-y-0.5 group">
                <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Kitobni javonga qo'shish
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight">Kategoriyalar</h2>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, category }))}
              className={cn(
                "rounded-full px-6 py-2.5 text-[0.8rem] font-bold tracking-widest uppercase transition-all shadow-sm",
                activeCategory === category
                  ? "bg-slate-900 text-white ring-2 ring-transparent shadow-lg shadow-slate-900/20"
                  : "bg-white border-0 ring-1 ring-slate-200 text-slate-500 hover:text-slate-900 hover:ring-slate-300"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredBooks.map((book) => (
          <Card
            key={book.id}
            className="cursor-pointer border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 transform"
            onClick={() => setSelectedBookId(book.id)}
          >
            <CardContent className="p-0">
              <div className="relative h-48 w-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center p-6 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                <BookOpen className="absolute -bottom-8 -right-8 w-40 h-40 opacity-[0.15] transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700" />
                <h3 className="relative z-10 text-3xl font-black tracking-widest uppercase text-center drop-shadow-md">
                  {book.title.slice(0, 3)}
                </h3>
              </div>
              <div className="space-y-6 p-8 pb-8">
                <div>
                  <p className="text-xl font-extrabold tracking-tight text-slate-900 line-clamp-1">{book.title}</p>
                  <p className="text-sm font-bold text-slate-400 mt-1">{book.author}</p>
                </div>
                <div className="space-y-4">
                  <ProgressBar value={book.progress} />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{book.progress}% o'qildi</span>
                    <StatusBadge status={book.status} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {selectedBook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
          <Card className="w-full max-w-2xl border-0 shadow-2xl shadow-indigo-900/20 ring-1 ring-white/20 rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-200">
            <CardHeader className="relative h-32 bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center p-8">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm pr-12 line-clamp-2">{selectedBook.title}</CardTitle>
              <button
                type="button"
                onClick={() => setSelectedBookId(null)}
                className="absolute top-6 right-6 rounded-full bg-black/20 hover:bg-black/40 text-white p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </CardHeader>
            <CardContent className="space-y-8 p-8 max-h-[70vh] overflow-y-auto custom-scroll">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Muallif</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedBook.author}</p>
                </div>
                <StatusBadge status={selectedBook.status} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reyting</Label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "h-6 w-6 transition-colors",
                          index < selectedBook.rating
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "fill-slate-100 text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="book-progress" className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Progress (sahifa)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="book-progress"
                      type="number"
                      min="0"
                      max={selectedBook.pages}
                      value={selectedBook.readPages}
                      onChange={(event) =>
                        actions.updateBookReadPages(selectedBook.id, Number(event.target.value))
                      }
                      className="h-12 w-24 rounded-xl font-bold bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 text-center"
                    />
                    <span className="text-slate-400 font-bold">/ {selectedBook.pages}</span>
                  </div>
                </div>
              </div>

              {selectedBook.note && (
                <div className="rounded-2xl border-0 ring-1 ring-slate-200 bg-slate-50 p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl"></div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedBook.note}"</p>
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={() => actions.toggleBookLike(selectedBook.id)}
                className={cn(
                  "rounded-2xl h-12 px-6 font-bold transition-all shadow-sm active:scale-95 border-0 ring-1",
                  "hover:bg-rose-50 ring-slate-200 hover:ring-rose-200 text-slate-700 hover:text-rose-600"
                )}
              >
                <Heart className={cn("h-5 w-5 mr-2", selectedBook.likes > 0 ? "fill-rose-500 text-rose-500" : "")} />
                Yoqdi ({selectedBook.likes})
              </Button>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-lg font-extrabold tracking-tight">Izohlar</p>
                <div className="max-h-48 space-y-3 overflow-y-auto custom-scroll pr-2">
                  {selectedBook.comments.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Hali izohlar yo'q.</p>
                  ) : (
                    selectedBook.comments.map((item, index) => (
                      <div key={`${item}-${index}`} className="rounded-2xl bg-white border-0 ring-1 ring-slate-100 shadow-sm p-4 text-sm font-medium text-slate-700">
                        {item}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Input
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Izoh yozing..."
                    className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 px-4"
                  />
                  <Button onClick={submitComment} className="h-12 rounded-xl px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 transition-transform hover:-translate-y-0.5">
                    Yozish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
