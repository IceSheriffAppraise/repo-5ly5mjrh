import SiteHeader from "@/components/SiteHeader";
import Calculator from "@/components/Calculator";
import MenuOfDay from "@/components/MenuOfDay";
import { getConfig, getMealPlans } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, mealPlans] = await Promise.all([getConfig(), getMealPlans()]);
  const { content } = config;

  return (
    <main className="min-h-screen pb-20">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
          {content.hero_title ?? "Здоровое питание с доставкой на дом"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-500 sm:text-lg">
          {content.hero_subtitle ?? "Готовые рационы с доставкой."}
        </p>
        <a
          href="#calculator"
          className="mt-7 inline-block rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          {content.hero_cta ?? "Рассчитать рацион"}
        </a>
      </section>

      <div className="space-y-16">
        <Calculator config={config} />
        <MenuOfDay plans={mealPlans} title={content.menu_title ?? "Меню на день"} />
      </div>

      <footer className="mx-auto mt-16 max-w-5xl px-4 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} Food Kitchen
      </footer>
    </main>
  );
}
