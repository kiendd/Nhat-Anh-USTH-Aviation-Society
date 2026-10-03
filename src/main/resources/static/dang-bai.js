const postForm = document.getElementById("postForm");

const imageInput = document.getElementById("image");

const imagePreview = document.getElementById("imagePreview");

const message = document.getElementById("message");

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    imagePreview.innerHTML = "";

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh!");
        this.value = "";
        return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        alert("Ảnh không được lớn hơn 5MB!");
        this.value = "";
        return;
    }

    const img = document.createElement("img");

    img.src = URL.createObjectURL(file);

    imagePreview.appendChild(img);
});

postForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "login.html";
        return;
    }

    const title =
        document.getElementById("title").value.trim();

    const category =
        document.getElementById("category").value;

    const content =
        document.getElementById("content").value.trim();

    const image =
        document.getElementById("image").files[0];

    if (!title) {
        alert("Vui lòng nhập tiêu đề!");
        return;
    }

    if (!category) {
        alert("Vui lòng chọn thể loại!");
        return;
    }

    if (!content) {
        alert("Vui lòng nhập nội dung!");
        return;
    }

    const formData = new FormData();

    formData.append("tieuDe", title);

    formData.append("theLoai", category);

    formData.append("noiDung", content);

    if (image) {
        formData.append("anh", image);
    }

    try {

        message.textContent = "Đang đăng bài...";

        const response = await fetch(
            "/api/diendan/dang-bai",
            {
                method: "POST",

                headers: {
                    "Authorization": "Bearer " + token
                },

                body: formData
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.textContent = "Đăng bài thành công!";

            postForm.reset();

            imagePreview.innerHTML = "";

            setTimeout(function () {
                window.location.href = "diendanuas.html";
            }, 1000);

        } else {

            message.textContent =
                data.message || "Đăng bài thất bại!";
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Không kết nối được với server!";
    }

});