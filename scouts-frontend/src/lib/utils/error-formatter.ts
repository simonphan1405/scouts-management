import { translateField, translateTableName } from "@/lib/i18n";

interface ErrorFormatContext {
  action?: "create" | "update" | "delete" | "read";
  tableName?: string;
}

const TABLE_MAP_VI: Record<string, string> = {
  councils: "Châu",
  districts: "Đạo",
  groups: "Liên đoàn",
  troops: "Đoàn",
  units: "Đội / Bầy",
  sections: "Ngành",
  rankings: "Đẳng thứ",
  members: "Đoàn sinh / Thành viên",
  expenses: "Khoản thu chi",
  religions: "Tôn giáo",
};

function getFriendlyTableName(rawTable: string): string {
  const clean = rawTable.replace(/Collection$/i, "").toLowerCase();
  return TABLE_MAP_VI[clean] || translateTableName(clean);
}

/**
 * Chuyển đổi các thông báo lỗi kỹ thuật cơ sở dữ liệu (PostgreSQL / Supabase / REST)
 * thành thông điệp thân thiện, dễ hiểu cho người dùng thông thường (không phải developer).
 */
export function formatUserFriendlyMessage(
  error: unknown,
  context?: ErrorFormatContext,
): string {
  const rawMsg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error || "");

  if (!rawMsg) {
    return "Đã xảy ra sự cố. Vui lòng kiểm tra lại thông tin hoặc thử lại.";
  }

  const lower = rawMsg.toLowerCase();
  const currentTableTitle = context?.tableName
    ? getFriendlyTableName(context.tableName)
    : "bản ghi";

  // 1. Lỗi ràng buộc khóa ngoại (Foreign key constraint violation)
  // Thường xảy ra khi xóa danh mục cha mà đang có danh mục con trực thuộc liên kết đến
  // Ví dụ: update or delete on table "Councils" violates foreign key constraint "Districts_council_fkey" on table "Districts"
  if (
    lower.includes("violates foreign key constraint") ||
    lower.includes("still referenced from table") ||
    lower.includes("23503")
  ) {
    let referencingEntity = "";
    if (lower.includes("districts") || lower.includes("dao")) {
      referencingEntity = "Đạo";
    } else if (lower.includes("groups") || lower.includes("lien_doan")) {
      referencingEntity = "Liên đoàn";
    } else if (lower.includes("troops") || lower.includes("doan")) {
      referencingEntity = "Đoàn";
    } else if (lower.includes("units") || lower.includes("doi")) {
      referencingEntity = "Đội / Bầy";
    } else if (lower.includes("members") || lower.includes("doan_sinh")) {
      referencingEntity = "Đoàn sinh";
    } else if (lower.includes("expenses") || lower.includes("thu_chi")) {
      referencingEntity = "Khoản chi";
    } else if (lower.includes("rankings") || lower.includes("dang_thu")) {
      referencingEntity = "Đẳng thứ";
    }

    if (context?.action === "delete") {
      if (referencingEntity) {
        return `Không thể xóa ${currentTableTitle} này vì hiện đang có các ${referencingEntity} trực thuộc liên kết đến. Vui lòng chuyển hoặc xóa các ${referencingEntity} này trước khi xóa ${currentTableTitle}.`;
      }
      return `Không thể xóa ${currentTableTitle} này vì dữ liệu đang được liên kết và sử dụng ở danh mục khác. Vui lòng kiểm tra và hủy liên kết trước khi xóa.`;
    }

    if (context?.action === "create" || context?.action === "update") {
      return `Thông tin liên kết không hợp lệ hoặc mục bạn chọn không tồn tại trong hệ thống. Vui lòng chọn lại.`;
    }

    return `Không thể hoàn tất thao tác do dữ liệu này đang có liên kết phụ thuộc trong hệ thống.`;
  }

  // 2. Lỗi trường bắt buộc không được để trống (Not-null constraint)
  // Ví dụ: null value in column "name" of relation "Councils" violates not-null constraint
  if (
    lower.includes("violates not-null constraint") ||
    lower.includes("null value in column") ||
    lower.includes("23502")
  ) {
    const colMatch = rawMsg.match(/column\s+"?([A-Za-z0-9_]+)"?/i);
    const colName = colMatch ? colMatch[1] : "";
    const colLabel = colName ? translateField(colName) : "thông tin bắt buộc";
    return `Thông tin bắt buộc: Vui lòng nhập trường "${colLabel}" trước khi lưu.`;
  }

  // 3. Lỗi trùng lặp dữ liệu (Unique constraint violation)
  // Ví dụ: duplicate key value violates unique constraint
  if (
    lower.includes("violates unique constraint") ||
    lower.includes("duplicate key") ||
    lower.includes("23505")
  ) {
    return `Thông tin bạn vừa nhập đã tồn tại trong hệ thống. Vui lòng kiểm tra lại để tránh trùng lặp.`;
  }

  // 4. Lỗi định dạng dữ liệu không phù hợp (Invalid input syntax)
  if (
    lower.includes("invalid input syntax") ||
    lower.includes("malformed") ||
    lower.includes("invalid format")
  ) {
    return `Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường số, ngày tháng hoặc định dạng chữ.`;
  }

  // 5. Lỗi kết nối mạng hoặc máy chủ không phản hồi
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("không thể kết nối") ||
    lower.includes("load failed") ||
    lower.includes("econnrefused")
  ) {
    return `Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút.`;
  }

  // 6. Lỗi phiên đăng nhập / quyền hạn
  if (
    lower.includes("unauthorized") ||
    lower.includes("jwt") ||
    lower.includes("token")
  ) {
    return `Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục thao tác.`;
  }
  if (lower.includes("forbidden") || lower.includes("permission denied")) {
    return `Bạn không có quyền thực hiện thao tác này trên hệ thống.`;
  }

  // 7. Lỗi bản ghi không tìm thấy (404)
  if (lower.includes("not found") || lower.includes("pgrst116")) {
    return `Bản ghi bạn đang thao tác không tồn tại hoặc đã được xóa trước đó.`;
  }

  // 8. Nếu thông báo vẫn còn chứa các từ khóa kỹ thuật database nội bộ, ẩn đi và thay bằng thông báo dễ hiểu
  if (
    lower.includes("violates") ||
    lower.includes("relation ") ||
    lower.includes("syntax error") ||
    lower.includes("postgres") ||
    lower.includes("supabase") ||
    lower.includes("schema")
  ) {
    return `Hệ thống chưa thể xử lý yêu cầu do ràng buộc dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại các thông tin đã nhập.`;
  }

  return rawMsg;
}
