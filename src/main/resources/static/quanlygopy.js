const API_URL = "/api/gopy";


// LOAD GÓP Ý

async function loadGopY() {

    const table = document.getElementById("gopyTable");

    table.innerHTML = `
        <tr>
            <td colspan="5" class="loading">
                <i class="bi bi-arrow-repeat"></i>
                Đang tải góp ý...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Không thể lấy danh sách góp ý");
        }

        const data = await response.json();

        document.getElementById("totalGopY").textContent =
            data.length;

        if (data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        Chưa có góp ý nào.
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = "";

        data.forEach((gopy, index) => {

            const tr = document.createElement("tr");

            const ngayGui = gopy.ngayGui
                ? formatDate(gopy.ngayGui)
                : "Không xác định";

            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <span class="danh-tinh">
                        ${escapeHTML(gopy.danhTinh || "Ẩn danh")}
                    </span>
                </td>

                <td>
                    <div class="noi-dung">
                        ${escapeHTML(gopy.noiDung || "")}
                    </div>
                </td>

                <td>
                    <span class="ngay-gui">
                        ${ngayGui}
                    </span>
                </td>

                <td>

                    <button
                        class="btn-delete"
                        onclick="deleteGopY(${gopy.id})">

                        <i class="bi bi-trash"></i>
                        Xóa

                    </button>

                </td>

            `;

            table.appendChild(tr);

        });

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Không thể tải dữ liệu góp ý.
                    <br>
                    Kiểm tra Spring Boot đang chạy.
                </td>
            </tr>
        `;
    }
}


// DELETE

async function deleteGopY(id) {

    const confirmDelete =
        confirm("Bạn có chắc muốn xóa góp ý này?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Xóa thất bại");
        }

        alert("Đã xóa góp ý");

        loadGopY();

    } catch (error) {

        console.error(error);

        alert("Không thể xóa góp ý");

    }
}




function formatDate(dateString) {

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}



function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


document.addEventListener(
    "DOMContentLoaded",
    loadGopY
);