const API_URL = "/api/diendan/admin/dang-bai";

const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const tieuDe = document.getElementById("tieuDe");
const theLoai = document.getElementById("theLoai");
const noiDung = document.getElementById("noiDung");

const titleError = document.getElementById("titleError");
const categoryError = document.getElementById("categoryError");
const contentError = document.getElementById("contentError");

const titleCount = document.getElementById("titleCount");
const contentCount = document.getElementById("contentCount");

const fileInput = document.getElementById("file");
const uploadArea = document.getElementById("uploadArea");

const selectedFile = document.getElementById("selectedFile");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileError = document.getElementById("fileError");

const previewFile = document.getElementById("previewFile");
const removeFile = document.getElementById("removeFile");

const previewSection = document.getElementById("previewSection");
const pdfPreview = document.getElementById("pdfPreview");
const closePreview = document.getElementById("closePreview");

const imageUploadArea = document.getElementById("imageUploadArea");
const imageFile = document.getElementById("imageFile");

const selectedImage = document.getElementById("selectedImage");
const imagePreview = document.getElementById("imagePreview");
const imageName = document.getElementById("imageName");
const imageSize = document.getElementById("imageSize");
const imageError = document.getElementById("imageError");
const removeImage = document.getElementById("removeImage");

const message = document.getElementById("message");

const btnSubmit = document.getElementById("btnSubmit");
const btnCancel = document.getElementById("btnCancel");
const btnBack = document.getElementById("btnBack");

const adminName = document.getElementById("adminName");
const adminAvatar = document.getElementById("adminAvatar");

let currentFile = null;
let currentImage = null;

let currentPreviewUrl = null;
let currentImageUrl = null;


const allowedCategories = [
    "Hỏi đáp",
    "Sự kiện",
    "Thông báo",
    "Học thuật và tài liệu",
    "Khác"
];


document.addEventListener("DOMContentLoaded", function () {

    checkAdmin();

    loadAdminInfo();

    updateTitleCount();

    updateContentCount();

    selectedFile.style.display = "none";

    selectedImage.style.display = "none";

    previewSection.style.display = "none";

});


function checkAdmin() {

    if (!token) {

        alert(
            "Bạn cần đăng nhập để truy cập trang quản trị."
        );

        window.location.href = "login.html";

        return;
    }


    const currentRole =
        role
            ? role.trim().toLowerCase()
            : "";


    if (
        currentRole !== "admin" &&
        currentRole !== "root"
    ) {

        alert(
            "Bạn không có quyền truy cập trang này."
        );

        window.location.href =
            "diendanuas.html";

        return;
    }

}


function loadAdminInfo() {

    const name =
        username &&
        username.trim()
            ? username.trim()
            : "Admin";


    adminName.textContent =
        name;


    adminAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();

}


tieuDe.addEventListener(
    "input",
    function () {

        updateTitleCount();

        titleError.textContent = "";

        hideMessage();

    }
);


noiDung.addEventListener(
    "input",
    function () {

        updateContentCount();

        contentError.textContent = "";

        hideMessage();

    }
);


theLoai.addEventListener(
    "change",
    function () {

        categoryError.textContent = "";

        hideMessage();

    }
);


function updateTitleCount() {

    titleCount.textContent =
        `${tieuDe.value.length} / 200`;

}


function updateContentCount() {

    contentCount.textContent =
        `${noiDung.value.length} / 5000`;

}


fileInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        handlePdfFile(file);

    }
);


uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        handlePdfFile(file);

    }
);


function handlePdfFile(file) {

    clearFileError();


    const isPdf =
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPdf) {

        showFileError(
            "Chỉ được phép upload file PDF."
        );

        resetFile();

        return;
    }


    if (file.size === 0) {

        showFileError(
            "File PDF không hợp lệ."
        );

        resetFile();

        return;
    }


    if (file.size > MAX_PDF_SIZE) {

        showFileError(
            "File PDF không được vượt quá 50MB."
        );

        resetFile();

        return;
    }


    currentFile = file;


    fileName.textContent =
        file.name;


    fileSize.textContent =
        formatFileSize(file.size);


    selectedFile.style.display =
        "flex";


    fileInput.value = "";

    hideMessage();

}


