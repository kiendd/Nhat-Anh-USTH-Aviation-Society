const API_URL = "/api/diendan/bai-dang";

const token =
    localStorage.getItem("token");

const username =
    localStorage.getItem("username");

const authArea =
    document.getElementById("authArea");

if (token && username) {

    authArea.innerHTML = `
        <span style="color: yellow;">
            <i class="bi bi-person-circle"></i>
            ${escapeHtml(username)}
        </span>

        <button
            class="btnlogout"
            onclick="logout()">

            <i class="bi bi-box-arrow-right"></i>
            ĐĂNG XUẤT

        </button>
    `;

} else {

    authArea.innerHTML = `
        <a href="login.html">

            <button
                type="button"
                class="btnlogin"
                style="
                    color: white;
                    background: transparent;
                    border: 1px solid #f5d547;
                    border-radius: 7px;
                    padding: 8px 15px;
                ">

                <i
                    class="bi bi-door-open"
                    style="color: white;">
                </i>

                ĐĂNG NHẬP

            </button>

        </a>
    `;
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        loadChiTietBaiDang();
    }
);

async function loadChiTietBaiDang() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    if (!id) {

        hienThiLoi(
            "Không tìm thấy mã bài đăng."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );

        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }

        const post =
            await response.json();

        renderChiTiet(post);

    } catch (error) {

        console.error(
            "Lỗi khi tải bài đăng:",
            error
        );

        hienThiLoi(
            "Không thể tải bài đăng. Vui lòng thử lại."
        );
    }
}

function renderChiTiet(post) {

    const image =
        document.getElementById(
            "baidangImage"
        );

    const title =
        document.getElementById(
            "baidangTitle"
        );

    const content =
        document.getElementById(
            "baidangContent"
        );

    const user =
        document.getElementById(
            "baidangUser"
        );

    const date =
        document.getElementById(
            "baidangDate"
        );

    const category =
        document.getElementById(
            "baidangCategory"
        );

    title.textContent =
        post.tieuDe ||
        "Không có tiêu đề";

    content.textContent =
        post.noiDung ||
        "Không có nội dung.";

    category.textContent =
        post.theLoai ||
        "DIỄN ĐÀN";

    if (post.user) {

        user.textContent =
            post.user.fullName ||
            post.user.username ||
            "Thành viên";

    } else {

        user.textContent =
            "Thành viên";
    }

    if (post.ngayDang) {

        const ngay =
            new Date(
                post.ngayDang
            );

        date.textContent =
            ngay.toLocaleDateString(
                "vi-VN"
            ) +
            " " +
            ngay.toLocaleTimeString(
                "vi-VN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    } else {

        date.textContent =
            "Không xác định";
    }

    if (post.anh) {

        let imageUrl =
            post.anh
                .toString()
                .trim();

        if (
            !imageUrl.startsWith(
                "http://"
            ) &&
            !imageUrl.startsWith(
                "https://"
            )
        ) {

            if (
                !imageUrl.startsWith(
                    "/uploads/"
                )
            ) {

                imageUrl =
                    "/uploads/" +
                    imageUrl.replace(
                        /^\/+/,
                        ""
                    );
            }
        }

        image.src =
            imageUrl;

        image.style.display =
            "block";

        image.onerror =
            function() {

                console.error(
                    "Không tải được ảnh:",
                    imageUrl
                );

                image.src =
                    "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";
            };

    } else {

        image.src =
            "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";

        image.style.display =
            "block";
    }

    image.alt =
        post.tieuDe ||
        "Ảnh bài đăng";

    document.title =
        (
            post.tieuDe ||
            "Chi tiết bài đăng"
        ) +
        " - UAS Aviation Society";
}

function hienThiLoi(message) {

    document.getElementById(
        "baidangTitle"
    ).textContent = message;

    document.getElementById(
        "baidangContent"
    ).textContent = "";

    document.getElementById(
        "baidangImage"
    ).style.display = "none";
}

function quayLai() {

    window.location.href =
        "diendanuas.html";
}

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "role"
    );

    window.location.href =
        "diendanuas.html";
}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}