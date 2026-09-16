export const TABLE_TRANSLATIONS: Record<string, string> = {
  councils: "Châu",
  districts: "Đạo",
  groups: "Liên đoàn",
  troops: "Đoàn",
  units: "Đội",
  sections: "Ngành",
  rankings: "Đẳng thứ",
  religions: "Tôn giáo",
  expenses: "Chi phí",
  members: "Thành viên",
};

export const FIELD_TRANSLATIONS: Record<string, string> = {
  id: "Mã",
  name: "Tên",
  email: "Email",
  phone: "Điện thoại",
  status: "Trạng thái",
  description: "Mô tả",
  created_at: "Ngày tạo",
  updated_at: "Ngày cập nhật",
  title: "Tiêu đề",
  content: "Nội dung",
  role: "Vai trò",
  address: "Địa chỉ",
  type: "Loại",
  start_date: "Ngày bắt đầu",
  end_date: "Ngày kết thúc",
  user_id: "Người dùng",
  founded_date: "Ngày thành lập",
  council: "Châu trực thuộc",
  district: "Đạo trực thuộc",
  group: "Liên đoàn trực thuộc",
  troop: "Đoàn trực thuộc",
  unit: "Đội trực thuộc",
  unit_type: "Loại nhóm",
  level: "Cấp",
  requirement: "Yêu cầu",
  section: "Ngành",
  code: "Mã tôn giáo",
  min_age: "Tuổi tối thiểu",
  max_age: "Tuổi tối đa",
  motto: "Châm ngôn",
  member_id: "Mã thành viên",
  amount: "Số tiền",
  purpose: "Mục đích",
  payment_date: "Ngày thanh toán",
  notes: "Ghi chú",
  full_name: "Họ và tên",
  gender: "Giới tính",
  date_of_birth: "Ngày sinh",
  identification_number: "Số CMND/CCCD",
  religion: "Tôn giáo",
  join_year: "Năm gia nhập",
  promise_year: "Năm tuyên hứa",
  current_section: "Ngành đang sinh hoạt",
  ranking: "Đẳng thứ",
};

export function translateTableName(name: string): string {
  return TABLE_TRANSLATIONS[name.toLowerCase()] || name;
}

export function translateField(field: string): string {
  return FIELD_TRANSLATIONS[field.toLowerCase()] || field.replace(/_/g, " ");
}