previewFile.addEventListener(
    "click",
    function () {

        if (!currentFile) {

            showFileError(
                "Chưa có file PDF để xem."
            );

            return;
        }


        if (currentPreviewUrl) {

            URL.revokeObjectURL(
                currentPreviewUrl
            );

        }


        currentPreviewUrl =
            URL.createObjectURL(
                currentFile
            );


        pdfPreview.src =
            currentPreviewUrl;


        previewSection.style.display =
            "block";


        previewSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


closePreview.addEventListener(
    "click",
    function () {

        hidePdfPreview();

    }
);


function hidePdfPreview() {

    previewSection.style.display =
        "none";


    pdfPreview.src = "";


    if (currentPreviewUrl) {

        URL.revokeObjectURL(
            currentPreviewUrl
        );

        currentPreviewUrl = null;

    }

}


removeFile.addEventListener(
    "click",
    function () {

        resetFile();

        hidePdfPreview();

        hideMessage();

    }
);


function resetFile() {

    currentFile = null;

    fileInput.value = "";

    fileName.textContent = "-";

    fileSize.textContent = "-";

    selectedFile.style.display =
        "none";

    clearFileError();

}


function clearFileError() {

    fileError.textContent = "";

}


function showFileError(text) {

    fileError.textContent =
        text;

}


imageFile.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        handleImageFile(file);

    }
);


imageUploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        imageUploadArea.classList.add(
            "dragover"
        );

    }
);


imageUploadArea.addEventListener(
    "dragleave",
    function () {

        imageUploadArea.classList.remove(
            "dragover"
        );

    }
);


imageUploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        imageUploadArea.classList.remove(
            "dragover"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        handleImageFile(file);

    }
);


function handleImageFile(file) {

    clearImageError();


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];


    const validType =
        allowedTypes.includes(file.type) ||
        allowedExtensions.includes(extension);


    if (!validType) {

        showImageError(
            "Chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP."
        );

        resetImage();

        return;
    }


    if (file.size === 0) {

        showImageError(
            "Ảnh không hợp lệ."
        );

        resetImage();

        return;
    }


    if (file.size > MAX_IMAGE_SIZE) {

        showImageError(
            "Ảnh không được vượt quá 5MB."
        );

        resetImage();

        return;
    }


    currentImage = file;


    imageName.textContent =
        file.name;


    imageSize.textContent =
        formatFileSize(file.size);


    if (currentImageUrl) {

        URL.revokeObjectURL(
            currentImageUrl
        );

    }


    currentImageUrl =
        URL.createObjectURL(
            currentImage
        );


    imagePreview.src =
        currentImageUrl;


    selectedImage.style.display =
        "flex";


    imageFile.value = "";

    hideMessage();

}


removeImage.addEventListener(
    "click",
    function () {

        resetImage();

        hideMessage();

    }
);


function resetImage() {

    currentImage = null;

    imageFile.value = "";

    imageName.textContent = "-";

    imageSize.textContent = "-";

    imagePreview.src = "";

    selectedImage.style.display =
        "none";


    if (currentImageUrl) {

        URL.revokeObjectURL(
            currentImageUrl
        );

        currentImageUrl = null;

    }


    clearImageError();

}


function clearImageError() {

    imageError.textContent = "";

}


function showImageError(text) {

    imageError.textContent =
        text;

}


function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }


    if (bytes < 1024 * 1024 * 1024) {

        return (
            bytes /
            (1024 * 1024)
        ).toFixed(2) + " MB";

    }


    return (
        bytes /
        (1024 * 1024 * 1024)
    ).toFixed(2) + " GB";

}


