const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");
const currentUserId = localStorage.getItem("userId");

const adminName =
    document.getElementById("adminName");

const userTable =
    document.getElementById("userTable");

const totalUser =
    document.getElementById("totalUser");

const searchInput =
    document.getElementById("searchInput");

const message =
    document.getElementById("message");


// =====================================================
// KIỂM TRA ĐĂNG NHẬP
// =====================================================

if (!token || !username || !role) {

    alert("Bạn chưa đăng nhập!");

    window.location.href = "login.html";

} else {

    const currentRole =
        role.trim().toLowerCase();

    // Chỉ ADMIN và ROOT được vào trang quản trị
    if (
        currentRole !== "admin" &&
        currentRole !== "root"
    ) {

        alert("Bạn không có quyền truy cập!");

        window.location.href =
            "diendanuas.html";
    }
}


// =====================================================
// HIỂN THỊ TÊN ADMIN
// =====================================================

if (adminName) {

    adminName.textContent =
        username || "ADMIN";

}


// =====================================================
// DANH SÁCH USER
// =====================================================

let users = [];


// =====================================================
// LOAD USERS
// =====================================================

async function loadUsers() {

    userTable.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "/api/users",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token,

                    "Content-Type":
                        "application/json"
                }
            }
        );


        console.log(
            "Status:",
            response.status
        );


        if (!response.ok) {

            const text =
                await response.text();

            console.log(
                "Backend response:",
                text
            );

            throw new Error(
                "Backend trả về HTTP " +
                response.status
            );
        }


        users =
            await response.json();


        console.log(
            "Users:",
            users
        );


        displayUsers(users);


    } catch (error) {

        console.error(
            "LỖI:",
            error
        );


        userTable.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty"
                >
                    Không lấy được dữ liệu user
                </td>
            </tr>
        `;


        showMessage(
            error.message,
            "error"
        );
    }
}


// =====================================================
// HIỂN THỊ USERS
// =====================================================

function displayUsers(data) {

    totalUser.textContent =
        data.length;


    userTable.innerHTML = "";


    if (data.length === 0) {

        userTable.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty"
                >
                    Không có user nào
                </td>
            </tr>
        `;

        return;
    }


    // Role của người đang đăng nhập
    const currentRole =
        role
            ? role.trim().toLowerCase()
            : "";


    data.forEach(user => {

        const userRole =
            user.role
                ? String(user.role)
                    .trim()
                    .toLowerCase()
                : "member";


        // =================================================
        // KIỂM TRA QUYỀN XÓA
        // =================================================

        let canDelete = false;


        /*
         * ROOT
         * -----------------------------------------------
         * ROOT được xóa:
         * - MEMBER
         * - ADMIN
         * - ROOT khác
         *
         * Nhưng không được tự xóa chính mình.
         */

        if (currentRole === "root") {

            if (
                String(user.id) !==
                String(currentUserId)
            ) {

                canDelete = true;

            }

        }


        /*
         * ADMIN
         * -----------------------------------------------
         * ADMIN chỉ được xóa MEMBER.
         *
         * ADMIN KHÔNG được xóa:
         * - ADMIN
         * - ROOT
         */

        else if (currentRole === "admin") {

            if (
                userRole === "member"
            ) {

                canDelete = true;

            }

        }


        // =================================================
        // TẠO NÚT XÓA
        // =================================================

        let deleteButton = "";


        if (canDelete) {

            deleteButton = `
                <button
                    class="delete-btn"
                    onclick="deleteUser(
                        ${user.id},
                        '${userRole}'
                    )">

                    <i class="bi bi-trash"></i>

                    XÓA

                </button>
            `;

        } else {

            deleteButton = `
                <span
                    style="
                        color: #888;
                        font-size: 13px;
                    "
                >
                    Không được phép
                </span>
            `;
        }


        // =================================================
        // HIỂN THỊ ROLE
        // =================================================

        let roleClass = "";


        if (
            userRole === "admin" ||
            userRole === "root"
        ) {

            roleClass = "admin";

        }


        // =================================================
        // TẠO ROW
        // =================================================

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${user.id ?? ""}
            </td>


            <td>
                ${user.name ??
                    user.username ??
                    ""}
            </td>


            <td>
                ${user.email ?? ""}
            </td>


            <td>
                ${user.school ?? ""}
            </td>


            <td>
                ${user.major ?? ""}
            </td>


            <td>
                ${user.cohort ??
                    user.academicYear ??
                    ""}
            </td>


            <td>

                <span
                    class="role ${roleClass}"
                >
                    ${user.role ?? "MEMBER"}
                </span>

            </td>


            <td>

                ${deleteButton}

            </td>

        `;


        userTable.appendChild(tr);

    });

}


// =====================================================
// TÌM KIẾM USER
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            const filteredUsers =
                users.filter(user => {


                    const name =
                        String(
                            user.name ??
                            user.username ??
                            ""
                        )
                        .toLowerCase();


                    const email =
                        String(
                            user.email ??
                            ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(keyword) ||
                        email.includes(keyword)
                    );

                });


            displayUsers(
                filteredUsers
            );

        }
    );

}


// =====================================================
// XÓA USER
// =====================================================

async function deleteUser(
    id,
    targetRole
) {

    const currentRole =
        role
            ? role.trim().toLowerCase()
            : "";


    const target =
        targetRole
            ? targetRole.trim().toLowerCase()
            : "";


    // =================================================
    // ROOT
    // =================================================

    if (currentRole === "root") {

        // ROOT không được tự xóa mình
        if (
            String(id) ===
            String(currentUserId)
        ) {

            alert(
                "Bạn không thể tự xóa tài khoản ROOT!"
            );

            return;
        }

    }


    // =================================================
    // ADMIN
    // =================================================

    else if (currentRole === "admin") {

        /*
         * ADMIN chỉ được xóa MEMBER.
         */

        if (target !== "member") {

            alert(
                "ADMIN chỉ được xóa tài khoản MEMBER!"
            );

            return;
        }

    }


    // =================================================
    // KHÔNG PHẢI ADMIN / ROOT
    // =================================================

    else {

        alert(
            "Bạn không có quyền xóa tài khoản!"
        );

        return;
    }


    // =================================================
    // XÁC NHẬN
    // =================================================

    if (
        !confirm(
            "Bạn có chắc muốn xóa user này?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/users/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        console.log(
            "Delete status:",
            response.status
        );


        if (!response.ok) {

            const text =
                await response.text();

            console.log(
                "Backend response:",
                text
            );


            throw new Error(
                "Xóa thất bại - HTTP " +
                response.status
            );
        }


        showMessage(
            "Xóa user thành công!",
            "success"
        );


        // Load lại danh sách
        await loadUsers();


    } catch (error) {

        console.error(
            "LỖI XÓA USER:",
            error
        );


        showMessage(
            error.message,
            "error"
        );
    }

}


// =====================================================
// HIỂN THỊ MESSAGE
// =====================================================

function showMessage(
    text,
    type
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        type;


    setTimeout(() => {

        message.textContent =
            "";

        message.className =
            "";

    }, 3000);

}


// =====================================================
// LOGOUT
// =====================================================

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


loadUsers();