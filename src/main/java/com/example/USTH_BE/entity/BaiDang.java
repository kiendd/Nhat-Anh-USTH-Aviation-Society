package com.example.USTH_BE.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bai_dang_dien_dan")
public class BaiDang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "tieu_de",
            nullable = false
    )
    private String tieuDe;

    @Column(
            name = "noi_dung",
            columnDefinition = "TEXT",
            nullable = false
    )
    private String noiDung;

    @Column(name = "the_loai")
    private String theLoai;

    @Column(name = "anh")
    private String anh;

    @Column(name = "trang_thai")
    private String trangThai;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(name = "ngay_dang")
    private LocalDateTime ngayDang;


    @PrePersist
    protected void onCreate() {

        ngayDang =
                LocalDateTime.now();

        if (trangThai == null) {

            trangThai =
                    "CHO_DUYET";
        }
    }


    // =====================================================
    // GETTER / SETTER
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getTheLoai() {
        return theLoai;
    }

    public void setTheLoai(String theLoai) {
        this.theLoai = theLoai;
    }

    public String getAnh() {
        return anh;
    }

    public void setAnh(String anh) {
        this.anh = anh;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getNgayDang() {
        return ngayDang;
    }

    public void setNgayDang(
            LocalDateTime ngayDang
    ) {
        this.ngayDang = ngayDang;
    }
}