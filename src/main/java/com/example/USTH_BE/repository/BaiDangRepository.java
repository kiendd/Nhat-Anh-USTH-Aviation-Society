package com.example.USTH_BE.repository;

import com.example.USTH_BE.entity.BaiDang;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaiDangRepository
        extends JpaRepository<BaiDang, Long> {

    List<BaiDang> findByTheLoai(
            String theLoai
    );

    List<BaiDang> findByUserId(
            Long userId
    );

    List<BaiDang> findByTrangThai(
            String trangThai
    );
}