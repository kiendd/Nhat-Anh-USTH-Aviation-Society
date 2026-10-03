# USTH Aviation Society

Website câu lạc bộ hàng không USTH: backend Spring Boot (REST API + JWT) và frontend
HTML/CSS/JS thuần được phục vụ trực tiếp từ thư mục `static`.

| Thành phần | Công nghệ |
|---|---|
| Backend | Spring Boot 4.1, Java 17, Maven |
| Database | MySQL 8 |
| Xác thực | JWT (HS256) + BCrypt |
| Frontend | HTML/CSS/JS thuần trong `src/main/resources/static` |
| Triển khai | Docker / Docker Compose |

---

## 1. Chạy nhanh bằng Docker Compose

```bash
docker compose up -d --build
```

Mở trình duyệt: <http://localhost:8080>

Lệnh hữu ích:

```bash
docker compose ps                 # trạng thái các service
docker compose logs -f backend    # xem log backend
docker compose down               # dừng (giữ dữ liệu)
docker compose down -v            # dừng và xoá toàn bộ dữ liệu
```

Stack gồm 2 service:

- `mysql` — MySQL 8, dữ liệu lưu ở volume `mysql-data`, cổng host `3307`.
- `backend` — build từ `Dockerfile`, cổng host `8080`, file upload lưu ở volume `uploads-data`.

`backend` chỉ khởi động sau khi `mysql` báo healthy, nên không cần chờ thủ công.

> Nếu máy đã có container tên `usth-mysql` / `usth-backend` từ trước, xoá chúng trước:
> `docker rm -f usth-mysql usth-backend`

---

## 2. Cấu hình

Toàn bộ cấu hình đọc từ biến môi trường, có giá trị mặc định trong
`src/main/resources/application.properties`. Không cần sửa code để đổi cấu hình.

### 2.1. Cách cấp biến môi trường

**Cách A — file `.env` (khuyến nghị khi dùng Docker Compose):**

```bash
cp .env.example .env
# sửa .env theo môi trường của bạn
docker compose up -d
```

Docker Compose tự đọc `.env` cùng thư mục. File `.env` đã được `.gitignore` bỏ qua.

**Cách B — biến môi trường trực tiếp (khi chạy local):**

```bash
export DB_PASSWORD=secret
export SERVER_PORT=8080
./mvnw spring-boot:run
```

### 2.2. Bảng biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `SERVER_PORT` | `8080` | Cổng HTTP của backend |
| `DB_HOST` | `localhost` | Host MySQL (`mysql` khi chạy trong compose) |
| `DB_PORT` | `3307` | Cổng MySQL (`3306` khi chạy trong compose) |
| `DB_NAME` | `usth_aviation` | Tên database |
| `DB_USERNAME` | `root` | Tài khoản MySQL |
| `DB_PASSWORD` | `HAILONG_DEV` | Mật khẩu MySQL |
| `JPA_DDL_AUTO` | `update` | Chế độ tạo bảng của Hibernate (`update`, `validate`, `none`) |
| `JPA_SHOW_SQL` | `true` (local), `false` (compose) | In câu SQL ra log |
| `UPLOAD_DIR` | `uploads` (local), `/app/uploads` (compose) | Thư mục lưu file upload |
| `JWT_SECRET` | chuỗi mẫu | Khoá ký JWT, **≥ 32 ký tự**, phải đổi khi triển khai thật |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn token (ms), mặc định 24 giờ |
| `CORS_ALLOWED_ORIGINS` | `*` | Danh sách origin được phép gọi API, phân tách bằng dấu phẩy |

Ví dụ giới hạn CORS cho một domain cụ thể:

```bash
CORS_ALLOWED_ORIGINS=https://usth-aviation.example.com,http://localhost:5500
```

Lưu ý: trong `docker-compose.yml`, `DB_PORT` của service `backend` được đặt cứng là `3306`
(cổng nội bộ container MySQL), còn `DB_PORT` trong `.env` là cổng mở ra host.

### 2.3. Cấu hình frontend

Frontend đọc cấu hình từ `src/main/resources/static/config.js`:

```javascript
window.APP_CONFIG = {
    apiBase: "",          // "" = same-origin (mặc định khi Spring Boot phục vụ frontend)
    uploadBase: "/uploads/"
};
```

- **Chạy mặc định** (Spring Boot phục vụ cả frontend): để `apiBase: ""`.
- **Frontend chạy ở host/port khác** (ví dụ Live Server ở `:5500`): đặt
  `apiBase: "http://localhost:8080"`, và thêm origin đó vào `CORS_ALLOWED_ORIGINS`.

