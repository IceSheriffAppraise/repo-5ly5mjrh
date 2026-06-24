import Link from "next/link";

const NAV = [
  { href: "/admin/menu", label: "Меню" },
  { href: "/admin/programs", label: "Программы" },
  { href: "/admin/calculator", label: "Калькулятор" },
  { href: "/admin/delivery", label: "Доставка" },
  { href: "/admin/orders", label: "Заявки" },
  { href: "/admin/content", label: "Тексты" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-extrabold">
            Food Kitchen · Админка
          </Link>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
            ← На сайт
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
