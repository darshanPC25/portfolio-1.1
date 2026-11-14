package com.darshanpc.portfolio.admin.support;

import com.darshanpc.portfolio.entity.BaseEntity;
import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.mapper.PortfolioSnapshotMapper;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Request/response types and helpers shared by the studio endpoints. */
public final class AdminSupport {

    private AdminSupport() {
    }

    /** New order for a list: every existing id exactly once, first to last. */
    public record ReorderRequest(@NotNull List<UUID> ids) {
    }

    /** Publish (show) or unpublish (hide) one item. */
    public record VisibilityRequest(boolean visible) {
    }

    /** An uploaded or external file as shown in the studio. */
    public record AssetResponse(
            UUID id,
            String url,
            String filename,
            String contentType,
            Long sizeBytes,
            Integer width,
            Integer height,
            Instant uploadedAt) {

        public static AssetResponse of(PortfolioAsset asset) {
            if (asset == null) {
                return null;
            }
            return new AssetResponse(
                    asset.getId(),
                    PortfolioSnapshotMapper.assetUrl(asset),
                    asset.getOriginalFilename(),
                    asset.getContentType(),
                    asset.getSizeBytes(),
                    asset.getWidth(),
                    asset.getHeight(),
                    asset.getCreatedAt());
        }
    }

    /**
     * Applies a new display order (1, 2, 3 …). The request must contain every
     * current item exactly once.
     */
    public static <T extends BaseEntity> void reorder(List<T> current, List<UUID> ids, BiConsumer<T, Integer> setOrder) {
        Map<UUID, T> byId = current.stream().collect(Collectors.toMap(BaseEntity::getId, Function.identity()));
        if (ids.size() != byId.size() || !byId.keySet().equals(new HashSet<>(ids))) {
            throw new BadRequestException("The new order must list every item exactly once.", null);
        }
        for (int i = 0; i < ids.size(); i++) {
            setOrder.accept(byId.get(ids.get(i)), i + 1);
        }
    }
}
