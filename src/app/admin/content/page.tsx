import AdminResource, { FieldDef } from "@/components/admin/AdminResource";

const fields: FieldDef[] = [
  { key: "key", label: "Ключ", type: "text" },
  { key: "title", label: "Описание", type: "text" },
  { key: "value", label: "Текст", type: "textarea" },
];

const defaults = { key: "", title: "", value: "" };

export default function AdminContentPage() {
  return (
    <AdminResource
      resource="content"
      title="Тексты сайта"
      description="Базовые тексты главного экрана и калькулятора."
      fields={fields}
      defaults={defaults}
    />
  );
}
