package com.example.USTH_BE.service;

import com.example.USTH_BE.entity.BaiDangQuanTri;
import com.example.USTH_BE.entity.User;
import com.example.USTH_BE.repository.BaiDangQuanTriRepository;
import com.example.USTH_BE.repository.UserRepository;
import com.example.USTH_BE.util.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BaiDangQuanTriService {

    private final BaiDangQuanTriRepository baiDangQuanTriRepository;

    private final UserRepository userRepository;

    private final JwtUtil jwtUtil;

    private final Path pdfDirectory =
            Paths.get("uploads/pdf");

    private final Path imageDirectory =
            Paths.get("uploads/images");

    public BaiDangQuanTri dangBai(
            String token,
            String tieuDe,
            String noiDung,
            String theLoai,
            MultipartFile pdf,
            MultipartFile image
    ) throws IOException {

        Long userId =
                jwtUtil.extractUserId(token);

        if (userId == null) {
            throw new RuntimeException(
                    "Không xác định được người dùng."
            );
        }

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy người dùng."
                                )
                        );

        if (tieuDe == null ||
                tieuDe.trim().isEmpty()) {

            throw new RuntimeException(
                    "Tiêu đề không được để trống."
            );
        }

        if (noiDung == null ||
                noiDung.trim().isEmpty()) {

            throw new RuntimeException(
                    "Nội dung không được để trống."
            );
        }

        if (theLoai == null ||
                theLoai.trim().isEmpty()) {

            throw new RuntimeException(
                    "Vui lòng chọn thể loại."
            );
        }

        if (pdf == null ||
                pdf.isEmpty()) {

            throw new RuntimeException(
                    "Vui lòng upload file PDF."
            );
        }

        if (!isAllowedCategory(theLoai)) {

            throw new RuntimeException(
                    "Thể loại không hợp lệ."
            );
        }

        if (!isPdf(pdf)) {

            throw new RuntimeException(
                    "File phải là PDF."
            );
        }

        if (pdf.getSize() >
                50L * 1024 * 1024) {

            throw new RuntimeException(
                    "File PDF không được vượt quá 50MB."
            );
        }

        if (image != null &&
                !image.isEmpty()) {

            if (!isImage(image)) {

                throw new RuntimeException(
                        "Ảnh minh họa không hợp lệ."
                );
            }

            if (image.getSize() >
                    5L * 1024 * 1024) {

                throw new RuntimeException(
                        "Ảnh minh họa không được vượt quá 5MB."
                );
            }
        }

        Files.createDirectories(
                pdfDirectory
        );

        Files.createDirectories(
                imageDirectory
        );

        String pdfFileName =
                UUID.randomUUID()
                        + ".pdf";

        Path pdfPath =
                pdfDirectory.resolve(
                        pdfFileName
                );

        Files.copy(
                pdf.getInputStream(),
                pdfPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        String pdfUrl =
                "/uploads/pdf/" +
                        pdfFileName;

        String imageUrl = null;

        if (image != null &&
                !image.isEmpty()) {

            String extension =
                    getImageExtension(image);

            String imageFileName =
                    UUID.randomUUID()
                            + extension;

            Path imagePath =
                    imageDirectory.resolve(
                            imageFileName
                    );

            Files.copy(
                    image.getInputStream(),
                    imagePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            imageUrl =
                    "/uploads/images/" +
                            imageFileName;
        }

        BaiDangQuanTri baiDang =
                new BaiDangQuanTri();

        baiDang.setTieuDe(
                tieuDe.trim()
        );

        baiDang.setNoiDung(
                noiDung.trim()
        );

        baiDang.setTheLoai(
                theLoai.trim()
        );

        baiDang.setFilePdf(
                pdfUrl
        );

        baiDang.setAnhMinhHoa(
                imageUrl
        );

        baiDang.setUser(
                user
        );

        return baiDangQuanTriRepository.save(
                baiDang
        );
    }

    private boolean isAllowedCategory(
            String theLoai
    ) {

        return theLoai.equals("Meme")
                || theLoai.equals("Kiến thức")
                || theLoai.equals("Tin tức")
                || theLoai.equals("Hoạt động CLB");
    }

    private boolean isPdf(
            MultipartFile file
    ) {

        String contentType =
                file.getContentType();

        String fileName =
                file.getOriginalFilename();

        return
                "application/pdf".equalsIgnoreCase(
                        contentType
                )
                        ||
                        (
                                fileName != null
                                        &&
                                        fileName
                                                .toLowerCase()
                                                .endsWith(".pdf")
                        );
    }

    private boolean isImage(
            MultipartFile file
    ) {

        String contentType =
                file.getContentType();

        return
                "image/jpeg".equalsIgnoreCase(
                        contentType
                )
                        ||
                        "image/png".equalsIgnoreCase(
                                contentType
                        )
                        ||
                        "image/webp".equalsIgnoreCase(
                                contentType
                        );
    }

    private String getImageExtension(
            MultipartFile file
    ) {

        String contentType =
                file.getContentType();

        if ("image/png".equalsIgnoreCase(
                contentType
        )) {

            return ".png";
        }

        if ("image/webp".equalsIgnoreCase(
                contentType
        )) {

            return ".webp";
        }

        return ".jpg";
    }

    public List<BaiDangQuanTri> getAll() {

        return baiDangQuanTriRepository
                .findAll();
    }

    public List<BaiDangQuanTri> getByTheLoai(
            String theLoai
    ) {

        return baiDangQuanTriRepository
                .findByTheLoai(theLoai);
    }

    public BaiDangQuanTri getById(
            Long id
    ) {

        return baiDangQuanTriRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy bài đăng."
                        )
                );
    }

    public void delete(Long id) {

        BaiDangQuanTri baiDang =
                baiDangQuanTriRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy bài đăng."
                                )
                        );

        baiDangQuanTriRepository.delete(
                baiDang
        );
    }
}