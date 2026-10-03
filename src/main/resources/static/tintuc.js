const API_URL = (window.APP_CONFIG.apiBase || "") + "/api/diendan/admin/the-loai/Tin%20t%E1%BB%A9c";

let tinTucs = [];
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener("DOMContentLoaded", function () {
    loadTinTuc();
});

async function loadTinTuc() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        tinTucs = await response.json();

        currentPage = 1;

        renderTinTuc();

        renderPagination();

    } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
    }
}

function renderTinTuc() {

    const boxes = document.querySelectorAll(".meme-box");

    boxes.forEach(box => {
        box.style.display = "none";
        box.onclick = null;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentItems = tinTucs.slice(startIndex, endIndex);

    currentItems.forEach((tinTuc, index) => {

        const box = boxes[index];

        if (!box) {
            return;
        }

        box.style.display = "block";

        const imageArea = box.querySelector(".meme-image");
        const title = box.querySelector(".meme-title");
        const description = box.querySelector(".meme-description");

        title.textContent = tinTuc.tieuDe || "";

        description.textContent = tinTuc.noiDung || "";

        imageArea.innerHTML = "";

        if (tinTuc.anhMinhHoa) {

            const image = document.createElement("img");

            image.src =
                (window.APP_CONFIG.apiBase || "") +
                tinTuc.anhMinhHoa;

            image.alt =
                tinTuc.tieuDe || "Tin tức hàng không";

            imageArea.appendChild(image);
        }

        box.onclick = function () {

            if (!tinTuc.filePdf) {
                return;
            }

            const pdfUrl =
                (window.APP_CONFIG.apiBase || "") +
                tinTuc.filePdf;

            window.open(pdfUrl, "_blank");
        };

        box.style.cursor = "pointer";
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function renderPagination() {

    let pagination = document.querySelector(".pagination");

    if (!pagination) {

        pagination = document.createElement("div");

        pagination.className = "pagination";

        document.querySelector(".meme-container")
            .appendChild(pagination);
    }

    pagination.innerHTML = "";

    const totalPages =
        Math.ceil(tinTucs.length / itemsPerPage);

    if (totalPages <= 1) {
        return;
    }

    const previousButton =
        document.createElement("button");

    previousButton.textContent = "‹";

    previousButton.disabled =
        currentPage === 1;

    previousButton.onclick = function () {

        if (currentPage > 1) {

            currentPage--;

            renderTinTuc();

            renderPagination();
        }
    };

    pagination.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {

        const pageButton =
            document.createElement("button");

        pageButton.textContent = i;

        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.onclick = function () {

            currentPage = i;

            renderTinTuc();

            renderPagination();
        };

        pagination.appendChild(pageButton);
    }

    const nextButton =
        document.createElement("button");

    nextButton.textContent = "›";

    nextButton.disabled =
        currentPage === totalPages;

    nextButton.onclick = function () {

        if (currentPage < totalPages) {

            currentPage++;

            renderTinTuc();

            renderPagination();
        }
    };

    pagination.appendChild(nextButton);
}