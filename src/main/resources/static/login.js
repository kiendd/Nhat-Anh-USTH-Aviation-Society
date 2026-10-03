document.getElementById("loginForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("Backend trả về:", data);

        if (response.ok) {

            
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("role", data.role);

            console.log("Token:", data.token);
            console.log("Username:", data.username);
            console.log("User ID:", data.userId);
            console.log("Role:", data.role);

            alert("Đăng nhập thành công!");

            window.location.href = "diendanuas.html";

        } else {

            alert(
                data.message || data
            );

        }

    } catch (error) {

        console.error("Lỗi:", error);

        alert("Không thể kết nối Backend!");

    }
});