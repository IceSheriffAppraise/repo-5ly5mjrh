# Food Kitchen

Сайт доставки готового питания с калькулятором рациона и админкой.
Стек: **Next.js (App Router) + TypeScript + Tailwind + Supabase**.

Supabase — единственный источник данных: программы, блюда, меню, длительности,
скидки, формулы цены и заявки хранятся в базе, ничего не захардкожено в интерфейсе.

## Возможности

- Публичный сайт: главный экран, калькулятор питания, меню на день, оформление заявки, адаптив.
- Калькулятор: программы ФИТ / ХИТ / ПРО, дата первой доставки, калорийность,
  длительности 2 / 4 / 6 / 14 / 30 дней (из БД), плашка «Рассрочка» на 30 дней,
  переключатель «Без рыбы», формат заказа «Разовый / Подписка».
- Админка (`/admin/*`): меню, программы, калькулятор (тарифы), доставка, заявки, тексты.
- Загрузка фото блюд в Supabase Storage (`dish-images`).

## Локальный запуск

```bash
npm install
supabase start            # поднимает локальный Supabase (нужен Docker)
supabase migration up     # применяет миграции (если ещё не применены)
cp .env.example .env.local # подставьте значения из `supabase status`
npm run dev
```

Откройте http://localhost:3000 (сайт) и http://localhost:3000/admin (админка).

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```

## Структура

- `src/app` — страницы и API-роуты (App Router).
- `src/components` — UI-компоненты (калькулятор, меню, шапка).
- `src/lib` — клиент Supabase, типы, доступ к данным, расчёт цены.
- `supabase/migrations` — схема БД, RLS-политики, seed-данные, Storage-бакет.

## API

`/api/config`, `/api/menu`, `/api/programs`, `/api/meal-plans`, `/api/delivery-rules`,
`/api/pricing-rules`, `/api/orders`, `/api/upload/dish-image`, `/api/admin/[resource]`.
