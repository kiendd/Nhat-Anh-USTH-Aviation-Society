package com.example.USTH_BE.service;

import com.example.USTH_BE.entity.BaiDang;
import com.example.USTH_BE.entity.Role;
import com.example.USTH_BE.entity.User;
import com.example.USTH_BE.repository.BaiDangRepository;
import com.example.USTH_BE.repository.UserRepository;
import com.example.USTH_BE.util.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AuthService {

    private final BaiDangRepository baiDangRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            BaiDangRepository baiDangRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.baiDangRepository = baiDangRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(User user) {

        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {
            throw new RuntimeException(
                    "Username không được để trống"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {
            throw new RuntimeException(
                    "Mật khẩu không được để trống"
            );
        }

        if (userRepository.existsByUsername(
                user.getUsername()
        )) {
            throw new RuntimeException(
                    "Username đã tồn tại"
            );
        }

        if (user.getEmail() != null &&
                !user.getEmail().isBlank() &&
                userRepository.existsByEmail(
                        user.getEmail()
                )) {
            throw new RuntimeException(
                    "Email đã tồn tại"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (user.getRole() == null) {
            user.setRole(Role.member);
        }

        return userRepository.save(user);
    }

    public User registerAdmin(
            String authorization,
            User user
    ) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            throw new RuntimeException(
                    "Token không hợp lệ"
            );
        }

        String token =
                authorization.substring(7);

        Long userId =
                jwtUtil.extractUserId(token);

        if (userId == null) {

            throw new RuntimeException(
                    "Không xác định được người dùng"
            );
        }

        User currentUser =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Không tìm thấy người dùng"
                                )
                        );

        if (currentUser.getRole() != Role.ROOT) {

            throw new RuntimeException(
                    "Chỉ ROOT mới được tạo tài khoản Admin"
            );
        }

        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            throw new RuntimeException(
                    "Username không được để trống"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Mật khẩu không được để trống"
            );
        }

        if (userRepository.existsByUsername(
                user.getUsername()
        )) {

            throw new RuntimeException(
                    "Username đã tồn tại"
            );
        }

        if (user.getEmail() != null &&
                !user.getEmail().isBlank() &&
                userRepository.existsByEmail(
                        user.getEmail()
                )) {

            throw new RuntimeException(
                    "Email đã tồn tại"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        user.setRole(Role.ADMIN);

        return userRepository.save(user);
    }

    public LoginResult login(User loginUser) {

        if (loginUser.getUsername() == null ||
                loginUser.getUsername().isBlank()) {

            throw new RuntimeException(
                    "Username không được để trống"
            );
        }

        if (loginUser.getPassword() == null ||
                loginUser.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Mật khẩu không được để trống"
            );
        }

        User user =
                userRepository
                        .findByUsername(
                                loginUser.getUsername()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Username hoặc mật khẩu không đúng"
                                )
                        );

        boolean passwordCorrect =
                passwordEncoder.matches(
                        loginUser.getPassword(),
                        user.getPassword()
                );

        if (!passwordCorrect) {

            throw new RuntimeException(
                    "Username hoặc mật khẩu không đúng"
            );
        }

        String token =
                jwtUtil.generateToken(
                        user.getId()
                );

        return new LoginResult(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }

    public record LoginResult(
            String token,
            Long userId,
            String username,
            Role role
    ) {
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

            long maxSize =
                    5L * 1024 * 1024;

            if (anh.getSize() > maxSize) {

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
                    Paths.get("uploads");

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
                    newFileName
            );
        }

        return baiDangRepository.save(
                baiDang
        );
    }
}