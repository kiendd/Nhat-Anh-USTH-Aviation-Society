const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const adminName = document.getElementById("adminName");
const postTable = document.getElementById("postTable");
const totalPost = document.getElementById("totalPost");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const message = document.getElementById("message");

const API_URL = (window.APP_CONFIG.apiBase || "") + "/api/diendan";
const UPLOAD_URL = (window.APP_CONFIG.apiBase || "") + window.APP_CONFIG.uploadBase;

if (
    !token ||
    !role ||
    (
        role.trim().toLowerCase() !== "admin" &&
        role.trim().toLowerCase() !== "root"
    )
) {
    alert("Bạn không có quyền truy cập!");
    window.location.href = "login.html";
}

if (adminName) {
    adminName.textContent = username || "ADMIN";
}

let posts = [];

async function loadPosts() {
    postTable.innerHTML = `
        <tr>
            <td colspan="9" class="loading">
                <i class="bi bi-hourglass-split"></i>
                Đang tải bài viết...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_URL}/bai-dang`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                text || "Không thể lấy danh sách bài viết"
            );
        }

        posts = await response.json();

        displayPosts(posts);

    } catch (error) {
        console.error("Lỗi load bài viết:", error);

        postTable.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    Không thể tải danh sách bài viết.
                </td>
            </tr>
        `;

        showMessage(
            error.message || "Không thể kết nối tới Backend!",
            "error"
        );
    }
}

function normalizeStatus(status) {
    if (
        status === null ||
        status === undefined ||
        status === ""
    ) {
        return "PENDING";
    }

    const value = status
        .toString()
        .trim()
        .toUpperCase();

    if (
        value === "PENDING" ||
        value === "CHO_DUYET" ||
        value === "CHỜ DUYỆT" ||
        value === "CHO DUYET"
    ) {
        return "PENDING";
    }

    if (
        value === "APPROVED" ||
        value === "DA_DUYET" ||
        value === "ĐÃ DUYỆT" ||
        value === "DA DUYET"
    ) {
        return "APPROVED";
    }

    if (
        value === "REJECTED" ||
        value === "TU_CHOI" ||
        value === "TỪ CHỐI" ||
        value === "TU CHOI"
    ) {
        return "REJECTED";
    }

    return "PENDING";
}

function getImageUrl(image) {
    if (!image) {
        return null;
    }

    let imageName = image
        .toString()
        .trim();

    if (!imageName) {
        return null;
    }

    if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://")
    ) {
        return imageName;
    }

    imageName = imageName
        .replace(/^\/+/, "")
        .replace(/^uploads\//i, "");

    return UPLOAD_URL + imageName;
}

function displayPosts(data) {
    totalPost.textContent = data.length;

    if (data.length === 0) {
        postTable.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    Không có bài viết nào.
                </td>
            </tr>
        `;
        return;
    }

    postTable.innerHTML = "";

    data.forEach(post => {
        const tr = document.createElement("tr");

        const status = normalizeStatus(post.trangThai);

        let statusText = "CHỜ DUYỆT";
        let statusClass = "pending";

        if (status === "APPROVED") {
            statusText = "ĐÃ DUYỆT";
            statusClass = "approved";
        }

        if (status === "REJECTED") {
            statusText = "TỪ CHỐI";
            statusClass = "rejected";
        }

        let userName = "Không xác định";

        if (post.user) {
            userName =
                post.user.username ||
                post.user.fullName ||
                post.user.name ||
                "Không xác định";
        }

        let date = "";

        if (post.ngayDang) {
            date = new Date(
                post.ngayDang
            ).toLocaleString("vi-VN");
        }

        const content = post.noiDung || "";

        let imageHtml = `
            <span class="no-image">
                Không có ảnh
            </span>
        `;

        const imageUrl = getImageUrl(post.anh);

        if (imageUrl) {
            imageHtml = `
                <img
                    src="${imageUrl}"
                    class="post-image"
                    alt="Ảnh bài viết"
                    onclick="previewImage('${escapeAttribute(imageUrl)}')"
                    onerror="imageLoadError(this)"
                >

                <span
                    class="image-error"
                    style="display:none;"
                >
                    Không tải được ảnh
                </span>
            `;
        }

        tr.innerHTML = `
            <td>
                ${post.id ?? ""}
            </td>

            <td>
                <strong>
                    ${escapeHtml(post.tieuDe ?? "")}
                </strong>
            </td>

            <td>
                <span class="category">
                    ${escapeHtml(post.theLoai ?? "Chưa có")}
                </span>
            </td>

            <td>
                ${escapeHtml(userName)}
            </td>

            <td>
                <div class="content-preview">
                    ${escapeHtml(content)}
                </div>
            </td>

            <td>
                <div class="image-preview">
                    ${imageHtml}
                </div>
            </td>

            <td>
                ${escapeHtml(date)}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${statusText}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    ${
            status === "PENDING"
                ? `
                                <button
                                    type="button"
                                    class="approve-btn"
                                    onclick="approvePost(${post.id})"
                                >
                                    <i class="bi bi-check-circle"></i>
                                    DUYỆT
                                </button>

                                <button
                                    type="button"
                                    class="reject-btn"
                                    onclick="rejectPost(${post.id})"
                                >
                                    <i class="bi bi-x-circle"></i>
                                    TỪ CHỐI
                                </button>
                            `
                : ""
        }

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deletePost(${post.id})"
                    >
                        <i class="bi bi-trash"></i>
                        XÓA
                    </button>

                </div>
            </td>
        `;

        postTable.appendChild(tr);
    });
}

