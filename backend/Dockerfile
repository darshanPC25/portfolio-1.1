# syntax=docker/dockerfile:1
# Backend image: builds the Spring Boot jar, then runs it on a small JRE as a non-root user.
# Build from the backend/ directory:  docker build -t portfolio-backend .

FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY pom.xml ./
# The Maven repository is kept in a build cache, so rebuilds (and retries after
# a network hiccup) do not download everything again.
RUN --mount=type=cache,target=/root/.m2 mvn -q -B dependency:resolve dependency:resolve-plugins
COPY src src
# Tests need Docker (Testcontainers); run them before building with ./mvnw test.
RUN --mount=type=cache,target=/root/.m2 mvn -q -B package -DskipTests \
    && cp target/portfolio-backend-*.jar app.jar

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S portfolio && adduser -S portfolio -G portfolio \
    && mkdir -p /var/lib/portfolio/uploads && chown -R portfolio:portfolio /var/lib/portfolio
WORKDIR /app
COPY --from=build /workspace/app.jar app.jar
USER portfolio

ENV SPRING_PROFILES_ACTIVE=prod \
    UPLOAD_DIRECTORY=/var/lib/portfolio/uploads \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
VOLUME /var/lib/portfolio/uploads
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- http://127.0.0.1:8080/actuator/health | grep -q '"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