btnSubmit.addEventListener(
    "click",
    async function () {

        clearErrors();

        hideMessage();


        if (!validateForm()) {

            return;
        }


        btnSubmit.disabled =
            true;


        btnSubmit.innerHTML =
            "ĐANG ĐĂNG...";


        try {

            const formData =
                new FormData();


            formData.append(
                "tieuDe",
                tieuDe.value.trim()
            );


            formData.append(
                "noiDung",
                noiDung.value.trim()
            );


            formData.append(
                "theLoai",
                theLoai.value
            );


            formData.append(
                "file",
                currentFile
            );


            if (currentImage) {

                formData.append(
                    "image",
                    currentImage
                );

            }


            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        },

                        body: formData
                    }
                );


            let data;


            const contentType =
                response.headers.get(
                    "content-type"
                );


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                const text =
                    await response.text();

                data = {
                    message: text
                };

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Đăng bài thất bại."
                );

            }


            showMessage(
                data.message ||
                "Đăng bài thành công!",
                "success"
            );


            resetForm();


        } catch (error) {

            console.error(
                "Lỗi đăng bài:",
                error
            );


            showMessage(
                error.message ||
                "Không thể kết nối tới máy chủ.",
                "error"
            );


        } finally {

            btnSubmit.disabled =
                false;


            btnSubmit.innerHTML =
                'ĐĂNG BÀI <span class="arrow">→</span>';

        }

    }
);


function validateForm() {

    let valid = true;


    const title =
        tieuDe.value.trim();


    const category =
        theLoai.value.trim();


    const content =
        noiDung.value.trim();


    if (!title) {

        titleError.textContent =
            "Vui lòng nhập tiêu đề.";

        valid = false;

    } else if (title.length < 3) {

        titleError.textContent =
            "Tiêu đề phải có ít nhất 3 ký tự.";

        valid = false;

    } else if (title.length > 200) {

        titleError.textContent =
            "Tiêu đề không được vượt quá 200 ký tự.";

        valid = false;

    }


    if (!category) {

        categoryError.textContent =
            "Vui lòng chọn thể loại.";

        valid = false;

    } else if (
        !allowedCategories.includes(
            category
        )
    ) {

        categoryError.textContent =
            "Thể loại không hợp lệ.";

        valid = false;

    }


    if (!content) {

        contentError.textContent =
            "Vui lòng nhập nội dung.";

        valid = false;

    } else if (content.length < 5) {

        contentError.textContent =
            "Nội dung phải có ít nhất 5 ký tự.";

        valid = false;

    } else if (content.length > 5000) {

        contentError.textContent =
            "Nội dung không được vượt quá 5000 ký tự.";

        valid = false;

    }


    if (!currentFile) {

        showFileError(
            "Vui lòng upload file PDF."
        );

        valid = false;

    }


    return valid;

}


function clearErrors() {

    titleError.textContent = "";

    categoryError.textContent = "";

    contentError.textContent = "";

    fileError.textContent = "";

    imageError.textContent = "";

}


function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.style.display =
        "block";


    if (type === "success") {

        message.style.color =
            "#72e6a0";


        message.style.background =
            "rgba(40, 180, 100, 0.08)";


        message.style.border =
            "1px solid rgba(40, 180, 100, 0.25)";

    } else {

        message.style.color =
            "#ff8585";


        message.style.background =
            "rgba(220, 70, 70, 0.08)";


        message.style.border =
            "1px solid rgba(220, 70, 70, 0.25)";

    }


    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function hideMessage() {

    message.style.display =
        "none";

    message.textContent =
        "";

}


function resetForm() {

    tieuDe.value = "";

    theLoai.value = "";

    noiDung.value = "";


    updateTitleCount();

    updateContentCount();


    resetFile();

    resetImage();

    hidePdfPreview();

}


btnCancel.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Bạn có muốn hủy bài viết này không?"
            );


        if (!confirmed) {
            return;
        }


        resetForm();

        hideMessage();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


btnBack.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin.html";

    }
);


window.addEventListener(
    "beforeunload",
    function () {

        if (currentPreviewUrl) {

            URL.revokeObjectURL(
                currentPreviewUrl
            );

        }


        if (currentImageUrl) {

            URL.revokeObjectURL(
                currentImageUrl
            );

        }

    }
);