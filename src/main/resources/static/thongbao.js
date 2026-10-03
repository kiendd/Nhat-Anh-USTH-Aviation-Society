const API_URL = "/api/diendan/bai-dang";

const CATEGORY = "Thông báo";

let allPosts = [];

let currentPage = 1;

const itemsPerPage = 9;


document.addEventListener("DOMContentLoaded", function () {

    loadPosts();

});


async function loadPosts() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " + response.status
            );

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            console.error(
                "API không trả về Array"
            );

            return;

        }

        allPosts = data

            .filter(function (post) {

                const approved =
                    String(
                        post.trangThai || ""
                    )
                        .trim()
                        .toUpperCase()
                    === "APPROVED";

                return (
                    approved &&
                    normalizeCategory(post.theLoai) ===
                    normalizeCategory(CATEGORY)
                );

            })

            .sort(function (a, b) {

                return new Date(b.ngayDang || 0) -
                    new Date(a.ngayDang || 0);

            });

        renderPosts();

        renderPagination();

    } catch (error) {

        console.error(
            "Lỗi tải bài viết:",
            error
        );

        const grid =
            document.getElementById("baivietGrid");

        if (grid) {

            grid.innerHTML = `
                <div class="empty-message">
                    Không thể tải bài viết.
                </div>
            `;

        }

    }

}


function renderPosts() {

    const grid =
        document.getElementById("baivietGrid");

    if (!grid) return;

    grid.innerHTML = "";

    const start =
        (currentPage - 1) * itemsPerPage;

    const posts =
        allPosts.slice(
            start,
            start + itemsPerPage
        );

    if (posts.length === 0) {

        grid.innerHTML = `
            <div class="empty-message">
                Chưa có bài viết Thông báo nào được duyệt.
            </div>
        `;

        return;

    }

    posts.forEach(function (post, index) {

        const box =
            document.createElement("div");

        box.className = "baiviet-box";

        box.style.cursor = "pointer";

        box.addEventListener(
            "click",
            function () {

                window.location.href =
                    "chitietbaidang.html?id=" +
                    encodeURIComponent(post.id);

            }
        );

        let imageUrl =
            "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";

        if (post.anh) {

            imageUrl =
                buildImageUrl(post.anh);

        }

        const number =
            String(start + index + 1)
                .padStart(2, "0");

        const title =
            post.tieuDe ||
            "Không có tiêu đề";

        const description =
            post.noiDung ||
            "Không có nội dung.";

        const username =
            post.user?.username ||
            post.user?.fullName ||
            post.user?.full_name ||
            post.user?.hoTen ||
            "Thành viên UAS";

        const date =
            formatDate(post.ngayDang);

        box.innerHTML = `

            <div class="baiviet-image">

                <img
                    src="${escapeAttribute(imageUrl)}"
                    alt="${escapeAttribute(title)}">

            </div>

            <div class="baiviet-content">

                <div class="baiviet-number">
                    #${number}
                </div>

                <h3 class="baiviet-title">
                    ${escapeHTML(title)}
                </h3>

                <p class="baiviet-description">
                    ${escapeHTML(description)}
                </p>

                <div class="baiviet-info">

                    <span class="baiviet-user">
                        ${escapeHTML(username)}
                    </span>

                    <span class="baiviet-date">
                        ${escapeHTML(date)}
                    </span>

                </div>

            </div>

        `;

        const image =
            box.querySelector("img");

        if (image) {

            image.onerror =
                function () {

                    this.onerror = null;

                    this.src =
                        "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";

                };

        }

        grid.appendChild(box);

    });

}


function renderPagination() {

    const pagination =
        document.getElementById("pagination");

    if (!pagination) return;

    pagination.innerHTML = "";

    const totalPages =
        Math.ceil(
            allPosts.length /
            itemsPerPage
        );

    if (totalPages <= 1) return;

    const previousButton =
        document.createElement("button");

    previousButton.textContent = "‹ Trước";

    previousButton.className =
        "pagination-btn";

    previousButton.disabled =
        currentPage === 1;

    previousButton.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderPosts();
                renderPagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );

    pagination.appendChild(
        previousButton
    );

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const pageButton =
            document.createElement("button");

        pageButton.textContent = i;

        pageButton.className =
            "pagination-btn";

        if (i === currentPage) {

            pageButton.classList.add(
                "active"
            );

        }

        pageButton.addEventListener(
            "click",
            function () {

                currentPage = i;

                renderPosts();
                renderPagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

        pagination.appendChild(
            pageButton
        );

    }

    const nextButton =
        document.createElement("button");

    nextButton.textContent = "Sau ›";

    nextButton.className =
        "pagination-btn";

    nextButton.disabled =
        currentPage === totalPages;

    nextButton.addEventListener(
        "click",
        function () {

            if (currentPage < totalPages) {

                currentPage++;

                renderPosts();
                renderPagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );

    pagination.appendChild(
        nextButton
    );

}


function buildImageUrl(imagePath) {

    if (!imagePath) {

        return "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";

    }

    let imageUrl =
        String(imagePath).trim();

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {

        return imageUrl;

    }

    imageUrl =
        imageUrl.replace(/^\/+/, "");

    if (
        imageUrl.startsWith("uploads/")
    ) {

        return "/" + imageUrl;

    }

    return "/uploads/" + imageUrl;

}


function normalizeCategory(value) {

    if (!value) return "";

    return String(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

}


function formatDate(dateValue) {

    if (!dateValue) return "";

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) return "";

    return (
        date.toLocaleDateString("vi-VN") +
        " " +
        date.toLocaleTimeString(
            "vi-VN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text == null
            ? ""
            : String(text);

    return div.innerHTML;

}


function escapeAttribute(text) {

    return escapeHTML(text)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}