import AdminResource, { FieldDef } from "@/components/admin/AdminResource";

const fields: FieldDef[] = [
  { key: "code", label: "Код", type: "text" },
  { key: "name", label: "Название", type: "text" },
  { key: "description", label: "Описание", type: "textarea" },
  { key: "sort_order", label: "Порядок", type: "number" },
  { key: "is_active", label: "Активно", type: "boolean" },
];

const defaults = { code: "", name: "", description: "", sort_order: 0, is_active: true };

export default function AdminProgramsPage() {
  return <AdminResource resource="programs" title="Программы" fields={fields} defaults={defaults} />;
}
