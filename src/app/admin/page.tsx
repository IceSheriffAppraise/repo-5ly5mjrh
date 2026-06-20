import Link from "next/link";

const SECTIONS = [
  { href: "/admin/menu", title: "Меню", desc: "Блюда, фото, КБЖУ, категории." },
  { href: "/admin/programs", title: "Программы", desc: "ФИТ / ХИТ / ПРО." },
  { href: "/admin/calculator", title: "Калькулятор", desc: "Тарифы: калории, приёмы, цена." },
  { href: "/admin/delivery", title: "Доставка", desc: "Длительности, скидки, дефолт." },
  { href: "/admin/orders", title: "Заявки", desc: "Входящие заказы." },
  { href: "/admin/content", title: "Тексты", desc: "Базовые тексты сайта." },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Управление</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition hover:ring-emerald-300"
          >
            <h2 className="font-bold">{s.title}</h2>
            <p className="mt-1 text-sm text-stone-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
