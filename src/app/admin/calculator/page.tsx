import AdminResource, { FieldDef } from "@/components/admin/AdminResource";
import { createServiceClient } from "@/lib/supabase/server";
import { Program } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCalculatorPage() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("programs").select("*").order("sort_order");
  const programs = (data ?? []) as Program[];
  const programOptions = programs.map((p) => ({ value: p.id, label: p.name }));

  const fields: FieldDef[] = [
    { key: "program_id", label: "Программа", type: "select", options: programOptions },
    { key: "calories", label: "Калорийность", type: "number" },
    { key: "meals_count", label: "Приёмов пищи", type: "number" },
    { key: "price_per_day", label: "Цена за день", type: "number", step: "0.01" },
    { key: "is_active", label: "Активно", type: "boolean" },
  ];

  const defaults = {
    program_id: programOptions[0]?.value ?? "",
    calories: 0,
    meals_count: 5,
    price_per_day: 0,
    is_active: true,
  };

  return (
    <AdminResource
      resource="pricing-rules"
      title="Калькулятор — тарифы"
      description="Цена за день, калорийность и количество приёмов пищи для каждой программы."
      fields={fields}
      defaults={defaults}
    />
  );
}
