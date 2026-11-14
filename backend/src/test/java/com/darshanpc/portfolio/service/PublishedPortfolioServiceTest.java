package com.darshanpc.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.darshanpc.portfolio.entity.PortfolioPublication;
import com.darshanpc.portfolio.exception.ContentNotPublishedException;
import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Unit tests for the in-memory snapshot cache behind the public API. */
class PublishedPortfolioServiceTest {

    PortfolioPublicationRepository repository;
    PublishedPortfolioService service;

    @BeforeEach
    void setUp() {
        repository = mock(PortfolioPublicationRepository.class);
        service = new PublishedPortfolioService(repository, new ObjectMapper().registerModule(new JavaTimeModule()));
    }

    @Test
    void parsesEachVersionOnceAndReloadsWhenANewerOneIsPublished() {
        when(repository.findLatestVersionNumber()).thenReturn(Optional.of(1));
        when(repository.findByVersionNumber(1)).thenReturn(Optional.of(publication(1, null)));

        assertThat(service.current().version()).isEqualTo(1);
        assertThat(service.current().version()).isEqualTo(1);
        verify(repository, times(1)).findByVersionNumber(1);

        when(repository.findLatestVersionNumber()).thenReturn(Optional.of(2));
        when(repository.findByVersionNumber(2)).thenReturn(Optional.of(publication(2, null)));

        assertThat(service.current().version()).isEqualTo(2);
        assertThat(service.currentVersion()).isEqualTo(2);
    }

    @Test
    void assetIsPublicOnlyWhenTheLatestSnapshotReferencesIt() {
        UUID used = UUID.randomUUID();
        when(repository.findLatestVersionNumber()).thenReturn(Optional.of(1));
        when(repository.findByVersionNumber(1)).thenReturn(Optional.of(publication(1, "/api/v1/assets/" + used)));

        assertThat(service.referencesAsset(used)).isTrue();
        assertThat(service.referencesAsset(UUID.randomUUID())).isFalse();
    }

    @Test
    void nothingPublishedYieldsNotPublished() {
        when(repository.findLatestVersionNumber()).thenReturn(Optional.empty());

        assertThatThrownBy(service::current).isInstanceOf(ContentNotPublishedException.class);
        assertThatThrownBy(service::currentVersion).isInstanceOf(ContentNotPublishedException.class);
        assertThat(service.referencesAsset(UUID.randomUUID())).isFalse();
    }

    private static PortfolioPublication publication(int version, String photoUrl) {
        PortfolioPublication p = new PortfolioPublication();
        p.setVersionNumber(version);
        String photo = photoUrl == null ? "null" : "\"" + photoUrl + "\"";
        p.setSnapshot("{\"version\":" + version + ",\"profile\":{\"photoUrl\":" + photo + "}}");
        return p;
    }
}
