package com.darshanpc.portfolio.admin.editor;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.entity.ElementStyle;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.mapper.PortfolioSnapshotMapper;
import com.darshanpc.portfolio.repository.ElementStyleRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Draft formatting of individual page elements, set from the visual editor. */
@Service
@RequiredArgsConstructor
public class ElementStyleAdminService {

    /** Editor ids: lowercase start, then letters, digits, dots and dashes (UUIDs fit). */
    static final Pattern KEY = Pattern.compile("^[a-z][A-Za-z0-9.-]{0,119}$");
    static final Set<Integer> WEIGHTS = Set.of(300, 400, 500, 600, 700);
    /** Guards against unbounded growth; far above what one page needs. */
    static final int MAX_STYLES = 500;

    private final ElementStyleRepository styles;
    private final PortfolioSnapshotMapper mapper;
    private final DraftChangeTracker draftChanges;

    public record StyleRequest(
            String color,
            BigDecimal fontScale,
            Integer fontWeight,
            String textAlign,
            String fontFamily) {
    }

    @Transactional(readOnly = true)
    public Map<String, PortfolioResponse.ElementStyle> all() {
        Map<String, PortfolioResponse.ElementStyle> result = new TreeMap<>();
        styles.findAll().forEach(style -> result.put(style.getElementKey(), mapper.style(style)));
        return result;
    }

    /**
     * Creates, replaces or (when every attribute is empty) removes the style
     * for {@code key}. Returns the stored style, or null when removed.
     */
    @Transactional
    public PortfolioResponse.ElementStyle put(String key, StyleRequest request) {
        requireKey(key);
        String color = blank(request.color());
        String align = blank(request.textAlign());
        String family = blank(request.fontFamily());
        BigDecimal scale = request.fontScale();

        if (color != null && !color.matches("^#[0-9a-fA-F]{6}$")) {
            throw new BadRequestException("Use a colour like #3a4f25.", "color");
        }
        if (scale != null && (scale.compareTo(new BigDecimal("0.75")) < 0 || scale.compareTo(new BigDecimal("1.50")) > 0)) {
            throw new BadRequestException("Size must be between 75% and 150%.", "fontScale");
        }
        if (request.fontWeight() != null && !WEIGHTS.contains(request.fontWeight())) {
            throw new BadRequestException("Choose a weight of 300, 400, 500, 600 or 700.", "fontWeight");
        }
        if (align != null && !Set.of("start", "center", "end").contains(align)) {
            throw new BadRequestException("Alignment must be start, center or end.", "textAlign");
        }
        if (family != null && !Set.of("sans", "serif").contains(family)) {
            throw new BadRequestException("Typeface must be sans or serif.", "fontFamily");
        }

        if (color == null && scale == null && request.fontWeight() == null && align == null && family == null) {
            if (styles.existsById(key)) {
                styles.deleteById(key);
                draftChanges.markChanged();
            }
            return null;
        }

        ElementStyle style = styles.findById(key).orElseGet(() -> {
            if (styles.count() >= MAX_STYLES) {
                throw new BadRequestException("Too many formatted elements. Reset some formatting first.", null);
            }
            return new ElementStyle(key);
        });
        style.setColor(color == null ? null : color.toLowerCase());
        style.setFontScale(scale == null ? null : scale.setScale(2, RoundingMode.HALF_UP));
        style.setFontWeight(request.fontWeight());
        style.setTextAlign(align);
        style.setFontFamily(family);
        styles.save(style);
        draftChanges.markChanged();
        return mapper.style(style);
    }

    @Transactional
    public void delete(String key) {
        requireKey(key);
        if (styles.existsById(key)) {
            styles.deleteById(key);
            draftChanges.markChanged();
        }
    }

    private static void requireKey(String key) {
        if (key == null || !KEY.matcher(key).matches()) {
            throw new BadRequestException("Unknown element.", null);
        }
    }

    private static String blank(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
