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

### 1.1. Trên server

`docker-compose.yml` chạy **MySQL 8 riêng của dự án** (container `usth_mysql`) cùng
`backend` (container `web_usth`). Không dùng chung `web_mysql` của server.

```bash
# Network dùng chung với nginx phải tồn tại (kiểm tra tên thật: docker network ls)
docker network inspect kien_webnet >/dev/null 2>&1 || docker network create kien_webnet

cp -n .env.example .env       # rồi sửa DB_PASSWORD và JWT_SECRET
docker compose up -d --build
```

Stack gồm 2 service:

- `mysql` — `mysql:8.0`, utf8mb4, dữ liệu ở volume `mysql-data`. Chỉ nằm trong network
  nội bộ `internal`, **không** publish cổng nên không truy cập được từ ngoài.
- `backend` — build từ `Dockerfile`, file upload ở volume `uploads-data`. Nối vào cả
  `internal` (để tới `usth_mysql:3306`) và network dùng chung `kien_webnet` (để nginx
  proxy tới `web_usth:8090`). Chỉ bắt đầu khi `mysql` healthy.

Database `usth_aviation` được MySQL tự tạo ở lần khởi động đầu, bảng do Hibernate tạo
(`JPA_DDL_AUTO=update`); không cần tạo tay.
Cổng `8090` chỉ bind vào `127.0.0.1` trên server (debug nội bộ), truy cập công khai
đi qua nginx.

> **Lưu ý**: `DB_PASSWORD` chỉ có hiệu lực ở lần khởi tạo volume `mysql-data` đầu tiên.
> Đổi mật khẩu về sau phải đổi trong MySQL, hoặc xoá volume nếu chưa có dữ liệu cần giữ.

#### Nginx cho subdomain

Config mẫu nằm ở `deploy/usth.laviehanoi.com.conf`, theo cùng mô hình với `laviehanoi.com`:
Cloudflare **Full (strict)** + Origin Certificate + Authenticated Origin Pulls.

Nginx chạy trong container `web_nginx` (Docker Compose, thư mục `Web`), nên cert Cloudflare
phải được mount vào container. Thêm vào service `nginx` trong `docker-compose.yml` của `Web`
(nếu chưa có):

```yaml
    volumes:
      - ./nginx/nginx_secrets:/etc/letsencrypt
      - ./nginx/user_conf.d:/etc/nginx/user_conf.d:ro
      - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro   # cert Origin + origin-pull-ca.pem
```

Các file cần có trên host (cert Origin mặc định phủ `*.laviehanoi.com`, dùng chung với
`laviehanoi.com`):

```
/etc/ssl/cloudflare/laviehanoi.com.pem
/etc/ssl/cloudflare/laviehanoi.com.key
/etc/ssl/cloudflare/origin-pull-ca.pem
```

Deploy trên server (thư mục `Web`):

```bash
cp usth.laviehanoi.com.conf nginx/user_conf.d/usth.laviehanoi.com.conf
docker compose up -d nginx        # tạo lại container nếu vừa thêm volume mới
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

Config redirect HTTP → HTTPS, proxy `http://web_usth:8090` và truyền `Host`, `X-Real-IP`,
`X-Forwarded-*`. Backend đọc các header này nhờ `server.forward-headers-strategy=framework`.
`web_nginx` phải cùng Docker network với `web_usth` để resolve được tên này.

#### DNS và Cloudflare

Thêm bản ghi `A` (hoặc `CNAME`) `usth` trong zone `laviehanoi.com` trỏ về IP server,
**bật proxy (đám mây cam)**. Authenticated Origin Pulls đã bật ở mức zone nên áp dụng
luôn cho subdomain; vì `ssl_verify_client on`, truy cập thẳng IP sẽ bị từ chối.

### 1.2. Chạy local

Dùng thêm file override để mở cổng ra host (backend `8090`, MySQL `3307`) và đặt CORS `*`:

