package com.darshanpc.portfolio.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** OpenAPI description. Swagger UI is enabled only in the dev profile. */
@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI portfolioOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Darshan Portfolio API")
                .version("v1")
                .description("Public, read-only portfolio content (published snapshot only) and the contact form."));
    }
}
