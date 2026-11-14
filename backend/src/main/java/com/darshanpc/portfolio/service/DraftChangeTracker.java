package com.darshanpc.portfolio.service;

import com.darshanpc.portfolio.repository.DraftStateRepository;
import java.time.Clock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Records that the draft changed. Every studio write calls {@link #markChanged()}. */
@Component
@RequiredArgsConstructor
public class DraftChangeTracker {

    private final DraftStateRepository draftState;
    private final Clock clock;

    @Transactional
    public void markChanged() {
        draftState.touch(clock.instant());
    }
}
