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

## 1. Chạy bằng Docker Compose

Dự án chạy công khai tại **<https://usth.laviehanoi.com>**, phía sau nginx trên server.
Repo có hai cách chạy, chọn theo môi trường.

### 1.1. Trên server (dùng MySQL có sẵn)

Server đã có container MySQL tên `web_mysql`. `docker-compose.yml` **không** khởi động
MySQL riêng, chỉ chạy `backend` (container tên `web_usth`) và nối vào network dùng chung
với nginx.

```bash
# Network dùng chung phải tồn tại (kiểm tra tên thật: docker network ls)
docker network inspect kien_webnet >/dev/null 2>&1 || docker network create kien_webnet

docker compose up -d --build
```

Stack gồm 1 service:

- `backend` — build từ `Dockerfile`, container name `web_usth`, file upload ở volume
  `uploads-data`, tham gia network ngoài để nối tới `web_mysql:3306`.

Cấu hình DB mặc định đã trỏ sẵn: `DB_HOST=web_mysql`, `DB_PORT=3306`.
Cổng `8090` chỉ bind vào `127.0.0.1` trên server (debug nội bộ), truy cập công khai
đi qua nginx.

> **Lưu ý quan trọng**: `DB_PORT=3306` là cổng **nội bộ** của container MySQL.
> Cổng map ra host (ví dụ `3307`) chỉ dùng khi nối từ ngoài Docker.

#### Nginx cho subdomain

Config mẫu nằm ở `deploy/nginx-usth.conf`. Deploy trên server:

```bash
sudo cp deploy/nginx-usth.conf /etc/nginx/user_conf.d/usth.laviehanoi.com.conf
sudo nginx -t && sudo systemctl reload nginx
```

Config proxy `http://web_usth:8090` và truyền `Host`, `X-Real-IP`, `X-Forwarded-*`.
Backend đọc các header này nhờ `server.forward-headers-strategy=framework`.

#### DNS

Trỏ bản ghi `A` (hoặc `CNAME`) cho `usth.laviehanoi.com` về IP server. Nếu dùng
Cloudflare, thêm subdomain vào cùng zone `laviehanoi.com`.

### 1.2. Chạy local (kèm MySQL riêng)

Thêm file override để tự dựng MySQL, không cần MySQL có sẵn:

```bash
docker network inspect kien_webnet >/dev/null 2>&1 || docker network create kien_webnet

docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Lúc này có 2 service: `mysql` (MySQL 8, cổng host `3307`, volume `mysql-data`) và
`backend` (chờ `mysql` healthy rồi mới khởi động). Cổng `8090` mở ra host để truy cập
từ trình duyệt; CORS mặc định `*`.

### 1.3. Lệnh hữu ích

```bash
docker compose ps                 # trạng thái các service
docker compose logs -f backend    # xem log backend
docker compose down               # dừng (giữ dữ liệu)
docker compose down -v            # dừng và xoá toàn bộ dữ liệu (cả volume uploads)
```

- Local: <http://localhost:8090>
- Server: <https://usth.laviehanoi.com>

> Nếu máy đã có container tên `web_usth` / `usth-mysql` từ trước, xoá trước khi `up`:
> `docker rm -f web_usth usth-mysql`

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
export SERVER_PORT=8090
./mvnw spring-boot:run
```

### 2.2. Bảng biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `SERVER_PORT` | `8090` | Cổng HTTP trong container |
| `HOST_PORT` | `8090` | Cổng map ra host (server bind `127.0.0.1`, local mở ra ngoài) |
| `DB_HOST` | `web_mysql` | Host MySQL; trên server là tên container trong network `kien_webnet` |
| `DB_PORT` | `3306` | Cổng **nội bộ** container MySQL (không phải cổng map ra host) |
| `DB_NAME` | `usth_aviation` | Tên database |
| `DB_USERNAME` | `root` | Tài khoản MySQL |
| `DB_PASSWORD` | `HAILONG_DEV` | Mật khẩu MySQL |
| `MYSQL_HOST_PORT` | `3307` | Chỉ dùng với `docker-compose.local.yml`: cổng MySQL riêng map ra host |
| `JPA_DDL_AUTO` | `update` | Chế độ tạo bảng của Hibernate (`update`, `validate`, `none`) |
| `JPA_SHOW_SQL` | `true` (local), `false` (compose) | In câu SQL ra log |
| `UPLOAD_DIR` | `uploads` (local), `/app/uploads` (compose) | Thư mục lưu file upload |
| `JWT_SECRET` | chuỗi mẫu | Khoá ký JWT, **≥ 32 ký tự**, phải đổi khi triển khai thật |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn token (ms), mặc định 24 giờ |
| `CORS_ALLOWED_ORIGINS` | `*` | Danh sách origin được phép gọi API, phân tách bằng dấu phẩy |

