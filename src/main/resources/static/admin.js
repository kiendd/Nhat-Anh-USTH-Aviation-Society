const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!token || !username) {

    window.location.href = "login.html";

} else {

    const currentRole = role
        ? role.trim().toLowerCase()
        : "";

    const currentUsername = username
        ? username.trim().toLowerCase()
        : "";

    // ADMIN hoặc ROOT được phép truy cập
    const isAdmin =
        currentRole === "admin" ||
        currentRole === "root" ||
        currentUsername === "root";

    if (!isAdmin) {

        alert(
            "Bạn không có quyền truy cập trang quản trị!\n" +
            "Role hiện tại: " + role
        );

        window.location.href = "diendanuas.html";
    }
}


// Hiển thị thông tin tài khoản
document.getElementById("username").innerText =
    username;

document.getElementById("userDisplay").innerText =
    username;

document.getElementById("roleDisplay").innerText =
    role || "Không xác định";


// ===============================
// CHỈ ROOT ĐƯỢC THẤY THÊM ADMIN
// ===============================

const root1 = document.getElementById("root1");

if (root1) {

    if (role && role.trim().toLowerCase() === "root") {

        root1.style.display = "block";

    } else {

        root1.style.display = "none";
    }
}


// ===============================
// ĐĂNG XUẤT
// ===============================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    window.location.href = "login.html";
}