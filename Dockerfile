# ===== Build stage =====
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Tải trước dependency để tận dụng cache layer
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build ứng dụng (bỏ qua test để image build nhanh; chạy test riêng khi cần)
COPY src ./src
RUN mvn -B -DskipTests package

# ===== Runtime stage =====
FROM eclipse-temurin:17-jre

WORKDIR /app

# Chạy bằng user không phải root
RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

COPY --from=build --chown=app:app /build/target/*.jar app.jar

USER app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
