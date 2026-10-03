package com.example.USTH_BE.controller;

import com.example.USTH_BE.entity.User;
import com.example.USTH_BE.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {
                "http://127.0.0.1:5500",
                "https://seventh-corny-purse.ngrok-free.dev",
                "http://localhost:5500"

        }
)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user
    ) {

        try {

            User newUser = authService.register(user);

            return ResponseEntity.ok(newUser);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Đăng ký thất bại"
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser
    ) {

        try {

            Object result = authService.login(loginUser);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Đăng nhập thất bại"
                            )
                    );
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(
            @RequestHeader("Authorization") String authorization,
            @RequestBody User user
    ) {

        try {

            User newUser =
                    authService.registerAdmin(authorization, user);

            return ResponseEntity.ok(newUser);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Tạo tài khoản Admin thất bại"
                            )
                    );
        }
    }
}