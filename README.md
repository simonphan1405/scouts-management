# ⚜️ Scouts Management (Hệ Thống Quản Lý Hướng Đạo)

Hệ thống quản trị và quản lý thông tin toàn diện dành cho các đơn vị Hướng đạo, hỗ trợ theo dõi cơ cấu tổ chức, thành viên, ngành sinh hoạt, đẳng thứ, chức vụ và thu chi.

---

## 📌 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc & Công Nghệ](#-kiến-trúc--công-nghệ)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
  - [Cách 1: Chạy bằng Docker Compose (Khuyến nghị)](#cách-1-chạy-bằng-docker-compose-khuyến-nghị)
  - [Cách 2: Chạy trực tiếp trên máy (Development)](#cách-2-chạy-trực-tiếp-trên-máy-development)
- [Cấu Hình Biến Môi Trường](#-cấu-hình-biến-môi-trường)
- [Cơ Sở Dữ Liệu](#-cơ-sở-dữ-liệu)

---

## 📖 Giới Thiệu

**Scouts Management** được xây dựng nhằm giải quyết bài toán quản lý hồ sơ đoàn sinh và huynh trưởng, cơ cấu tổ chức đa cấp từ cấp Đội, Đoàn, Liên đoàn đến Đạo, Châu. Hệ thống cung cấp giao diện quản trị trực quan, linh hoạt cùng với API mạnh mẽ và bảo mật.

---

## ✨ Tính Năng Chính

- **Quản lý Tổ chức phân cấp**:
  - Quản lý Châu (`councils`), Đạo (`districts`), Liên đoàn (`groups`), Đoàn (`troops`), Đội/Tuần (`units`).
- **Quản lý Thành viên**:
  - Thông tin cá nhân, ngày sinh, giới tính, CCCD, tôn giáo.
  - Quản lý niên khóa sinh hoạt, năm tuyên hứa.
  - Quản lý trách vụ tương ứng theo từng cấp tổ chức.
- **Ngành & Đẳng thứ**:
  - Phân loại ngành sinh hoạt (Ấu, Thiếu, Kha, Tráng, v.v.).
  - Theo dõi lộ trình tiến bước và đẳng thứ của từng thành viên.
- **Quản lý Thu Chi & Tài chính**:
  - Ghi nhận và theo dõi các khoản thu chi hoạt động (`expenses`).
- **Giao diện Portal / CMS thông minh**:
  - Bảng điều khiển (Dashboard) trực quan.
  - Tìm kiếm thông minh hỗ trợ bỏ dấu tiếng Việt.
  - Sidebar có khả năng điều chỉnh kích thước linh hoạt (Resizable Sidebar).
  - Tương thích tốt trên cả máy tính và thiết bị di động (Responsive).
- **Xác thực & Phân quyền**:
  - Tích hợp Supabase Auth hỗ trợ đăng nhập và phân quyền an toàn.

---

## 🛠 Kiến Trúc & Công Nghệ

### 1. Frontend (`scouts-frontend`)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Ngôn ngữ**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: Radix UI, Lucide Icons, Shadcn UI patterns
- **Package Manager**: `pnpm`

### 2. Backend (`scouts-backend`)

- **Framework**: [NestJS 11](https://nestjs.com/)
- **Ngôn ngữ**: TypeScript
- **Database & Auth Integration**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Architecture**: Modular Monolith với REST API endpoints

### 3. Database & Deployment

- **Database**: PostgreSQL (quản lý qua Supabase)
- **Containerization**: Docker, Docker Compose (Multi-stage build tối ưu cho Next.js Standalone và NestJS)

---

## 📂 Cấu Trúc Thư Mục

```text
scouts/
├── database/                   # Thiết kế CSDL và tài liệu ERD
│   ├── ERD/                    # Sơ đồ quan hệ thực thể
│   └── scouts.sql              # Script DDL khởi tạo cơ sở dữ liệu
├── scouts-backend/             # Ứng dụng backend (NestJS)
│   ├── src/
│   │   ├── auth/               # Module xác thực
│   │   ├── dashboard/          # Thống kê số liệu dashboard
│   │   ├── supabase/           # Tích hợp Supabase Client
│   │   ├── tables/             # API xử lý các bảng dữ liệu
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile              # Dockerfile multi-stage cho backend
│   └── package.json
├── scouts-frontend/            # Ứng dụng frontend (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router (pages & layouts)
│   │   │   ├── portal/         # Trang quản trị CMS
│   │   │   └── login/          # Trang đăng nhập
│   │   ├── components/         # UI components & CMS widgets
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # API client, Supabase config, utilities
│   ├── Dockerfile              # Dockerfile multi-stage (Standalone output)
│   ├── next.config.ts
│   └── package.json
├── docker-compose.yml          # Cấu hình khởi chạy toàn bộ dịch vụ
├── .env.example                # Mẫu biến môi trường cho Docker
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 🚀 Cài Đặt & Khởi Chạy

### Yêu cầu tiên quyết

- [Node.js](https://nodejs.org/) (phiên bản 20.x hoặc 22.x LTS)
- [pnpm](https://pnpm.io/) (phiên bản 9 hoặc 10)
- [Docker](https://www.docker.com/) & Docker Compose (nếu chạy container)

---

### Cách 1: Chạy bằng Docker Compose (Khuyến nghị)

Chỉ cần một lệnh để khởi động đồng thời cả frontend và backend:

1. **Chuẩn bị file cấu hình môi trường**:

   ```bash
   cp .env.example .env
   ```

   _Cập nhật các thông tin Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) trong `.env`._

2. **Khởi chạy container**:

   ```bash
   docker compose up -d --build
   ```

3. **Truy cập ứng dụng**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3001](http://localhost:3001)

4. **Xem logs hoặc dừng dịch vụ**:

   ```bash
   # Xem logs
   docker compose logs -f

   # Dừng dịch vụ
   docker compose down
   ```

---

### Cách 2: Chạy trực tiếp trên máy (Development)

#### 1. Khởi động Backend

```bash
cd scouts-backend

# Sao chép và cấu hình biến môi trường
cp .env.example .env

# Cài đặt dependencies
pnpm install

# Chạy backend ở chế độ watch
pnpm run start:dev
```

Backend sẽ lắng nghe tại: `http://localhost:3001`.

#### 2. Khởi động Frontend

Mở một cửa sổ terminal mới:

```bash
cd scouts-frontend

# Cài đặt dependencies
pnpm install

# Chạy frontend ở chế độ dev
pnpm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`.

---

## ⚙️ Cấu Hình Biến Môi Trường

### Root `.env` (Dùng cho Docker Compose)

| Tên biến                    | Mô tả                                         | Mặc định                |
| :-------------------------- | :-------------------------------------------- | :---------------------- |
| `BACKEND_PORT`              | Cổng công khai của Backend container          | `3001`                  |
| `FRONTEND_PORT`             | Cổng công khai của Frontend container         | `3000`                  |
| `SUPABASE_URL`              | URL kết nối tới dự án Supabase                | -                       |
| `SUPABASE_ANON_KEY`         | Supabase Public / Anon API Key                | -                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Service Role Key (Admin)      | -                       |
| `NEXT_PUBLIC_API_URL`       | Địa chỉ Backend API mà client browser gọi đến | `http://localhost:3001` |

---

## 🗄 Cơ Sở Dữ Liệu

- File script khởi tạo schema nằm tại: [`database/scouts.sql`](file:///Users/hieuphan/web-development/projects/scouts/database/scouts.sql).
- Sơ đồ thực thể liên kết (ERD) nằm trong thư mục: [`database/ERD`](file:///Users/hieuphan/web-development/projects/scouts/database/ERD).
- Các bảng chính bao gồm:
  - `CHAU`, `DAO`, `LIEN_DOAN`, `DOAN`, `DOI` (Cơ cấu tổ chức)
  - `MEMBERS` (Thông tin thành viên)
  - `NGANH`, `DANG_THU`, `TRACH_VU` (Phân ngành, đẳng thứ và trách vụ)
  - `TON_GIAO`, `EXPENSES` (Tôn giáo, Thu chi)

---

## 📄 Bản Quyền

Dự án phát triển cho mục đích quản lý sinh hoạt Hướng đạo. Mọi đóng góp và phản hồi xin vui lòng tạo issue hoặc pull request.
