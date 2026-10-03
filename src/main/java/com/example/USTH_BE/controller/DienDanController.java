package com.example.USTH_BE.controller;

import com.example.USTH_BE.entity.BaiDang;
import com.example.USTH_BE.service.DienDanService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/diendan")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
@RequiredArgsConstructor
public class DienDanController {

    private final DienDanService dienDanService;

    @PostMapping(
            value = "/dang-bai",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> dangBai(
            @RequestHeader("Authorization") String authorization,
            @RequestParam("tieuDe") String tieuDe,
            @RequestParam("noiDung") String noiDung,
            @RequestParam("theLoai") String theLoai,
            @RequestParam(value = "anh", required = false) MultipartFile anh
    ) {
        try {

            if (authorization == null ||
                    authorization.isBlank()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Bạn chưa đăng nhập"
                                )
                        );
            }

            String token = authorization;

            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (token.isBlank()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Token không hợp lệ"
                                )
                        );
            }

            BaiDang baiDang =
                    dienDanService.dangBai(
                            token,
                            tieuDe,
                            noiDung,
                            theLoai,
                            anh
                    );

            return ResponseEntity.ok(baiDang);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Đăng bài thất bại"
                            )
                    );
        }
    }

    @GetMapping("/bai-dang")
    public ResponseEntity<?> layTatCaBai() {

        try {

            return ResponseEntity.ok(
                    dienDanService.layTatCaBai()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Không thể lấy danh sách bài"
                            )
                    );
        }
    }

    @GetMapping("/bai-dang/{id}")
    public ResponseEntity<?> layBaiTheoId(
            @PathVariable Long id
    ) {

        try {

            BaiDang baiDang =
                    dienDanService.layBaiTheoId(id);

            if (baiDang == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(baiDang);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Không thể lấy bài viết"
                            )
                    );
        }
    }

    @GetMapping("/the-loai/{theLoai}")
    public ResponseEntity<?> layBaiTheoTheLoai(
            @PathVariable String theLoai
    ) {

        try {

            return ResponseEntity.ok(
                    dienDanService.layBaiTheoTheLoai(
                            theLoai
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Không thể lấy bài viết"
                            )
                    );
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> layBaiCuaUser(
            @PathVariable Long userId
    ) {

        try {

            return ResponseEntity.ok(
                    dienDanService.layBaiCuaUser(
                            userId
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Không thể lấy bài viết"
                            )
                    );
        }
    }

    @PutMapping("/trang-thai/{id}")
    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Long id,
            @RequestParam String trangThai
    ) {

        try {

            BaiDang baiDang =
                    dienDanService.capNhatTrangThai(
                            id,
                            trangThai
                    );

            return ResponseEntity.ok(baiDang);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Cập nhật trạng thái thất bại"
                            )
                    );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaBai(
            @PathVariable Long id
    ) {

        try {

            dienDanService.xoaBai(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Xóa bài viết thành công"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Xóa bài viết thất bại"
                            )
                    );
        }
    }
}