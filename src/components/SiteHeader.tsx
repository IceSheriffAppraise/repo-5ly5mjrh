import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Food<span className="text-emerald-600">Kitchen</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-stone-600">
          <a href="#calculator" className="hover:text-stone-900">
            Калькулятор
          </a>
          <a href="#menu" className="hover:text-stone-900">
            Меню
          </a>
          <Link href="/admin" className="hover:text-stone-900">
            Админка
          </Link>
        </nav>
      </div>
    </header>
  );
}
