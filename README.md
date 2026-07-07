# IED CM Quote Tracker

Ứng dụng web tracking yêu cầu IE/IED phân tích báo giá CM cho ngành sản xuất may. Sale gửi tài liệu qua email, dùng app để tạo request tracking, theo dõi hàng đợi, trạng thái, ETA và phân công IED.

> Tài liệu này phục vụ bàn giao cho team IT phát triển vào hệ thống chính thức. Bản hiện tại là prototype (mock data, state in-memory) để chốt nghiệp vụ và UI/UX.

---

## 1. Mục tiêu nghiệp vụ

- **Giảm hỏi đáp qua chat/email** ("ticket tôi tới đâu rồi?") bằng visibility realtime.
- **Tracking yêu cầu báo giá CM** — không quản lý tài liệu kỹ thuật (techpack/hình ảnh vẫn gửi qua email).
- **Phân công IED** theo Sales team, Team Lead có quyền san tải khi kẹt.
- **Dashboard Manager** theo dõi hiệu suất, demand, tỉ lệ đáp ứng ETA.

## 2. Phạm vi (Scope)

### Có trong bản prototype
- Tạo ticket tracking (Sale).
- Auto-assign IED theo mapping Sales team + Sale.
- Kanban tổng quan cho mọi role.
- Cập nhật trạng thái (IED): Bắt đầu / Chờ bổ sung / Hoàn tất / Tiếp tục.
- Phân lại / đổi priority / sửa ETA / tách request (Team Lead/Manager).
- ETA tự tính theo lịch làm việc × số style.
- Dashboard Manager: pie/line/stacked bar charts, export CSV.
- Phân quyền edit ticket (sale tạo, IED được phân, teamlead, manager, admin).
- Sidebar collapse/expand.
- Notification in-app.

### Chưa có (cần team IT xây tiếp)
- Backend API thật + database.
- Xác thực SSO (Keycloak / Microsoft Entra ID).
- Upload file/hình/techpack.
- Tích hợp email thread tự động.
- WebSocket realtime (đang dùng polling 15s).
- Tính toán CM trong app.
- Tích hợp ERP/PLM.
- Report nâng cao & lịch sử chi tiết.
- Mobile app.

---

## 3. Vai trò người dùng (Roles)

| Role | Mô tả |
|---|---|
| **Sale** | Tạo ticket, xem Kanban + danh sách yêu cầu của mình (có search) |
| **IED Staff** | Xem hàng đợi cá nhân, cập nhật trạng thái ticket được phân |
| **Team Lead** | Phân bổ/san tải việc, reassign, sửa ETA/priority, tách request, export CSV |
| **Manager** | Dashboard charts hiệu suất & demand, export CSV |
| **Admin** | Quản lý tài khoản, Sales team, mapping Sale-IED, quy tắc ETA |

## 4. Quyền edit ticket

| Ai được sửa | Điều kiện |
|---|---|
| Sale (người tạo) | Được sửa ticket mình tạo |
| IED (được phân công) | Được cập nhật trạng thái ticket được phân |
| Team Lead / Manager / Admin | Được sửa mọi ticket |

> **Quyền xem**: tất cả role đều xem được nội dung ticket (email ref, note). Chỉ **edit** mới bị giới hạn.

---

## 5. Trạng thái ticket (Status flow)

```
Submitted → Assigned → In Progress → Completed
                 ↘ Waiting Info ↗ (Resume)
```

| Status | Ý nghĩa |
|---|---|
| Submitted | Sale vừa tạo, chờ phân công (nếu không match mapping) |
| Assigned | Đã có IED phụ trách, chờ xử lý |
| In Progress | IED đang phân tích |
| Waiting Info | IED cần Sale bổ sung thông tin qua email |
| Completed | IED đã hoàn tất |
| Cancelled | Hủy ticket |

## 6. Ưu tiên (Priority)

Chỉ 2 mức:
- **Khẩn cấp (Urgent)** — xử lý trước
- **Bình thường (Normal)**

Nguyên tắc xếp hàng: **FCFS** (first come first serve) trong cùng mức ưu tiên, theo thời gian tạo.

---

## 7. Ticket fields

| Field | Loại | Bắt buộc | Ghi chú |
|---|---|---|---|
| Buyer | text | ✅ | Khách hàng |
| Số lượng style | number | ✅ | Số style trong request (dùng tính ETA) |
| Sales team | dropdown | ✅ | AGS1/AGS2/WGS1/WGS2 (config được) |
| Loại yêu cầu | dropdown | ✅ | Báo giá mới / Hiệu chỉnh |
| Ưu tiên | dropdown | ✅ | Khẩn cấp / Bình thường |
| Ngày mong muốn | date | ✅ | Sale expected date |
| Email Ref | text | ✅ | Subject/thread email đã gửi tài liệu |
| Note | textarea | ❌ | Ghi chú ngắn |

> Không có field Loại sản phẩm (đã bỏ). Không upload file.

## 8. ETA calculation

```
ETA = (phút/style × số lượng style) + thời gian chờ các ticket trước trong queue
```

- Tính theo **giờ làm việc** (không tính nghỉ trưa, cuối tuần).
- Lịch làm việc: T2–T6, 08:00–11:30 & 12:30–17:00 (nghỉ T7, CN).
- Team Lead có thể **sửa ETA thủ công** (override).
- ETA hiển thị dạng "khoảng HH:mm ngày DD/MM".

