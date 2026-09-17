import { ScoutsDashboard } from "@/components/cms/dashboard/scouts-dashboard";

export const metadata = {
  title: "Scouts Management | Bảng Điều Hành Hướng Đạo",
  description: "Hệ thống quản lý đoàn sinh, các ngành sinh hoạt, đơn vị tổ chức và dữ liệu phong trào Hướng Đạo.",
};

export default function CmsIndexPage() {
  return <ScoutsDashboard />;
}
