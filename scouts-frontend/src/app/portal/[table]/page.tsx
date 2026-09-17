import { DataTable } from "@/components/cms/data-table";

export default async function TablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  return <DataTable tableName={table} />;
}