Quy tắc ETA (phút/**1 style**):

| Loại yêu cầu | Bình thường | Khẩn cấp |
|---|---:|---:|
| Báo giá mới | 240 | 120 |
| Hiệu chỉnh | 120 | 60 |

> Cấu hình được trong Admin → Quy tắc ETA.

---

## 9. Phân công (Assignment)

### Mapping Sales team + Sale → IED
| Sales team | Sale | Default IED | Team Lead |
|---|---|---|---|
| AGS1 | Sale A | IED 01 | Lead 01 |
| AGS2 | Sale B | IED 02 | Lead 01 |

- Khi Sale tạo ticket: match mapping → **auto-assign** IED.
- Không match → vào cột **Chưa phân**, Team Lead phân thủ công.
- Team Lead có quyền **reassign** khi IED bị kẹt.

### Tách request (Split)
- Ticket có nhiều style (>1) → Team Lead/Manager có thể **tách** thành nhiều request con.
- Modal chia số style theo ý team lead (tổng phải khớm).

---

## 10. Screens chính

1. **Login** — đăng nhập tài khoản riêng + đăng nhập nhanh (prototype)
2. **Kanban Tổng quan** (mọi role) — cột theo IED + Chưa phân; đơn của Sale đang login được highlight xanh
3. **Sale: Yêu cầu của tôi** — danh sách + search box
4. **Sale: Tạo yêu cầu** — form tạo ticket
5. **IED: Hàng đợi của tôi** — queue cá nhân + quick actions
6. **Team Lead: Tải việc IED** — workload cards + Kanban board + export CSV
7. **Manager: Dashboard** — pie/line/stacked bar charts + export CSV
8. **Admin: Tài khoản / Sales team / Phân công / Quy tắc ETA**
9. **Ticket Detail** — chi tiết + timeline + actions (status/reassign/priority/ETA/split)

## 11. Dashboard Manager (charts)

- **Pie**: tỉ lệ đáp ứng ETA (đúng/trễ)
- **Pie**: tỉ lệ đáp ứng ngày sale expected
- **Line**: xu hướng request tạo mới vs hoàn tất (theo ngày/tháng)
- **Stacked bar**: demand theo Sales team / Sale / IED (hoàn tất + đang chờ + chờ bổ sung + khẩn cấp)
- **Pie**: phân bố trạng thái
- Lọc theo 24h / 30 ngày / 1 năm
- **Export CSV** (Manager + Team Lead)

---

## 12. Tech stack (prototype hiện tại)

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Data | Mock data in-memory (state) |
| Routing | State-based (không dùng URL) |
| Realtime | Polling 15s |

### Đề xuất tech stack cho bản chính thức

| Layer | Đề xuất |
|---|---|
| Frontend | Next.js / React + TypeScript |
| Backend | ASP.NET Core / NestJS |
| Database | SQL Server / PostgreSQL |
| Auth | Keycloak / Microsoft Entra ID (SSO) |
| Realtime | WebSocket / Server-Sent Events |
| File storage | SharePoint / S3-compatible |
| Charts | Recharts / ECharts |

## 13. Data model (sơ bộ)

```
users (id, full_name, email, password_hash, role, sales_team, active, ...)
roles
sales_teams (config dynamic)
sale_ied_mappings (sales_team, sale_user_id, default_ied_user_id, team_lead_user_id, active)
tickets (ticket_no, buyer, style_no, sales_team, request_type, priority, status,
         sale_user_id, assigned_ied_id, team_lead_id, email_ref, note, expected_date,
         eta_at, manual_eta_at, queue_entered_at, started_at, waiting_info_at,
         completed_at, created_at, ...)
ticket_status_history
ticket_assignment_history
ticket_split_history (gốc + các ticket con)
eta_rules (request_type, priority, estimated_minutes_per_style)
notifications
audit_logs
```

---

## 14. Chạy prototype

```bash
npm install
npm run dev      # dev server http://127.0.0.1:5180
npm run build    # production build → dist/
```

### Tài khoản demo (mock)
| Role | Email |
|---|---|
| Admin | admin@company.com |
| Team Lead | lead01@company.com |
| Manager | manager@company.com |
| IED | ied01@company.com |
| Sale | sale_ags1@company.com |

Password bất kỳ. Hoặc bấm **Đăng nhập nhanh** trên trang login.

---

## 15. Deploy Netlify

Đã có `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- Node 20

---

## 16. Câu hỏi cần chốt với team IT

1. Hệ thống auth công ty dùng gì? (Keycloak / AD / Entra ID)
2. Backend stack công ty ưu tiên? (.NET / Node)
3. Database chuẩn công ty? (SQL Server / PostgreSQL)
4. Có cần tích hợp email tự động (lấy thread email ref)?
5. Có cần phân quyền theo buyer/customer không?
6. Working calendar có cố định hay config theo nhà máy?
7. Có cần đa ngôn ngữ Việt/Anh không?
8. Có cần mobile app native không, hay responsive web là đủ?
9. Mức tiêu tỉ lệ đáp ứng ETA (SLA) mong muốn là bao nhiêu %?
10. Có cần lưu version/quy tắc ETA theo thời gian (historical config) không?

---

*Bản prototype phát triển bởi opencode — bàn giao cho team IT phát triển hệ thống chính thức.*
