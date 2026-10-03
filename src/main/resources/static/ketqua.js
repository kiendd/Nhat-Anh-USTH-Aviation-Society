const API_URL = "/api/diendan/bai-dang";

// Bỏ dấu tiếng Việt để so khớp "gần giống" không phân biệt dấu
function boDau(str) {

    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();

}

const params = new URLSearchParams(window.location.search);
const tuKhoaGoc = params.get("q") || "";

document.getElementById("tuKhoaHienThi").textContent =
    tuKhoaGoc ? `"${tuKhoaGoc}"` : "";

// Điền lại từ khóa vào ô tìm kiếm trên trang kết quả
const oTimKiem = document.getElementById("noidung");
if (oTimKiem) {
    oTimKiem.value = tuKhoaGoc;

    oTimKiem.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const tk = oTimKiem.value.trim();
            if (tk.length > 0) {
                window.location.href = "ketqua.html?q=" + encodeURIComponent(tk);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    timKiemBaiDang(tuKhoaGoc);
});

async function timKiemBaiDang(tuKhoa) {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("API không trả về Array");
            return;
        }

        const tuKhoaChuan = boDau(tuKhoa);

        const ketQua = data
            .filter(function (post) {
                return post.trangThai === "APPROVED";
            })
            .filter(function (post) {

                const tieuDeChuan = boDau(post.tieuDe || "");
                const noiDungChuan = boDau(post.noiDung || "");

                return (
                    tieuDeChuan.includes(tuKhoaChuan) ||
                    noiDungChuan.includes(tuKhoaChuan)
                );

            })
            .sort(function (a, b) {

                // Ưu tiên bài có tiêu đề khớp gần đầu hơn, rồi mới đến ngày mới nhất
                const aIndex = boDau(a.tieuDe || "").indexOf(tuKhoaChuan);
                const bIndex = boDau(b.tieuDe || "").indexOf(tuKhoaChuan);

                if (aIndex !== bIndex) {
                    // -1 (không có trong tiêu đề) xếp sau
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                }

                return new Date(b.ngayDang) - new Date(a.ngayDang);

            });

        document.getElementById("soLuongKetQua").textContent =
            `Tìm thấy ${ketQua.length} bài viết.`;

        renderKetQua(ketQua);

    } catch (error) {

        console.error("Lỗi khi tìm kiếm bài đăng:", error);

    }

}

function renderKetQua(posts) {

    const grid = document.getElementById("ketQuaGrid");
    const thongBaoRong = document.getElementById("khongCoKetQua");

    grid.innerHTML = "";

    if (posts.length === 0) {
        thongBaoRong.style.display = "block";
        return;
    }

    thongBaoRong.style.display = "none";

    posts.forEach(function (post, index) {

        const box = document.createElement("div");
        box.className = "baiviet-box";
        box.style.cursor = "pointer";

        let imageUrl = post.anh || "";

        if (imageUrl &&
            !imageUrl.startsWith("http://") &&
            !imageUrl.startsWith("https://") &&
            !imageUrl.startsWith("/uploads/")) {

            imageUrl = "/uploads/" + imageUrl.replace(/^\/+/, "");

        }

        box.innerHTML = `
            <div class="baiviet-image">
                ${imageUrl ? `<img src="${imageUrl}" alt="${post.tieuDe || ''}"
                    onerror="this.src='https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation'">` : ""}
            </div>
            <div class="baiviet-content">
                <span class="baiviet-number">#${String(index + 1).padStart(2, "0")}</span>
                <h3 class="baiviet-title">${post.tieuDe || "Không có tiêu đề"}</h3>
                <p class="baiviet-description">${post.noiDung || ""}</p>
                <div class="baiviet-info">
                    <span class="baiviet-user">Đăng bởi: ${
            post.user ? (post.user.fullName || post.user.username || "Thành viên") : "Thành viên"
        }</span>
                    <span class="baiviet-date">${
            post.ngayDang
                ? new Date(post.ngayDang).toLocaleDateString("vi-VN") + " " +
                new Date(post.ngayDang).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                : ""
        }</span>
                </div>
            </div>
        `;

        box.onclick = function () {
            if (post.id) {
                window.location.href = "chitietbaidang.html?id=" + post.id;
            }
        };

        grid.appendChild(box);

    });

}