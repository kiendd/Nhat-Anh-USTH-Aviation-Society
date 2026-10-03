package com.example.USTH_BE.controller;

import com.example.USTH_BE.entity.BaiDangQuanTri;
import com.example.USTH_BE.service.BaiDangQuanTriService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diendan/admin")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        }
)
public class BaiDangQuanTriController {

    private final BaiDangQuanTriService service;

    @PostMapping(
            value = "/dang-bai",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> dangBai(

            @RequestHeader("Authorization")
            String authorization,

            @RequestParam("tieuDe")
            String tieuDe,

            @RequestParam("noiDung")
            String noiDung,

            @RequestParam("theLoai")
            String theLoai,

            @RequestParam("file")
            MultipartFile file,

            @RequestParam(
                    value = "image",
                    required = false
            )
            MultipartFile image
    ) {

        try {

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                createMessage(
                                        "Token không hợp lệ."
                                )
                        );
            }

            String token =
                    authorization.substring(7);

            BaiDangQuanTri baiDang =
                    service.dangBai(
                            token,
                            tieuDe,
                            noiDung,
                            theLoai,
                            file,
                            image
                    );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Đăng bài thành công!"
            );

            response.put(
                    "id",
                    baiDang.getId()
            );

            response.put(
                    "tieuDe",
                    baiDang.getTieuDe()
            );

            response.put(
                    "noiDung",
                    baiDang.getNoiDung()
            );

            response.put(
                    "theLoai",
                    baiDang.getTheLoai()
            );

            response.put(
                    "filePdf",
                    baiDang.getFilePdf()
            );

            response.put(
                    "anhMinhHoa",
                    baiDang.getAnhMinhHoa()
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            createMessage(
                                    "Không thể lưu file."
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            createMessage(
                                    e.getMessage()
                            )
                    );
        }
    }

    @GetMapping
    public ResponseEntity<List<BaiDangQuanTri>>
    getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaiDangQuanTri>
    getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        try {

            service.delete(id);

            return ResponseEntity.ok(
                    createMessage(
                            "Xóa bài viết thành công!"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            createMessage(
                                    e.getMessage()
                            )
                    );
        }
    }

    @GetMapping("/the-loai/{theLoai}")
    public ResponseEntity<List<BaiDangQuanTri>>
    getByTheLoai(
            @PathVariable String theLoai
    ) {

        return ResponseEntity.ok(
                service.getByTheLoai(theLoai)
        );
    }

    private Map<String, String> createMessage(
            String message
    ) {

        Map<String, String> result =
                new HashMap<>();

        result.put(
                "message",
                message
        );

        return result;
    }
}