```bash
docker network inspect kien_webnet >/dev/null 2>&1 || docker network create kien_webnet

docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Stack vẫn là `mysql` + `backend`, giống trên server; chỉ khác phần mở cổng.

### 1.3. Lệnh hữu ích

```bash
docker compose ps                 # trạng thái các service
docker compose logs -f backend    # xem log backend
docker compose down               # dừng (giữ dữ liệu)
docker compose down -v            # dừng và xoá toàn bộ dữ liệu (volume uploads và database)
```

- Local: <http://localhost:8090>
- Server: <https://usth.laviehanoi.com>

> Nếu máy đã có container tên `web_usth` / `usth_mysql` từ trước, xoá trước khi `up`:
> `docker rm -f web_usth usth_mysql`

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
| `DB_NAME` | `usth_aviation` | Tên database, được MySQL trong compose tự tạo |
| `DB_PASSWORD` | bắt buộc | Mật khẩu `root` của MySQL riêng; compose không chạy nếu thiếu |
| `MYSQL_HOST_PORT` | `3307` | Chỉ dùng với `docker-compose.local.yml`: cổng MySQL map ra host |
| `JPA_DDL_AUTO` | `update` | Chế độ tạo bảng của Hibernate (`update`, `validate`, `none`) |
| `JPA_SHOW_SQL` | `true` (local), `false` (compose) | In câu SQL ra log |
| `UPLOAD_DIR` | `uploads` (local), `/app/uploads` (compose) | Thư mục lưu file upload |
| `JWT_SECRET` | chuỗi mẫu | Khoá ký JWT, **≥ 32 ký tự**, phải đổi khi triển khai thật |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn token (ms), mặc định 24 giờ |
| `CORS_ALLOWED_ORIGINS` | `*` | Danh sách origin được phép gọi API, phân tách bằng dấu phẩy |

Giá trị mặc định trong `application.properties` (khi chạy `./mvnw spring-boot:run` trực tiếp)
là `DB_HOST=localhost`, `DB_PORT=3307`. Docker Compose ghi đè thành `usth_mysql:3306`.

Ví dụ giới hạn CORS cho một domain cụ thể:

```bash
CORS_ALLOWED_ORIGINS=https://usth-aviation.example.com,http://localhost:5500
```

**MySQL không publish cổng ra ngoài** — trong compose, backend nối tới MySQL qua network
nội bộ nên luôn dùng cổng `3306`. Chỉ khi chạy với `docker-compose.local.yml` mới có cổng
host (`MYSQL_HOST_PORT`, mặc định `3307`) để nối từ công cụ ngoài Docker.

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
MySQL của dự án chạy trong container `usth_mysql`, chỉ nằm trong network nội bộ của
compose. Backend luôn nối tới `usth_mysql:3306` bằng tài khoản `root` và `DB_PASSWORD`
trong `.env`; không cần (và không thể) chỉnh `DB_HOST` / `DB_PORT` / `DB_USERNAME`.

Kiểm tra theo thứ tự:

```bash
# 1. MySQL có healthy không
docker compose ps

# 2. Từ trong backend, TCP tới MySQL có thông không
docker compose exec backend bash -c 'exec 3<>/dev/tcp/usth_mysql/3306 && echo "OK"'

# 3. Đăng nhập MySQL và xem database
docker compose exec mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW DATABASES;"'

# 4. Log backend
docker compose logs backend | grep -iE "hikari|communications|access denied"
```

`Access denied` dù `DB_PASSWORD` đúng: biến `MYSQL_ROOT_PASSWORD` chỉ có hiệu lực ở lần
khởi tạo volume `mysql-data` đầu tiên. Nếu đã đổi `DB_PASSWORD` sau đó và chưa có dữ liệu
cần giữ, xoá volume rồi tạo lại: `docker compose down -v && docker compose up -d`.

**Cổng đã bị chiếm**
Mặc định dự án dùng `8090` để tránh trùng phpMyAdmin (thường ở `8080`) trên server.
Muốn đổi, sửa `SERVER_PORT` (và `HOST_PORT`) trong `.env`, **đồng thời** sửa
`proxy_pass` trong `deploy/usth.laviehanoi.com.conf` cho khớp, rồi:

```bash
docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
```

**`network kien_webnet declared as external, but could not be found`**
Network chưa tồn tại trên máy/server. Tạo trước khi `up`:

```bash
docker network create kien_webnet
```

Trên server, nếu nginx nằm trong network có tên khác, kiểm tra tên thật bằng
`docker network ls` rồi đặt `WEB_NETWORK=<tên-thật>` trong `.env`.

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
