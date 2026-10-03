package com.example.USTH_BE.service;

import com.example.USTH_BE.entity.BaiDang;
import com.example.USTH_BE.entity.User;
import com.example.USTH_BE.repository.BaiDangRepository;
import com.example.USTH_BE.repository.UserRepository;
import com.example.USTH_BE.util.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DienDanService {

    private final BaiDangRepository baiDangRepository;

    private final UserRepository userRepository;

    private final JwtUtil jwtUtil;

    private final Path imageDirectory;

    public DienDanService(
            BaiDangRepository baiDangRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            @Value("${app.upload.dir}") String uploadDir
    ) {

        this.baiDangRepository = baiDangRepository;

        this.userRepository = userRepository;

        this.jwtUtil = jwtUtil;

        this.imageDirectory =
                Paths.get(uploadDir)
                        .toAbsolutePath()
                        .normalize()
                        .resolve("images");
    }

    public BaiDang dangBai(
            String token,
            String tieuDe,
            String noiDung,
            String theLoai,
            MultipartFile anh
    ) throws IOException {

        Long userId =
                jwtUtil.extractUserId(token);

        if (userId == null) {
            throw new RuntimeException(
                    "Không lấy được userId từ token"
            );
        }

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Không tìm thấy người dùng"
                                )
                        );

        BaiDang baiDang =
                new BaiDang();

        baiDang.setTieuDe(tieuDe);

        baiDang.setNoiDung(noiDung);

        baiDang.setTheLoai(theLoai);

        baiDang.setUser(user);

        baiDang.setTrangThai("PENDING");

        if (anh != null &&
                !anh.isEmpty()) {

            String contentType =
                    anh.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                throw new RuntimeException(
                        "File tải lên không phải ảnh"
                );
            }

            if (anh.getSize() >
                    5 * 1024 * 1024) {

                throw new RuntimeException(
                        "Ảnh không được lớn hơn 5MB"
                );
            }

            String originalName =
                    anh.getOriginalFilename();

            if (originalName == null ||
                    originalName.isBlank()) {

                originalName = "image";
            }

            String extension = "";

            int dot =
                    originalName.lastIndexOf(".");

            if (dot >= 0) {
                extension =
                        originalName.substring(dot);
            }

            String newFileName =
                    UUID.randomUUID()
                            .toString()
                            + extension;

            Path uploadPath =
                    imageDirectory;

            Files.createDirectories(
                    uploadPath
            );

            Path filePath =
                    uploadPath.resolve(
                            newFileName
                    );

            Files.copy(
                    anh.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            baiDang.setAnh(
                    "/uploads/images/" + newFileName
            );
        }

        return baiDangRepository.save(
                baiDang
        );
    }

    public List<BaiDang> layTatCaBai() {

        return baiDangRepository
                .findAll();
    }

    public BaiDang layBaiTheoId(
            Long id
    ) {

        return baiDangRepository
                .findById(id)
                .orElse(null);
    }

    public List<BaiDang> layBaiTheoTheLoai(
            String theLoai
    ) {

        return baiDangRepository
                .findByTheLoai(theLoai);
    }

    public List<BaiDang> layBaiCuaUser(
            Long userId
    ) {

        return baiDangRepository
                .findByUserId(userId);
    }

    public BaiDang capNhatTrangThai(
            Long id,
            String trangThai
    ) {

        BaiDang baiDang =
                baiDangRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Không tìm thấy bài viết"
                                )
                        );

        if (trangThai == null ||
                trangThai.isBlank()) {

            throw new RuntimeException(
                    "Trạng thái không được để trống"
            );
        }

        trangThai =
                trangThai
                        .trim()
                        .toUpperCase();

        if (
                !trangThai.equals("PENDING")
                        &&
                        !trangThai.equals("APPROVED")
                        &&
                        !trangThai.equals("REJECTED")
        ) {

            throw new RuntimeException(
                    "Trạng thái không hợp lệ"
            );
        }

        baiDang.setTrangThai(
                trangThai
        );

        return baiDangRepository.save(
                baiDang
        );
    }

    public void xoaBai(
            Long id
    ) {

        if (!baiDangRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Không tìm thấy bài viết"
            );
        }

        baiDangRepository
                .deleteById(id);
    }
}