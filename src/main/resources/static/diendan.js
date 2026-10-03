const authArea = document.getElementById("authArea");

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (token && username) {

    authArea.innerHTML = `
        <span style="color: yellow;">
            <i class="bi bi-person-circle"></i>
            ${username}
        </span>

        <button
            class="btnlogout"
            onclick="logout()">

            <i class="bi bi-box-arrow-right"></i>
            ĐĂNG XUẤT

        </button>
    `;

} else {

    authArea.innerHTML = `
        <a href="login.html">
            <button
                type="button"
                class="btnlogin"
                style="color: white !important;">

                <i
                    class="bi bi-door-open"
                    style="color: white;">
                </i>

                ĐĂNG NHẬP

            </button>
        </a>
    `;
}


const buttonDangBai =
    document.getElementById("buttondangbai");

if (buttonDangBai) {

    buttonDangBai.addEventListener("click", function () {

        if (token) {

            window.location.href =
                "dangbai.html";

        } else {

            window.location.href =
                "login.html";

        }

    });

}


const buttonQuanTri =
    document.getElementById("buttonquantri");

if (buttonQuanTri) {

    const currentRole =
        role ? role.trim().toLowerCase() : "";

    if (
        token &&
        (
            currentRole === "admin" ||
            currentRole === "root"
        )
    ) {

        buttonQuanTri.style.display =
            "block";

    } else {

        buttonQuanTri.style.display =
            "none";

    }

    buttonQuanTri.addEventListener(
        "click",
        function () {

            window.location.href =
                "admin.html";

        }
    );

}


const API_URL =
    "/api/diendan/bai-dang";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadBaiDang();

    }
);


async function loadBaiDang() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            console.error(
                "API không trả về Array"
            );

            return;

        }


        const posts =
            data
                .filter(function (post) {

                    return (
                        post.trangThai ===
                        "APPROVED"
                    );

                })
                .sort(function (a, b) {

                    return (
                        new Date(b.ngayDang) -
                        new Date(a.ngayDang)
                    );

                });


        renderBaiDang(
            posts.slice(0, 9)
        );


    } catch (error) {

        console.error(
            "Lỗi khi tải bài đăng:",
            error
        );

    }

}


function renderBaiDang(posts) {

    const boxes =
        document.querySelectorAll(
            ".baiviet-box"
        );


    boxes.forEach(function (box) {

        box.style.display =
            "none";

        box.onclick =
            null;

    });


    posts.forEach(
        function (post, index) {

            const box =
                boxes[index];


            if (!box) {

                return;

            }


            box.style.display =
                "block";


            const imageArea =
                box.querySelector(
                    ".baiviet-image"
                );


            const title =
                box.querySelector(
                    ".baiviet-title"
                );


            const description =
                box.querySelector(
                    ".baiviet-description"
                );


            const user =
                box.querySelector(
                    ".baiviet-user"
                );


            const date =
                box.querySelector(
                    ".baiviet-date"
                );


            if (title) {

                title.textContent =
                    post.tieuDe ||
                    "Không có tiêu đề";

            }


            if (description) {

                description.textContent =
                    post.noiDung ||
                    "";

            }


            if (user) {

                if (post.user) {

                    user.textContent =
                        "Đăng bởi: " +
                        (
                            post.user.fullName ||
                            post.user.username ||
                            "Thành viên"
                        );

                } else {

                    user.textContent =
                        "Đăng bởi: Thành viên";

                }

            }


            if (date) {

                if (post.ngayDang) {

                    const ngay =
                        new Date(
                            post.ngayDang
                        );


                    date.textContent =
                        ngay.toLocaleDateString(
                            "vi-VN"
                        ) +
                        " " +
                        ngay.toLocaleTimeString(
                            "vi-VN",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        );

                } else {

                    date.textContent =
                        "";

                }

            }


            if (imageArea) {

                imageArea.innerHTML =
                    "";


                if (post.anh) {

                    let imageUrl =
                        post.anh;


                    if (
                        !imageUrl.startsWith(
                            "http://"
                        ) &&
                        !imageUrl.startsWith(
                            "https://"
                        )
                    ) {

                        if (
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


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        imageUrl;


                    image.alt =
                        post.tieuDe ||
                        "Bài đăng diễn đàn";


                    image.onerror =
                        function () {

                            image.src =
                                "https://via.placeholder.com/1200x500/0a192f/FFEF63?text=USTH+Aviation";

                        };


                    imageArea.appendChild(
                        image
                    );

                }

            }


            box.onclick =
                function () {

                    if (!post.id) {

                        return;

                    }


                    window.location.href =
                        "chitietbaidang.html?id=" +
                        post.id;

                };


            box.style.cursor =
                "pointer";

        }
    );

}


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


const searchForm =
    document.getElementById(
        "searchForm"
    );


const oTimKiem =
    document.getElementById(
        "noidung"
    );


if (
    searchForm &&
    oTimKiem
) {

    searchForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const tuKhoa =
                oTimKiem.value.trim();


            if (
                tuKhoa.length === 0
            ) {

                window.location.href =
                    "tatcabaiviet.html";

                return;

            }


            window.location.href =
                "tatcabaiviet.html?noidung=" +
                encodeURIComponent(
                    tuKhoa
                );

        }
    );

}