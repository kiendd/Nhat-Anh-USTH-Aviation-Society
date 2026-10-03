package com.example.USTH_BE.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig
        implements WebMvcConfigurer {

    private final Path uploadDirectory;

    private final String[] allowedOrigins;

    public WebConfig(
            @Value("${app.upload.dir}") String uploadDir,
            @Value("${app.cors.allowed-origins}") String corsOrigins
    ) {

        this.uploadDirectory =
                Paths.get(uploadDir)
                        .toAbsolutePath()
                        .normalize();

        this.allowedOrigins =
                Arrays.stream(corsOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .toArray(String[]::new);
    }

    @Override
    public void addViewControllers(
            ViewControllerRegistry registry
    ) {

        // Trang chủ của site là home.html (không có index.html).
        registry
                .addRedirectViewController(
                        "/",
                        "/home.html"
                );
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        registry
                .addResourceHandler(
                        "/uploads/**"
                )
                .addResourceLocations(
                        uploadDirectory.toUri().toString()
                );
    }

    @Override
    public void addCorsMappings(
            CorsRegistry registry
    ) {

        registry
                .addMapping("/api/**")
                .allowedOriginPatterns(allowedOrigins)
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
                .allowedHeaders("*");
    }
}
