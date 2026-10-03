
const API_URL =
    "/api/diendan/the-loai/" +
    encodeURIComponent("Nội bộ");

let allPosts = [];

let currentPage = 1;

const itemsPerPage = 9;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkAccess();

    }
);


function checkAccess() {

    const token =
        localStorage.getItem("token");

    const username =
        localStorage.getItem("username");

    const role =
        localStorage.getItem("role");


    if (!token) {

        window.location.replace(
            "login.html"
        );

        return;

    }


    const normalizedRole =
        role
            ? role.trim().toLowerCase()
            : "";


    if (
        normalizedRole !== "admin" &&
        normalizedRole !== "root"
    ) {

        alert(
            "Bạn không có quyền truy cập khu vực nội bộ UAS."
        );

        window.location.replace(
            "diendanuas.html"
        );

        return;

    }


    const usernameElement =
        document.getElementById(
            "username"
        );


    const roleElement =
        document.getElementById(
            "role"
        );


    if (usernameElement) {

        usernameElement.textContent =
            username || "Admin";

    }


    if (roleElement) {

        roleElement.textContent =
            normalizedRole.toUpperCase();

    }


    loadInternalPosts(token);

}


async function loadInternalPosts(token) {

    const grid =
        document.getElementById(
            "baivietGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = `
<div class="loading-message">
    Đang tải bài viết nội bộ...
</div>
`;


    try {

        const response =
            await fetch(
                API_URL,
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


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền truy cập khu vực nội bộ."
            );


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


            window.location.replace(
                "login.html"
            );

            return;

        }


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "API không trả về danh sách bài viết."
            );

        }


        allPosts =
            data.filter(
                function (post) {

                    const category =
                        post.theLoai ||
                        "";

                    return (
                        category
                            .trim()
                            .toLowerCase() ===
                        "nội bộ"
                    );

                }
            );


        allPosts.sort(
            function (a, b) {

                return (
                    new Date(
                        b.ngayDang || 0
                    ) -
                    new Date(
                        a.ngayDang || 0
                    )
                );

            }
        );


        currentPage = 1;


        renderPosts();

        renderPagination();


    } catch (error) {

        console.error(
            "Lỗi tải bài viết nội bộ:",
            error
        );


        grid.innerHTML = `
<div class="error-message">
    Không thể tải bài viết nội bộ.
</div>
`;


        const pagination =
            document.getElementById(
                "pagination"
            );


        if (pagination) {

            pagination.innerHTML = "";

        }

    }

}


function renderPosts() {

    const grid =
        document.getElementById(
            "baivietGrid"
        );


    if (!grid) {

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
        allPosts.slice(
            start,
            end
        );


    if (posts.length === 0) {

        grid.innerHTML = `
<div class="empty-message">
    Chưa có bài đăng nội bộ.
</div>
`;

        return;

    }


    posts.forEach(
        function (post, index) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "baiviet-box";


            box.style.cursor =
                "pointer";


            box.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "chitietbaidang.html?id=" +
                        encodeURIComponent(
                            post.id
                        );

                }
            );


            let imageUrl =
                "images/diendan.png";


            if (post.anh) {

                imageUrl =
                    post.anh;


                if (
                    !imageUrl.startsWith(
                        "http://"
                    ) &&
                    !imageUrl.startsWith(
                        "https://"
                    ) &&
                    !imageUrl.startsWith(
                        "/uploads/"
                    )
                ) {

                    imageUrl =
                        "/uploads/" +
                        imageUrl.replace(
                            /^\/+/,
                            ""
                        );

                }

            }


            const user =
                post.user?.username ||
                post.user?.fullName ||
                post.user?.hoTen ||
                "Quản trị viên";


            const date =
                formatDate(
                    post.ngayDang
                );


            const number =
                String(
                    start +
                    index +
                    1
                ).padStart(
                    2,
                    "0"
                );


            const title =
                post.tieuDe ||
                "Không có tiêu đề";


            const content =
                post.noiDung ||
                "";


            box.innerHTML = `

<div class="baiviet-image">

    <img
src="${escapeHTML(
imageUrl
)}"
alt="Bài viết nội bộ"
onerror="this.src='images/diendan.png'"
    >

    </div>


<div class="baiviet-content">

    <div class="baiviet-number">

        #${number}

    </div>


    <div class="internal-label">

        <i class="bi bi-lock-fill"></i>

        NỘI BỘ UAS

    </div>


    <h3 class="baiviet-title">

        ${escapeHTML(
        title
    )}

    </h3>


    <p class="baiviet-description">

        ${escapeHTML(
        createDescription(
            content
        )
    )}

    </p>


    <div class="baiviet-info">

                        <span>

                            <i class="bi bi-person-fill"></i>

                            ${escapeHTML(
                            user
                        )}

                        </span>


        <span>

                            <i class="bi bi-calendar3"></i>

                            ${escapeHTML(
            date
        )}

                        </span>

    </div>

</div>

    `;


            grid.appendChild(
                box
            );

        }
    );

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
            allPosts.length /
            itemsPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    const previous =
        document.createElement(
            "button"
        );


    previous.className =
        "pagination-btn";


    previous.textContent =
        "‹";


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        function () {

            if (
                currentPage <= 1
            ) {

                return;

            }


            currentPage--;


            renderPosts();

            renderPagination();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    pagination.appendChild(
        previous
    );


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "pagination-btn";


        button.textContent =
            i;


        if (
            i === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    i;


                renderPosts();

                renderPagination();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        pagination.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.className =
        "pagination-btn";


    next.textContent =
        "›";


    next.disabled =
        currentPage === totalPages;


    next.addEventListener(
        "click",
        function () {

            if (
                currentPage >= totalPages
            ) {

                return;

            }


            currentPage++;


            renderPosts();

            renderPagination();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    pagination.appendChild(
        next
    );

}


function createDescription(
    content
) {

    if (!content) {

        return "";

    }


    const text =
        String(content)
            .replace(
                /<[^>]*>/g,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        text.length <= 180
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            180
        ) +
        "..."
    );

}


function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleDateString(
        "vi-VN"
    );

}


function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}
