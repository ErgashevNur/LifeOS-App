import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="flex h-screen flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm">
      <p className="text-6xl font-bold text-slate-900">404</p>
      <p className="mt-2 text-slate-600">Bunday sahifa topilmadi.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}
