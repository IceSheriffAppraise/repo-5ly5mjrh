"use client";

import { useEffect, useState } from "react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";

const STATUSES = [
  { value: "new", label: "Новая" },
  { value: "confirmed", label: "Подтверждена" },
  { value: "done", label: "Выполнена" },
  { value: "cancelled", label: "Отменена" },
];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Заявки</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        {loading ? (
          <p className="p-5 text-sm text-stone-400">Загрузка…</p>
        ) : orders.length === 0 ? (
          <p className="p-5 text-sm text-stone-400">Заявок пока нет</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Заказ</th>
                <th className="px-4 py-3 font-medium">Формат</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-stone-50 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                    {new Date(o.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {o.program_code} · {o.calories} ккал · {o.duration_days} дн.
                    {o.without_fish ? " · без рыбы" : ""}
                  </td>
                  <td className="px-4 py-3">{o.order_format === "subscription" ? "подписка" : "разовый"}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(o.total_price)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-lg border border-stone-200 px-2 py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