Giá trị mặc định trong `application.properties` (khi chạy `./mvnw spring-boot:run` trực tiếp)
là `DB_HOST=localhost`, `DB_PORT=3307`. Compose ghi đè thành `web_mysql:3306`.

Ví dụ giới hạn CORS cho một domain cụ thể:

```bash
CORS_ALLOWED_ORIGINS=https://usth-aviation.example.com,http://localhost:5500
```

**Phân biệt cổng host và cổng nội bộ** — đây là chỗ dễ cấu hình sai nhất:

| Backend chạy ở đâu | `DB_HOST` | `DB_PORT` |
|---|---|---|
| Trong compose (network `kien_webnet`) | `web_mysql` | `3306` |
| Ngoài Docker, MySQL map ra host | `localhost` | cổng map ra host (ví dụ `3307`) |
| Trên máy khác trong LAN | IP/hostname máy đó | cổng MySQL thật (thường `3306`) |

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
  `apiBase: "http://localhost:8090"`, và thêm origin đó vào `CORS_ALLOWED_ORIGINS`.

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

**Mở `localhost:8090` báo "Whitelabel Error Page" 404**
Trang chủ của site là `home.html` (không có `index.html`). Backend đã cấu hình
redirect `/` → `/home.html` trong `WebConfig`. Nếu vẫn thấy 404, thử hard-reload
trình duyệt (cache), hoặc mở trực tiếp <http://localhost:8090/home.html>.

**Backend không kết nối được database**
Kiểm tra `DB_HOST` / `DB_PORT` / `DB_PASSWORD`. Backend trong compose phải dùng
`DB_HOST=web_mysql` (tên container MySQL trong network `kien_webnet`) và `DB_PORT=3306`,
không phải `localhost:3307`.

Kiểm tra theo thứ tự:

```bash
# 1. Backend có tham gia network kien_webnet không
docker inspect web_usth --format '{{json .NetworkSettings.Networks}}'

# 2. Từ trong backend, TCP tới MySQL có thông không
docker exec -it web_usth bash -c 'exec 3<>/dev/tcp/web_mysql/3306 && echo "OK"'

# 3. MySQL có thấy kết nối / user có quyền từ container không
docker exec -it web_mysql mysql -uroot -p -e "SELECT user, host FROM mysql.user;"

# 4. Log backend
docker compose logs backend | grep -iE "hikari|communications|access denied"
```

Nếu bước 2 lỗi `Network is unreachable` hoặc không resolve được tên: container
`web_mysql` không nằm cùng network `kien_webnet` với backend. Kiểm tra:

```bash
docker network inspect kien_webnet --format '{{range .Containers}}{{.Name}} {{end}}'
```

Nếu bước 3 cho thấy user chỉ có `host = localhost`, tạo user cho phép nối từ container:

```sql
CREATE USER 'app'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON usth_aviation.* TO 'app'@'%';
FLUSH PRIVILEGES;
```

rồi đặt `DB_USERNAME=app`, `DB_PASSWORD=<password>` trong `.env`.

**Cổng đã bị chiếm**
Mặc định dự án dùng `8090` để tránh trùng phpMyAdmin (thường ở `8080`) trên server.
Muốn đổi, sửa `SERVER_PORT` (và `HOST_PORT`) trong `.env`, **đồng thời** sửa
`proxy_pass` trong `deploy/nginx-usth.conf` cho khớp, rồi:

```bash
docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
```

**`network kien_webnet declared as external, but could not be found`**
Network chưa tồn tại trên máy/server. Tạo trước khi `up`:

```bash
docker network create kien_webnet
```

Trên server, nếu `web_mysql` đã chạy trong network có tên khác, kiểm tra tên thật
bằng `docker network ls` và sửa lại `name:` trong khối `networks` của
`docker-compose.yml`.

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
