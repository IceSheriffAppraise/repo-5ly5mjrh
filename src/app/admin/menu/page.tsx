import AdminResource, { FieldDef } from "@/components/admin/AdminResource";

const fields: FieldDef[] = [
  { key: "name", label: "Название", type: "text" },
  { key: "description", label: "Описание", type: "textarea" },
  { key: "image_url", label: "Фото", type: "image" },
  {
    key: "category",
    label: "Категория",
    type: "select",
    options: [
      { value: "breakfast", label: "Завтрак" },
      { value: "lunch", label: "Обед" },
      { value: "dinner", label: "Ужин" },
      { value: "snack", label: "Перекус" },
    ],
  },
  { key: "calories", label: "Ккал", type: "number" },
  { key: "proteins", label: "Белки", type: "number", step: "0.1" },
  { key: "fats", label: "Жиры", type: "number", step: "0.1" },
  { key: "carbs", label: "Углеводы", type: "number", step: "0.1" },
  { key: "has_fish", label: "Содержит рыбу", type: "boolean" },
  { key: "sort_order", label: "Порядок", type: "number" },
  { key: "is_active", label: "Активно", type: "boolean" },
];

const defaults = {
  name: "",
  description: "",
  image_url: "",
  category: "lunch",
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
  has_fish: false,
  sort_order: 0,
  is_active: true,
};

export default function AdminMenuPage() {
  return (
    <AdminResource
      resource="dishes"
      title="Меню — блюда"
      description="Загрузите фото с компьютера или телефона. Допустимы JPG, PNG, WEBP до 5 МБ."
      fields={fields}
      defaults={defaults}
    />
  );
}
