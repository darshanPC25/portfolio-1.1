package com.darshanpc.portfolio.admin.profile;

import com.darshanpc.portfolio.admin.profile.ProfileAdminDtos.ProfileRequest;
import com.darshanpc.portfolio.admin.profile.ProfileAdminDtos.ProfileResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.entity.PortfolioProfile;
import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.repository.PortfolioProfileRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import com.darshanpc.portfolio.service.asset.AssetStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Draft profile, profile photo and resume. Changes go live when published. */
@Service
@RequiredArgsConstructor
public class ProfileAdminService {

    private final PortfolioProfileRepository profiles;
    private final AssetStorageService storage;
    private final DraftChangeTracker draftChanges;

    @Transactional(readOnly = true)
    public ProfileResponse get() {
        return toResponse(profile());
    }

    @Transactional
    public ProfileResponse update(ProfileRequest request) {
        PortfolioProfile profile = profile();
        profile.setFullName(request.fullName());
        profile.setPreferredName(request.preferredName());
        profile.setTitle(request.title());
        profile.setLocation(request.location());
        profile.setPhotoAlt(request.photoAlt());
        profile.setPublicEmail(request.publicEmail());
        profile.setAvailable(request.available());
        profile.setAvailabilityLabel(request.availabilityLabel());
        profile.setGithubUsername(request.githubUsername());
        profile.setCopyrightText(request.copyrightText());
        profile.setFooterNote(request.footerNote());
        draftChanges.markChanged();
        return toResponse(profile);
    }

    /**
     * Replaces the profile photo. The previous file is kept, because the
     * currently published version may still show it.
     */
    @Transactional
    public ProfileResponse replacePhoto(MultipartFile file) {
        PortfolioProfile profile = profile();
        PortfolioAsset photo = storage.store(file, AssetKind.IMAGE, profile.getPhotoAlt());
        profile.setPhoto(photo);
        draftChanges.markChanged();
        return toResponse(profile);
    }

    /** Sets the optional dark-theme photo. The previous file is kept, like {@link #replacePhoto}. */
    @Transactional
    public ProfileResponse replaceDarkPhoto(MultipartFile file) {
        PortfolioProfile profile = profile();
        profile.setPhotoDark(storage.store(file, AssetKind.IMAGE, profile.getPhotoAlt()));
        draftChanges.markChanged();
        return toResponse(profile);
    }

    /** Removes the dark-theme photo; the regular photo is then shown in both themes. */
    @Transactional
    public ProfileResponse removeDarkPhoto() {
        PortfolioProfile profile = profile();
        profile.setPhotoDark(null);
        draftChanges.markChanged();
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public AssetResponse resume() {
        return AssetResponse.of(profile().getResume());
    }

    @Transactional
    public AssetResponse replaceResume(MultipartFile file) {
        PortfolioProfile profile = profile();
        PortfolioAsset resume = storage.store(file, AssetKind.DOCUMENT, null);
        profile.setResume(resume);
        draftChanges.markChanged();
        return AssetResponse.of(resume);
    }

    @Transactional
    public void removeResume() {
        profile().setResume(null);
        draftChanges.markChanged();
    }

    private PortfolioProfile profile() {
        return profiles.findFirstBy().orElseThrow(() -> new IllegalStateException("No profile row exists"));
    }

    private static ProfileResponse toResponse(PortfolioProfile p) {
        return new ProfileResponse(
                p.getFullName(), p.getPreferredName(), p.getTitle(), p.getLocation(),
                AssetResponse.of(p.getPhoto()), AssetResponse.of(p.getPhotoDark()), p.getPhotoAlt(), AssetResponse.of(p.getResume()),
                p.getPublicEmail(), p.isAvailable(), p.getAvailabilityLabel(), p.getGithubUsername(),
                p.getCopyrightText(), p.getFooterNote(), p.getUpdatedAt());
    }
}
