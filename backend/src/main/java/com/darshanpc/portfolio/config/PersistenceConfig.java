package com.darshanpc.portfolio.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** Fills created_at / updated_at automatically and provides the application clock. */
@Configuration
@EnableJpaAuditing
public class PersistenceConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
