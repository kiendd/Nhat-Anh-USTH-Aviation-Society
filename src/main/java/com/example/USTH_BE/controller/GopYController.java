package com.example.USTH_BE.controller;

import com.example.USTH_BE.entity.GopY;
import com.example.USTH_BE.repository.GopYRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/gopy")
@CrossOrigin(origins = "*")
public class GopYController {

    private final GopYRepository gopYRepository;

    public GopYController(GopYRepository gopYRepository) {
        this.gopYRepository = gopYRepository;
    }

    @PostMapping
    public ResponseEntity<?> themGopY(@RequestBody GopY gopY) {

        gopY.setNgayGui(LocalDateTime.now());

        GopY saved = gopYRepository.save(gopY);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<GopY>> layTatCaGopY() {

        return ResponseEntity.ok(
                gopYRepository.findAll()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaGopY(@PathVariable Long id) {

        if (!gopYRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        gopYRepository.deleteById(id);

        return ResponseEntity.ok("Xóa góp ý thành công");
    }
}