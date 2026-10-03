document.getElementById("registerForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const birthYear = document.getElementById("birthYear").value;
    const school = document.getElementById("school").value.trim();
    const major = document.getElementById("major").value.trim();
    const academicYear = document.getElementById("academicYear").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("message");

    message.textContent = "";

    if (password !== confirmPassword) {
        message.textContent = "Mật khẩu nhập lại không khớp!";
        message.style.color = "red";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Mật khẩu phải có ít nhất 6 ký tự!";
        message.style.color = "red";
        return;
    }

    const userData = {
        fullName: fullName,
        birthYear: Number(birthYear),
        school: school,
        major: major,
        academicYear: academicYear,
        email: email,
        username: username,
        password: password
    };

    try {

        const response = await fetch(
            "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.textContent = "Đăng ký thành công!";
            message.style.color = "green";

            document.getElementById("registerForm").reset();

            setTimeout(function () {
                window.location.href = "diendanuas.html";
            }, 1500);

        } else {

            message.textContent =
                data.message || "Đăng ký thất bại!";

            message.style.color = "red";
        }

    } catch (error) {

        console.error("Lỗi:", error);

        message.textContent =
            "Không thể kết nối tới Backend!";

        message.style.color = "red";
    }

});