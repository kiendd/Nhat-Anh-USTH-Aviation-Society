package com.example.USTH_BE.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "bai_dang_quan_tri")
@Getter
@Setter
public class BaiDangQuanTri {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tieu_de", nullable = false, length = 200)
    private String tieuDe;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "the_loai", nullable = false, length = 50)
    private String theLoai;

    @Column(name = "file_pdf", nullable = false, length = 500)
    private String filePdf;

    @Column(name = "anh_minh_hoa", length = 500)
    private String anhMinhHoa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "ngay_dang")
    private LocalDateTime ngayDang;

    @PrePersist
    protected void onCreate() {
        ngayDang = LocalDateTime.now();
    }
}

