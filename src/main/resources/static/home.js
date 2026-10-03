const API_URL = "/api/diendan/admin/the-loai/Hoạt động CLB";

let baiDangs = [];
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener("DOMContentLoaded", function () {
    loadBaiDang();
});

async function loadBaiDang() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        baiDangs = await response.json();
        currentPage = 1;

        renderBaiDang();
        renderPagination();
    } catch (error) {
        console.error("Lỗi khi tải bài đăng:", error);
    }
}

function renderBaiDang() {
    const boxes = document.querySelectorAll(".khungnoidungp3 .item");

    boxes.forEach((box, index) => {
        const noidung = box.querySelector(".noidung");

        box.style.display = "flex";
        box.style.cursor = "default";
        box.onclick = null;

        if (!noidung) return;

        noidung.innerHTML = "";

        const postIndex = (currentPage - 1) * itemsPerPage + index;
        const post = baiDangs[postIndex];

        if (!post) return;

        if (post.anhMinhHoa) {
            const image = document.createElement("img");

            image.src = post.anhMinhHoa;
            image.alt = "";
            image.className = "anh-bai-dang";

            noidung.appendChild(image);
        }

        if (post.noiDung) {
            const description = document.createElement("p");

            description.textContent = post.noiDung;

            noidung.appendChild(description);
        }

        if (post.filePdf) {
            box.style.cursor = "pointer";

            box.onclick = function () {
                window.open(post.filePdf, "_blank");
            };
        }
    });
}

function renderPagination() {
    let pagination = document.querySelector(".pagination");

    if (!pagination) {
        pagination = document.createElement("div");
        pagination.className = "pagination";

        document
            .querySelector(".homep3")
            .appendChild(pagination);
    }

    pagination.innerHTML = "";

    const totalPages = Math.ceil(
        baiDangs.length / itemsPerPage
    );

    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";

    const previousButton = document.createElement("button");

    previousButton.textContent = "‹";
    previousButton.disabled = currentPage === 1;

    previousButton.onclick = function () {
        if (currentPage > 1) {
            currentPage--;

            renderBaiDang();
            renderPagination();
        }
    };

    pagination.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");

        pageButton.textContent = i;

        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.onclick = function () {
            currentPage = i;

            renderBaiDang();
            renderPagination();
        };

        pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");

    nextButton.textContent = "›";
    nextButton.disabled = currentPage === totalPages;

    nextButton.onclick = function () {
        if (currentPage < totalPages) {
            currentPage++;

            renderBaiDang();
            renderPagination();
        }
    };

    pagination.appendChild(nextButton);
}