`config.js` được nạp trước các script khác trong `kienthuc.html`, `meme.html`,
`tintuc.html`, `quanlybaivietadmin.html`.

### 2.4. Cấu hình upload

- Thư mục lưu file: `UPLOAD_DIR`, chia thành `images/` và `pdf/`.
- File được phục vụ tại `/uploads/**`.
- Giới hạn kích thước: file tối đa **5MB**, request tối đa **10MB**
  (`spring.servlet.multipart.*` trong `application.properties`).
- Trong Docker, `UPLOAD_DIR=/app/uploads` gắn với volume `uploads-data` nên file
  không mất khi restart container.

---

## 3. Chạy local không dùng Docker

**Yêu cầu:** JDK 17+ và MySQL 8.

```bash
# 1. MySQL (ví dụ bằng Docker)
docker run -d --name usth-mysql \
  -e MYSQL_ROOT_PASSWORD=HAILONG_DEV \
  -e MYSQL_DATABASE=usth_aviation \
  -p 3307:3306 mysql:8.0

# 2. Trỏ JAVA_HOME nếu máy chưa có java trên PATH (macOS + Homebrew)
export JAVA_HOME=/opt/homebrew/opt/openjdk

# 3. Chạy
chmod +x mvnw
./mvnw spring-boot:run
```

Ứng dụng tự tạo bảng nhờ `JPA_DDL_AUTO=update`, không cần chạy script SQL thủ công.

---

## 4. API chính

| Method | Đường dẫn | Ghi chú |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản (`member`) |
| POST | `/api/auth/login` | Trả về JWT + thông tin user |
| POST | `/api/auth/register-admin` | Chỉ tài khoản `ROOT` gọi được |
| GET | `/api/diendan/bai-dang` | Danh sách bài viết diễn đàn |
| GET | `/api/diendan/bai-dang/{id}` | Chi tiết bài viết |
| GET | `/api/diendan/the-loai/{theLoai}` | Bài viết theo thể loại |
| GET | `/api/diendan/user/{userId}` | Bài viết của một user |
| POST | `/api/diendan/dang-bai` | Đăng bài (multipart, cần `Authorization: Bearer <token>`) |
| PUT | `/api/diendan/trang-thai/{id}` | Cập nhật trạng thái bài |
| DELETE | `/api/diendan/{id}` | Xoá bài |
| GET | `/api/diendan/admin` | Danh sách bài quản trị |
| GET | `/api/diendan/admin/the-loai/{theLoai}` | Bài quản trị theo thể loại |
| POST | `/api/diendan/admin/dang-bai` | Đăng bài quản trị (PDF + ảnh, cần token) |
| GET | `/api/gopy` | Danh sách góp ý |
| POST | `/api/gopy` | Gửi góp ý |
| GET | `/api/users` | Danh sách người dùng |

Phân quyền: `member` (mặc định) · `ADMIN` · `ROOT`.

---

## 5. Xử lý sự cố

**Mở `localhost:8080` báo "Whitelabel Error Page" 404**
Trang chủ của site là `home.html` (không có `index.html`). Backend đã cấu hình
redirect `/` → `/home.html` trong `WebConfig`. Nếu vẫn thấy 404, thử hard-reload
trình duyệt (cache), hoặc mở trực tiếp <http://localhost:8080/home.html>.

**Backend không kết nối được database**
Kiểm tra `DB_HOST` / `DB_PORT` / `DB_PASSWORD`. Khi chạy trong compose, host phải là
tên service `mysql` và port `3306`, không phải `localhost:3307`.

**Cổng đã bị chiếm**
Đổi `SERVER_PORT` trong `.env` (ví dụ `8090`), sau đó `docker compose up -d`.

**Lỗi CORS khi gọi API từ domain khác**
Thêm origin vào `CORS_ALLOWED_ORIGINS`, phân tách bằng dấu phẩy.

**Không tìm thấy JDK**
`Unable to locate a Java Runtime` — đặt `JAVA_HOME`, ví dụ
`export JAVA_HOME=/opt/homebrew/opt/openjdk`.

---

## 6. Lưu ý bảo mật khi triển khai

Các giá trị mặc định trong repo chỉ dùng cho môi trường phát triển. Trước khi
triển khai thật, **bắt buộc** thay bằng biến môi trường:

- `DB_PASSWORD` — mật khẩu MySQL mạnh.
- `JWT_SECRET` — chuỗi ngẫu nhiên ≥ 32 ký tự.
- `CORS_ALLOWED_ORIGINS` — giới hạn đúng domain thay vì `*`.
- `JPA_DDL_AUTO` — đặt `validate` hoặc `none` thay vì `update`.
