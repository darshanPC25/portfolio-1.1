package com.darshanpc.portfolio.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.web.server.Cookie;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.config.SessionRepositoryCustomizer;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Studio sessions stored in PostgreSQL ({@code portfolio.session-store=jdbc}), so a
 * sign-in works across every instance (AWS Lambda) and survives restarts.
 *
 * <p>The cookie keeps exactly the settings of {@code server.servlet.session.cookie.*}
 * (name, HttpOnly, Secure, SameSite=Strict) and the idle timeout of
 * {@code server.servlet.session.timeout}. With the default "memory" store the
 * servlet container's own sessions are used instead.
 */
@Configuration
@ConditionalOnProperty(name = "portfolio.session-store", havingValue = "jdbc")
@EnableJdbcHttpSession
public class JdbcSessionConfig {

    @Bean
    CookieSerializer cookieSerializer(ServerProperties server) {
        Cookie cookie = server.getServlet().getSession().getCookie();
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName(cookie.getName() == null ? "PORTFOLIO_SESSION" : cookie.getName());
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(!Boolean.FALSE.equals(cookie.getHttpOnly()));
        serializer.setUseSecureCookie(Boolean.TRUE.equals(cookie.getSecure()));
        serializer.setSameSite(cookie.getSameSite() == null ? "Strict" : cookie.getSameSite().attributeValue());
        return serializer;
    }

    @Bean
    SessionRepositoryCustomizer<JdbcIndexedSessionRepository> sessionTimeout(ServerProperties server) {
        return repository -> repository.setDefaultMaxInactiveInterval(server.getServlet().getSession().getTimeout());
    }
}
