import AdminResource, { FieldDef } from "@/components/admin/AdminResource";

const fields: FieldDef[] = [
  { key: "days", label: "Дней", type: "number" },
  { key: "discount_percent", label: "Скидка, %", type: "number", step: "0.1" },
  { key: "badge", label: "Плашка", type: "text" },
  { key: "is_default", label: "По умолчанию", type: "boolean" },
  { key: "sort_order", label: "Порядок", type: "number" },
  { key: "is_active", label: "Активно", type: "boolean" },
];

const defaults = {
  days: 0,
  discount_percent: 0,
  badge: "",
  is_default: false,
  sort_order: 0,
  is_active: true,
};

export default function AdminDeliveryPage() {
  return (
    <AdminResource
      resource="delivery-rules"
      title="Доставка — длительности"
      description="Варианты длительности (2 / 4 / 6 / 14 / 30), скидки, плашка («Рассрочка») и дефолт."
      fields={fields}
      defaults={defaults}
    />
  );
}
