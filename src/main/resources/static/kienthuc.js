const API_URL = (window.APP_CONFIG.apiBase || "") + "/api/diendan/admin/the-loai/Ki%E1%BA%BFn%20th%E1%BB%A9c";

let kienThucs = [];
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener("DOMContentLoaded", function () {
    loadKienThuc();
});

async function loadKienThuc() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        kienThucs = await response.json();

        currentPage = 1;

        renderKienThuc();
        renderPagination();

    } catch (error) {
        console.error("Lỗi khi tải kiến thức:", error);
    }
}

function renderKienThuc() {

    const boxes = document.querySelectorAll(".meme-box");

    boxes.forEach(box => {
        box.style.display = "none";
        box.onclick = null;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentItems = kienThucs.slice(startIndex, endIndex);

    currentItems.forEach((kienThuc, index) => {

        const box = boxes[index];

        if (!box) {
            return;
        }

        box.style.display = "block";

        const imageArea = box.querySelector(".meme-image");
        const title = box.querySelector(".meme-title");
        const description = box.querySelector(".meme-description");

        title.textContent = kienThuc.tieuDe || "";

        description.textContent = kienThuc.noiDung || "";

        imageArea.innerHTML = "";

        if (kienThuc.anhMinhHoa) {

            const image = document.createElement("img");

            image.src =
                (window.APP_CONFIG.apiBase || "") +
                kienThuc.anhMinhHoa;

            image.alt =
                kienThuc.tieuDe || "Kiến thức hàng không";

            imageArea.appendChild(image);
        }

        box.onclick = function () {

            if (!kienThuc.filePdf) {
                return;
            }

            const pdfUrl =
                (window.APP_CONFIG.apiBase || "") +
                kienThuc.filePdf;

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
        Math.ceil(kienThucs.length / itemsPerPage);

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

            renderKienThuc();
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

            renderKienThuc();
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

            renderKienThuc();
            renderPagination();
        }
    };

    pagination.appendChild(nextButton);
}