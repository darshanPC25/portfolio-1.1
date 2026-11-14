package com.darshanpc.portfolio.config;

import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** Background work: currently only sending notification emails. */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Small, bounded pool for outgoing email. If the queue ever fills, the caller
     * sends the email itself instead of dropping it.
     */
    @Bean(name = "mailExecutor")
    TaskExecutor mailExecutor(@Value("${portfolio.mail.async:true}") boolean async) {
        if (!async) {
            // AWS Lambda freezes once the response is sent: send the email before replying.
            return new SyncTaskExecutor();
        }
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("mail-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(20);
        return executor;
    }
}
