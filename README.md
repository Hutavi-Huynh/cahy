# CAHY - Hệ thống quản lý công việc nội bộ

Hệ thống quản lý, theo dõi và đôn đốc thực hiện công việc nội bộ qua mạng LAN Công an tỉnh.

## Cấu trúc dự án

```
ManagementSystemCAT/
├── backend/           # NestJS + TypeScript + PostgreSQL
└── frontend/          # React 19 + TypeScript + shadcn/ui + oxlint
```

## Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Cài đặt và chạy

### 1. Cài dependencies

```bash
npm install                  # root
npm install --prefix backend
npm install --prefix frontend
```

### 2. Cấu hình backend

```bash
cp backend/.env.example backend/.env
# Chỉnh sửa backend/.env theo cấu hình PostgreSQL của bạn
```

### 3. Tạo database

```sql
CREATE DATABASE cahy_db;
```

### 4. Chạy development

```bash
# Chạy cả backend và frontend
npm run dev

# Hoặc chạy riêng
npm run dev -w backend      # http://localhost:3001
npm run dev -w frontend     # http://localhost:5173
```

### 5. Swagger API Docs

Truy cập: `http://localhost:3001/api/docs`

## Tài khoản mặc định

Tạo tài khoản admin đầu tiên qua Swagger hoặc trực tiếp vào database.

## Phân quyền

| Quyền | Chức năng |
|-------|-----------|
| `admin` | Quản trị toàn hệ thống, giao việc, báo cáo |
| `unit_lead` | Xem và cập nhật kết quả công việc |
| `unit_member` | Xem và cập nhật kết quả công việc |

## Tính năng

- ✅ Quản lý đơn vị (phòng, ban)
- ✅ Quản lý tài khoản và phân quyền
- ✅ Tạo và giao việc (Admin)
- ✅ Cập nhật tiến độ và kết quả thực hiện
- ✅ Theo dõi trạng thái: Chưa thực hiện / Đang thực hiện / Hoàn thành / Quá hạn
- ✅ Nhắc việc và thông báo
- ✅ Báo cáo thống kê, xuất báo cáo quá hạn
- ✅ Lọc công việc theo trạng thái, đơn vị, thời hạn
