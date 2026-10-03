const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const usernameElement = document.getElementById("username");
const adminForm = document.getElementById("adminForm");
const message = document.getElementById("message");

const fullNameInput = document.getElementById("fullName");
const birthYearInput = document.getElementById("birthYear");
const schoolInput = document.getElementById("school");
const majorInput = document.getElementById("major");
const academicYearInput = document.getElementById("academicYear");
const emailInput = document.getElementById("email");
const adminUsernameInput = document.getElementById("adminUsername");
const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

if (!token || !username) {
    window.location.href = "login.html";
}

const currentRole = role
    ? role.trim().toLowerCase()
    : "";

const currentUsername = username
    ? username.trim().toLowerCase()
    : "";

const isRoot =
    currentRole === "root" ||
    currentUsername === "root";

if (!isRoot) {
    alert("Chỉ ROOT mới được tạo tài khoản Admin!");
    window.location.href = "admin.html";
}

usernameElement.textContent = username;

adminForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const fullName =
        fullNameInput.value.trim();

    const birthYear =
        birthYearInput.value.trim();

    const school =
        schoolInput.value.trim();

    const major =
        majorInput.value.trim();

    const academicYear =
        academicYearInput.value.trim();

    const email =
        emailInput.value.trim();

    const adminUsername =
        adminUsernameInput.value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    if (
        !fullName ||
        !birthYear ||
        !school ||
        !major ||
        !academicYear ||
        !email ||
        !adminUsername ||
        !password ||
        !confirmPassword
    ) {
        showMessage(
            "Vui lòng nhập đầy đủ thông tin!",
            false
        );
        return;
    }

    const year = Number(birthYear);

    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > new Date().getFullYear()
    ) {
        showMessage(
            "Năm sinh không hợp lệ!",
            false
        );
        return;
    }

    if (password.length < 6) {
        showMessage(
            "Mật khẩu phải có ít nhất 6 ký tự!",
            false
        );
        return;
    }

    if (password !== confirmPassword) {
        showMessage(
            "Mật khẩu xác nhận không khớp!",
            false
        );
        return;
    }

    const userData = {
        fullName: fullName,
        birthYear: year,
        school: school,
        major: major,
        academicYear: academicYear,
        email: email,
        username: adminUsername,
        password: password,
        role: "ADMIN"
    };

    try {

        message.textContent = "Đang tạo tài khoản...";
        message.className = "loading";

        const response = await fetch(
            "/api/auth/register-admin",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify(userData)
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể tạo tài khoản Admin"
            );
        }

        showMessage(
            "Tạo tài khoản Admin thành công!",
            true
        );

        adminForm.reset();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Không thể kết nối đến máy chủ!",
            false
        );
    }
});

function showMessage(text, success) {

    message.textContent = text;

    message.className =
        success
            ? "success"
            : "error";
}

togglePassword.addEventListener(
    "click",
    function () {

        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type = "text";
            togglePassword.textContent =
                "Ẩn";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent =
                "Hiện";
        }
    }
);

toggleConfirmPassword.addEventListener(
    "click",
    function () {

        if (
            confirmPasswordInput.type ===
            "password"
        ) {

            confirmPasswordInput.type =
                "text";

            toggleConfirmPassword.textContent =
                "Ẩn";

        } else {

            confirmPasswordInput.type =
                "password";

            toggleConfirmPassword.textContent =
                "Hiện";
        }
    }
);

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    window.location.href = "login.html";
}