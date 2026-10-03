document.addEventListener("DOMContentLoaded", function () {

    const noidung = document.getElementById("noidung");
    const danhtinh = document.getElementById("danhtinh");
    const button = document.querySelector(".submit button");

    button.addEventListener("click", async function (event) {

        event.preventDefault();

        const noiDung = noidung.value.trim();
        const danhTinh = danhtinh.value.trim();

        if (noiDung === "") {
            alert("Vui lòng nhập nội dung góp ý!");
            return;
        }

        const data = {
            noiDung: noiDung,
            userId: null,
            danhTinh: danhTinh
        };

        console.log("Đang gửi:", data);

        try {

            const response = await fetch("/api/gopy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            console.log("Status:", response.status);

            const text = await response.text();

            console.log("Server trả về:", text);

            if (!response.ok) {
                alert("Lỗi server: " + text);
                return;
            }

            alert("Gửi góp ý thành công!");

            noidung.value = "";
            danhtinh.value = "";

        } catch (error) {

            console.error(error);

            alert("Không kết nối được với Spring Boot: " + error.message);

        }

    });

});