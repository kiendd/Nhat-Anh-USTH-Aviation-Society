package com.example.USTH_BE.repository;

import com.example.USTH_BE.entity.BaiDangQuanTri;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaiDangQuanTriRepository
        extends JpaRepository<BaiDangQuanTri, Long> {

    List<BaiDangQuanTri> findByTheLoai(String theLoai);

    List<BaiDangQuanTri> findByUserId(Long userId);
}