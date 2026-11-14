package com.darshanpc.portfolio.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class SingleLineValidator implements ConstraintValidator<SingleLine, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.chars().noneMatch(Character::isISOControl);
    }
}