function imageLoadError(img) {
    img.style.display = "none";

    if (img.nextElementSibling) {
        img.nextElementSibling.style.display = "inline";
    }
}

function previewImage(imageUrl) {
    const modal = document.createElement("div");

    modal.className = "image-modal";

    modal.innerHTML = `
        <div class="image-modal-content">

            <button
                type="button"
                class="close-image"
                onclick="closeImageModal(this)"
            >
                <i class="bi bi-x-lg"></i>
            </button>

            <img
                src="${escapeAttribute(imageUrl)}"
                alt="Xem ảnh bài viết"
            >

        </div>
    `;

    modal.addEventListener(
        "click",
        function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        }
    );

    document.body.appendChild(modal);
}

function closeImageModal(button) {
    const modal =
        button.closest(".image-modal");

    if (modal) {
        modal.remove();
    }
}

searchInput.addEventListener(
    "input",
    filterPosts
);

statusFilter.addEventListener(
    "change",
    filterPosts
);

function filterPosts() {
    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const filteredPosts =
        posts.filter(post => {

            const title =
                String(
                    post.tieuDe ?? ""
                ).toLowerCase();

            const content =
                String(
                    post.noiDung ?? ""
                ).toLowerCase();

            const category =
                String(
                    post.theLoai ?? ""
                ).toLowerCase();

            const userName =
                post.user
                    ? String(
                        post.user.username ||
                        post.user.fullName ||
                        post.user.name ||
                        ""
                    ).toLowerCase()
                    : "";

            const status =
                normalizeStatus(
                    post.trangThai
                );

            const matchKeyword =
                title.includes(keyword) ||
                content.includes(keyword) ||
                category.includes(keyword) ||
                userName.includes(keyword);

            const matchStatus =
                selectedStatus === "ALL" ||
                status === selectedStatus;

            return (
                matchKeyword &&
                matchStatus
            );
        });

    displayPosts(filteredPosts);
}

async function approvePost(id) {
    if (
        !confirm(
            "Bạn có chắc chắn muốn duyệt bài viết này?"
        )
    ) {
        return;
    }

    await updateStatus(
        id,
        "APPROVED"
    );
}

async function rejectPost(id) {
    if (
        !confirm(
            "Bạn có chắc chắn muốn từ chối bài viết này?"
        )
    ) {
        return;
    }

    await updateStatus(
        id,
        "REJECTED"
    );
}

async function updateStatus(
    id,
    status
) {
    try {
        const response =
            await fetch(
                `${API_URL}/trang-thai/${id}?trangThai=${encodeURIComponent(status)}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const text =
            await response.text();

        if (!response.ok) {
            throw new Error(
                text ||
                "Cập nhật trạng thái thất bại"
            );
        }

        showMessage(
            status === "APPROVED"
                ? "Duyệt bài thành công!"
                : "Đã từ chối bài viết!",
            "success"
        );

        await loadPosts();

    } catch (error) {

        console.error(
            "Lỗi cập nhật trạng thái:",
            error
        );

        showMessage(
            error.message ||
            "Không thể cập nhật trạng thái!",
            "error"
        );
    }
}

async function deletePost(id) {
    if (
        !confirm(
            "Bạn có chắc chắn muốn xóa bài viết này?"
        )
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const text =
            await response.text();

        if (!response.ok) {
            throw new Error(
                text ||
                "Xóa bài viết thất bại"
            );
        }

        showMessage(
            "Xóa bài viết thành công!",
            "success"
        );

        await loadPosts();

    } catch (error) {

        console.error(
            "Lỗi xóa bài viết:",
            error
        );

        showMessage(
            error.message ||
            "Không thể xóa bài viết!",
            "error"
        );
    }
}

function showMessage(
    text,
    type
) {
    message.textContent = text;
    message.className = type;

    setTimeout(
        () => {
            message.textContent = "";
            message.className = "";
        },
        3000
    );
}

function escapeHtml(text) {
    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

function escapeAttribute(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    window.location.href =
        "diendanuas.html";
}

loadPosts();