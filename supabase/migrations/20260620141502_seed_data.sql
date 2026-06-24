-- Food Kitchen — seed / baseline configuration data.
-- Idempotent so it is safe to re-run on any environment.

-- Programs: ФИТ / ХИТ / ПРО
insert into public.programs (code, name, description, sort_order, is_active) values
  ('FIT', 'ФИТ', 'Сбалансированное питание для поддержания формы и лёгкости.', 1, true),
  ('HIT', 'ХИТ', 'Самые популярные блюда и оптимальный баланс цены и качества.', 2, true),
  ('PRO', 'ПРО', 'Максимум белка и продуманный рацион для активных нагрузок.', 3, true)
on conflict (code) do update
  set name = excluded.name,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

-- Delivery rules: durations 2 / 4 / 6 / 14 / 30.
-- 2/4/6 — no discount. 14/30 — discount from DB. 30 — badge "Рассрочка".
insert into public.delivery_rules (days, discount_percent, badge, is_default, sort_order, is_active) values
  (2,  0,  null,         false, 1, true),
  (4,  0,  null,         false, 2, true),
  (6,  0,  null,         true,  3, true),
  (14, 5,  null,         false, 4, true),
  (30, 12, 'Рассрочка',  false, 5, true)
on conflict (days) do update
  set discount_percent = excluded.discount_percent,
      badge = excluded.badge,
      is_default = excluded.is_default,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

-- Pricing rules per program + calorie tier.
do $$
declare
  fit uuid := (select id from public.programs where code = 'FIT');
  hit uuid := (select id from public.programs where code = 'HIT');
  pro uuid := (select id from public.programs where code = 'PRO');
begin
  insert into public.pricing_rules (program_id, calories, meals_count, price_per_day, is_active) values
    (fit, 1200, 4, 1190, true),
    (fit, 1500, 5, 1390, true),
    (fit, 1800, 5, 1590, true),
    (hit, 1500, 5, 1490, true),
    (hit, 1800, 5, 1690, true),
    (hit, 2000, 6, 1890, true),
    (pro, 1800, 5, 1790, true),
    (pro, 2000, 6, 1990, true),
    (pro, 2500, 6, 2290, true)
  on conflict (program_id, calories) do update
    set meals_count = excluded.meals_count,
        price_per_day = excluded.price_per_day,
        is_active = excluded.is_active;
end $$;

-- Base content texts.
insert into public.content (key, title, value) values
  ('hero_title',    'Заголовок главного экрана', 'Здоровое питание с доставкой на дом'),
  ('hero_subtitle', 'Подзаголовок главного экрана', 'Готовые рационы ФИТ, ХИТ и ПРО. Рассчитайте программу под себя за минуту.'),
  ('hero_cta',      'Кнопка на главном экране', 'Рассчитать рацион'),
  ('calculator_title', 'Заголовок калькулятора', 'Калькулятор питания'),
  ('subscription_hint', 'Пояснение к подписке', 'Регулярная доставка по выбранному графику. Меню и стоимость рассчитываются автоматически.'),
  ('menu_title',    'Заголовок меню на день', 'Меню на день')
on conflict (key) do update
  set title = excluded.title,
      value = excluded.value;

-- Sample dishes.
insert into public.dishes (name, description, category, calories, proteins, fats, carbs, has_fish, sort_order, is_active) values
  ('Овсяная каша с ягодами', 'Цельнозерновая овсянка, сезонные ягоды, мёд.', 'breakfast', 320, 12, 8, 52, false, 1, true),
  ('Омлет с овощами',        'Омлет из двух яиц с томатами и шпинатом.',     'breakfast', 280, 18, 16, 9, false, 2, true),
  ('Куриная грудка с киноа', 'Запечённая грудка, киноа, овощи гриль.',       'lunch',     430, 38, 12, 40, false, 3, true),
  ('Лосось с овощами',       'Филе лосося на пару, брокколи, рис.',          'lunch',     480, 34, 22, 35, true,  4, true),
  ('Говядина с гречкой',     'Тушёная говядина, гречка, салат.',             'dinner',    460, 32, 18, 42, false, 5, true),
  ('Треска с пюре',          'Запечённая треска, картофельное пюре.',        'dinner',    410, 30, 14, 38, true,  6, true),
  ('Греческий йогурт с орехами', 'Натуральный йогурт, грецкий орех, мёд.',   'snack',     210, 14, 11, 16, false, 7, true),
  ('Протеиновый батончик',   'Домашний батончик с орехами и финиками.',      'snack',     230, 12, 9, 27, false, 8, true)
on conflict do nothing;

-- Sample daily meal plan for HIT 1800 kcal.
do $$
declare
  hit uuid := (select id from public.programs where code = 'HIT');
  plan_id uuid;
  d_break uuid := (select id from public.dishes where name = 'Омлет с овощами' limit 1);
  d_lunch uuid := (select id from public.dishes where name = 'Куриная грудка с киноа' limit 1);
  d_dinner uuid := (select id from public.dishes where name = 'Говядина с гречкой' limit 1);
  d_snack uuid := (select id from public.dishes where name = 'Греческий йогурт с орехами' limit 1);
begin
  if not exists (select 1 from public.meal_plans where program_id = hit and calories = 1800) then
    insert into public.meal_plans (program_id, calories, name, is_active, sort_order)
    values (hit, 1800, 'Меню на день', true, 1)
    returning id into plan_id;

    insert into public.meal_plan_items (meal_plan_id, dish_id, meal_type, sort_order) values
      (plan_id, d_break,  'breakfast', 1),
      (plan_id, d_lunch,  'lunch',     2),
      (plan_id, d_dinner, 'dinner',    3),
      (plan_id, d_snack,  'snack',     4);
  end if;
end $$;
