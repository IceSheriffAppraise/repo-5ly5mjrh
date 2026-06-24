import { MealPlan } from "@/lib/types";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export default function MenuOfDay({ plans, title }: { plans: MealPlan[]; title: string }) {
  const plan = plans[0];
  if (!plan) return null;

  return (
    <section id="menu" className="mx-auto w-full max-w-5xl px-4">
      <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mb-6 text-center text-sm text-stone-500">
        {plan.name} · {plan.calories} ккал
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(plan.items ?? []).map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            {item.dish?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.dish.image_url} alt={item.dish?.name ?? ""} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-stone-100 text-sm text-stone-400">
                Нет фото
              </div>
            )}
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {MEAL_LABELS[item.meal_type] ?? item.meal_type}
              </span>
              <h3 className="mt-1 font-bold leading-tight">{item.dish?.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-stone-500">{item.dish?.description}</p>
              {item.dish && (
                <p className="mt-2 text-xs text-stone-400">
                  {item.dish.calories} ккал · Б {item.dish.proteins} / Ж {item.dish.fats} / У {item.dish.carbs}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
