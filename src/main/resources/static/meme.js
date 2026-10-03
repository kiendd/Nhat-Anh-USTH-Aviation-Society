const API_URL = (window.APP_CONFIG.apiBase || "") + "/api/diendan/admin/the-loai/Meme";

let memes = [];
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener("DOMContentLoaded", function () {
    loadMeme();
});

async function loadMeme() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        memes = await response.json();

        currentPage = 1;

        renderMeme();
        renderPagination();

    } catch (error) {
        console.error("Lỗi khi tải meme:", error);
    }
}

function renderMeme() {

    const boxes = document.querySelectorAll(".meme-box");

    boxes.forEach(box => {
        box.style.display = "none";
        box.onclick = null;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentItems = memes.slice(startIndex, endIndex);

    currentItems.forEach((meme, index) => {

        const box = boxes[index];

        if (!box) {
            return;
        }

        box.style.display = "block";

        const imageArea = box.querySelector(".meme-image");
        const title = box.querySelector(".meme-title");
        const description = box.querySelector(".meme-description");

        title.textContent = meme.tieuDe || "";

        description.textContent = meme.noiDung || "";

        imageArea.innerHTML = "";

        if (meme.anhMinhHoa) {

            const image = document.createElement("img");

            image.src =
                (window.APP_CONFIG.apiBase || "") +
                meme.anhMinhHoa;

            image.alt =
                meme.tieuDe || "Meme hàng không";

            imageArea.appendChild(image);
        }

        box.onclick = function () {

            if (!meme.filePdf) {
                return;
            }

            const pdfUrl =
                (window.APP_CONFIG.apiBase || "") +
                meme.filePdf;

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
        Math.ceil(memes.length / itemsPerPage);

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

            renderMeme();
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

            renderMeme();
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

            renderMeme();
            renderPagination();
        }
    };

    pagination.appendChild(nextButton);
}