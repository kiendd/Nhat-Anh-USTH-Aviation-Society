const API_URL = "/api/diendan/admin";

document.addEventListener("DOMContentLoaded", function () {

```
const boxes = document.querySelectorAll(".khungnoidung");

console.log("Số box tìm thấy:", boxes.length);

if (boxes.length >= 3) {

    boxes[0].style.cursor = "pointer";
    boxes[1].style.cursor = "pointer";
    boxes[2].style.cursor = "pointer";


    boxes[0].addEventListener("click", function () {

        console.log("Đã click KIẾN THỨC");

        window.location.href = "kienthuc.html";

    });


    boxes[1].addEventListener("click", function () {

        console.log("Đã click TIN TỨC");

        window.location.href = "tintuc.html";

    });


    boxes[2].addEventListener("click", function () {

        console.log("Đã click MEME");

        window.location.href = "meme.html";

    });

}


loadData();
```

});

async function loadData() {

```
try {

    console.log("Đang gọi API:");

    console.log(API_URL);


    const response =
        await fetch(API_URL);


    console.log(
        "HTTP Status:",
        response.status
    );


    if (!response.ok) {

        throw new Error(
            "HTTP Error: " +
            response.status
        );

    }


    const data =
        await response.json();


    console.log(
        "Dữ liệu nhận được:",
        data
    );


    if (!Array.isArray(data)) {

        console.error(
            "API không trả về Array"
        );

        return;

    }


    renderData(data);


} catch (error) {

    console.error(
        "LỖI API:",
        error
    );

}
```

}

function renderData(data) {

```
const boxes =
    document.querySelectorAll(
        ".khungnoidung"
    );


if (boxes.length < 3) {

    console.error(
        "Không tìm thấy đủ 3 box"
    );

    return;

}


renderCategory(
    boxes[0],
    data,
    "Kiến thức"
);


renderCategory(
    boxes[1],
    data,
    "Tin tức"
);


renderCategory(
    boxes[2],
    data,
    "Meme"
);
```

}

function renderCategory(
box,
data,
category
) {

```
const posts =
    data.filter(function (post) {

        if (!post.theLoai) {

            return false;

        }


        return post.theLoai
            .trim()
            .toLowerCase() ===
            category
                .trim()
                .toLowerCase();

    });


console.log(
    category,
    ":",
    posts
);


if (posts.length === 0) {

    console.log(
        "Không có bài:",
        category
    );

    return;

}


const post =
    posts[0];


const title =
    box.querySelector("h3");


const spans =
    box.querySelectorAll("span");


if (title) {

    title.textContent =
        post.tieuDe || "";

}


if (spans.length > 0) {

    spans[0].textContent =
        post.noiDung || "";

}
```

}
