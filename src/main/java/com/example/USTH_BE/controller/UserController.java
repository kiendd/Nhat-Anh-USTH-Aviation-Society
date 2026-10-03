package com.example.USTH_BE.controller;

import com.example.USTH_BE.entity.User;
import com.example.USTH_BE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(userRepository.findAll());

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();

        }

        userRepository.deleteById(id);

        return ResponseEntity.ok("Xóa user thành công");

    }
}