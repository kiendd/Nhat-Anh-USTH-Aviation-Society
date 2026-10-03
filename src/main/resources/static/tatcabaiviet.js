const API_URL = "/api/diendan/bai-dang";

let allPosts = [];
let filteredPosts = [];

let currentPage = 1;

const itemsPerPage = 9;


document.addEventListener("DOMContentLoaded", function () {
    loadPosts();
});


async function loadPosts() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        console.log("Dữ liệu API:", data);

        if (!Array.isArray(data)) {
            throw new Error("API không trả về Array");
        }


        allPosts = data
            .filter(function (post) {

                return String(
                    post.trangThai || ""
                ).trim().toUpperCase() === "APPROVED";

            })
            .sort(function (a, b) {

                return new Date(b.ngayDang) -
                    new Date(a.ngayDang);

            });


        const params =
            new URLSearchParams(
                window.location.search
            );


        const keyword =
            params.get("noidung") || "";


        console.log(
            "Từ khóa tìm kiếm:",
            keyword
        );


        filterPosts(keyword);


    } catch (error) {

        console.error(
            "Lỗi tải bài viết:",
            error
        );


        const grid =
            document.getElementById(
                "baivietGrid"
            );


        if (grid) {

            grid.innerHTML = `
                <div style="
                    color:white;
                    width:100%;
                    text-align:center;
                    padding:50px;
                ">
                    Không thể tải bài viết.
                </div>
            `;

        }

    }

}


function normalizeText(text) {

    return String(text || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();

}


function filterPosts(keyword) {

    const searchText =
        normalizeText(keyword);


    if (searchText === "") {

        filteredPosts =
            [...allPosts];

    } else {

        filteredPosts =
            allPosts.filter(function (post) {

                const title =
                    normalizeText(
                        post.tieuDe
                    );


                const content =
                    normalizeText(
                        post.noiDung
                    );


                return title.includes(searchText) ||
                    content.includes(searchText);

            });

    }


    console.log(
        "Tổng số bài:",
        allPosts.length
    );


    console.log(
        "Số bài sau khi lọc:",
        filteredPosts.length
    );


    currentPage = 1;


    updateHeading(
        keyword,
        filteredPosts.length
    );


    renderPosts();

    renderPagination();

}


function updateHeading(
    keyword,
    count
) {

    const title =
        document.getElementById(
            "pageTitle"
        );


    const description =
        document.getElementById(
            "pageDescription"
        );


    if (!title) {
        return;
    }


    if (!keyword.trim()) {

        title.textContent =
            "TẤT CẢ BÀI VIẾT";


        if (description) {

            description.textContent =
                "Tổng hợp tất cả bài viết từ cộng đồng USTH Aviation Society.";

        }


    } else {

        title.textContent =
            "KẾT QUẢ TÌM KIẾM";


        if (description) {

            description.textContent =
                'Từ khóa "' +
                keyword +
                '" - tìm thấy ' +
                count +
                " bài viết.";

        }

    }

}


function renderPosts() {

    const grid =
        document.getElementById(
            "baivietGrid"
        );


    if (!grid) {

        console.error(
            "Không tìm thấy #baivietGrid"
        );

        return;

    }


    grid.innerHTML = "";


    const start =
        (currentPage - 1) *
        itemsPerPage;


    const end =
        start +
        itemsPerPage;


    const posts =
        filteredPosts.slice(
            start,
            end
        );


    if (posts.length === 0) {

        grid.innerHTML = `
            <div style="
                color:white;
                width:100%;
                text-align:center;
                padding:60px 20px;
            ">

                <h3>
                    Không tìm thấy bài viết
                </h3>

                <p>
                    Không có bài viết nào có tiêu đề hoặc nội dung phù hợp với từ khóa tìm kiếm.
                </p>

            </div>
        `;

        return;

    }


    posts.forEach(function (post) {

        const box =
            document.createElement("div");


        box.className =
            "baiviet-box";


        box.style.cursor =
            "pointer";


        box.addEventListener(
            "click",
            function () {

                window.location.href =
                    "chitietbaidang.html?id=" +
                    post.id;

            }
        );


        let imageUrl =
            "images/diendan.png";


        if (post.anh) {

            imageUrl =
                String(post.anh).trim();


            if (
                !imageUrl.startsWith("http://") &&
                !imageUrl.startsWith("https://") &&
                !imageUrl.startsWith("/")
            ) {

                imageUrl =
                    "/" +
                    imageUrl.replace(/^\/+/, "");

            }

        }


        let dateText = "";


        if (post.ngayDang) {

            const date =
                new Date(post.ngayDang);


            if (!isNaN(date.getTime())) {

                dateText =
                    date.toLocaleDateString(
                        "vi-VN",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }
                    );

            }

        }


        const title =
            escapeHtml(
                post.tieuDe ||
                "Không có tiêu đề"
            );


        const content =
            escapeHtml(
                post.noiDung ||
                "Chưa có nội dung."
            );


        const category =
            escapeHtml(
                post.theLoai ||
                "Diễn đàn"
            );


        box.innerHTML = `

            <div class="baiviet-image">

                <img
                    src="${imageUrl}"
                    alt="${title}"
                    onerror="this.onerror=null;this.src='images/diendan.png';"
                >

            </div>


            <div class="baiviet-info">

                <div class="baiviet-category">
                    ${category}
                </div>


                <h3>
                    ${title}
                </h3>


                <p>
                    ${content}
                </p>


                <div class="baiviet-date">
                    ${dateText}
                </div>

            </div>

        `;


        grid.appendChild(box);

    });

}


function renderPagination() {

    const pagination =
        document.getElementById(
            "pagination"
        );


    if (!pagination) {
        return;
    }


    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredPosts.length /
            itemsPerPage
        );


    if (totalPages <= 1) {
        return;
    }


    const previous =
        document.createElement("button");


    previous.className =
        "pagination-btn";


    previous.innerHTML =
        "&laquo;";


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
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


    pagination.appendChild(previous);


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.className =
            "pagination-btn";


        if (page === currentPage) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;


                renderPosts();

                renderPagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        pagination.appendChild(button);

    }


    const next =
        document.createElement("button");


    next.className =
        "pagination-btn";


    next.innerHTML =
        "&raquo;";


    next.disabled =
        currentPage === totalPages;


    next.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

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


    pagination.appendChild(next);

}


function escapeHtml(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}