// Cấu hình dùng chung cho toàn bộ frontend.
//
// Để trống apiBase khi frontend được phục vụ trực tiếp bởi Spring Boot
// (same-origin, mặc định khi chạy local tại http://localhost:8080).
// Đặt apiBase thành gốc backend khi frontend chạy ở host/port khác, ví dụ:
//     apiBase: "http://localhost:8080"
window.APP_CONFIG = {
    apiBase: "",
    uploadBase: "/uploads/"
};
