"use client";

import { useMemo, useState } from "react";
import { AppConfig, DeliveryRule, OrderFormat } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/pricing";

interface Props {
  config: AppConfig;
}

export default function Calculator({ config }: Props) {
  const { programs, deliveryRules, pricingRules, content } = config;

  const activePrograms = programs;
  const [programId, setProgramId] = useState<string>(activePrograms[0]?.id ?? "");

  const calorieOptions = useMemo(
    () =>
      pricingRules
        .filter((p) => p.program_id === programId)
        .map((p) => p.calories)
        .sort((a, b) => a - b),
    [pricingRules, programId],
  );

  const [calories, setCalories] = useState<number>(calorieOptions[0] ?? 0);

  // Keep calories valid when the program changes.
  const effectiveCalories = calorieOptions.includes(calories) ? calories : calorieOptions[0] ?? 0;

  const defaultRule = deliveryRules.find((r) => r.is_default) ?? deliveryRules[0];
  const [days, setDays] = useState<number>(defaultRule?.days ?? 0);
  const [withoutFish, setWithoutFish] = useState(false);
  const [orderFormat, setOrderFormat] = useState<OrderFormat>("one_time");
  const [firstDeliveryDate, setFirstDeliveryDate] = useState<string>("");

  const pricing = useMemo(
    () => pricingRules.find((p) => p.program_id === programId && p.calories === effectiveCalories) ?? null,
    [pricingRules, programId, effectiveCalories],
  );
  const rule: DeliveryRule | null = useMemo(
    () => deliveryRules.find((r) => r.days === days) ?? null,
    [deliveryRules, days],
  );
  const breakdown = useMemo(() => calculatePrice(pricing, rule), [pricing, rule]);

  const selectedProgram = activePrograms.find((p) => p.id === programId);

  // Order form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submitOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone,
          address,
          comment,
          program_id: programId,
          calories: effectiveCalories,
          duration_days: days,
          order_format: orderFormat,
          without_fish: withoutFish,
          first_delivery_date: firstDeliveryDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не удалось оформить заявку");
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="calculator" className="mx-auto w-full max-w-5xl px-4">
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
        {content.calculator_title ?? "Калькулятор питания"}
      </h2>

      <div className="grid gap-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-7 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Program */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Программа</label>
            <div className="grid grid-cols-3 gap-2">
              {activePrograms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProgramId(p.id)}
                  className={`rounded-xl border px-3 py-3 text-center transition ${
                    p.id === programId
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <span className="block text-base font-bold">{p.name}</span>
                </button>
              ))}
            </div>
            {selectedProgram?.description && (
              <p className="mt-2 text-sm text-stone-500">{selectedProgram.description}</p>
            )}
          </div>

          {/* First delivery date */}
          <div>
            <label htmlFor="first-date" className="mb-2 block text-sm font-semibold text-stone-700">
              Дата первой доставки
            </label>
            <input
              id="first-date"
              type="date"
              value={firstDeliveryDate}
              onChange={(e) => setFirstDeliveryDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Calories */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Калорийность</label>
            <div className="flex flex-wrap gap-2">
              {calorieOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCalories(c)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    c === effectiveCalories
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {c} ккал
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Продолжительность</label>
            <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-3 md:grid-cols-5">
              {deliveryRules.map((r) => {
                const selected = r.days === days;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDays(r.days)}
                    className={`relative rounded-xl border px-2 py-3 text-center transition ${
                      selected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    {r.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                        {r.badge}
                      </span>
                    )}
                    <span className="block text-lg font-bold leading-none">{r.days}</span>
                    <span className="block text-xs text-stone-500">{dayWord(r.days)}</span>
                    {r.discount_percent > 0 && (
                      <span className="mt-1 block text-xs font-semibold text-emerald-600">−{r.discount_percent}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Without fish */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
            <span className="text-sm font-medium text-stone-700">Без рыбы</span>
            <input
              type="checkbox"
              checked={withoutFish}
              onChange={(e) => setWithoutFish(e.target.checked)}
              className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-stone-300 transition-colors checked:bg-emerald-600 relative before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
            />
          </label>

          {/* Order format — subscription meaning lives inside the calculator */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Формат заказа</label>
            <div className="grid grid-cols-2 gap-2">
              {(["one_time", "subscription"] as OrderFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setOrderFormat(fmt)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    orderFormat === fmt
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {fmt === "one_time" ? "Разовый заказ" : "Подписка"}
                </button>
              ))}
            </div>
            {orderFormat === "subscription" && content.subscription_hint && (
              <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">{content.subscription_hint}</p>
            )}
          </div>
        </div>

        {/* RIGHT — summary */}
        <div className="lg:border-l lg:border-stone-100 lg:pl-6">
          <div className="rounded-2xl bg-stone-50 p-5">
            <h3 className="mb-4 text-lg font-bold">Итого к оплате</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Программа" value={selectedProgram?.name ?? "—"} />
              <Row label="Калорийность" value={`${effectiveCalories} ккал`} />
              <Row label="Приёмов пищи" value={breakdown.mealsCount ? `${breakdown.mealsCount}` : "—"} />
              <Row label="Длительность" value={`${days} ${dayWord(days)}`} />
              <Row label="Цена за день" value={formatPrice(breakdown.pricePerDay)} />
              {breakdown.discountPercent > 0 && (
                <Row label={`Скидка ${breakdown.discountPercent}%`} value={`−${formatPrice(breakdown.discountAmount)}`} />
              )}
              <Row label="Формат" value={orderFormat === "subscription" ? "подписка" : "разовый заказ"} />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4">
              <span className="text-sm text-stone-500">К оплате</span>
              <span className="text-2xl font-extrabold text-emerald-700">{formatPrice(breakdown.total)}</span>
            </div>

            {!showForm && !done && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Оформить заказ
              </button>
            )}

            {showForm && !done && (
              <div className="mt-5 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Телефон"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Адрес доставки"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Комментарий (необязательно)"
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitOrder}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Отправляем…" : "Оформить заказ"}
                </button>
              </div>
            )}

            {done && (
              <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
                Заявка принята! Мы свяжемся с вами для подтверждения.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-medium text-stone-800">{value}</dd>
    </div>
  );
}

function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}
