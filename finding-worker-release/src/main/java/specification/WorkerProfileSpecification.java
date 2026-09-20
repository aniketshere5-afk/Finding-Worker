package com.findingworker.specification;

import com.findingworker.entity.WorkerProfile;
import org.springframework.data.jpa.domain.Specification;
import com.findingworker.entity.Category;
import jakarta.persistence.criteria.Join;

import java.math.BigDecimal;

public class WorkerProfileSpecification {

    public static Specification<WorkerProfile> hasCity(String city) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("city")),
                        city.toLowerCase()
                );
    }

    public static Specification<WorkerProfile> isAvailable(boolean available) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("availableForWork"), available);
    }
    public static Specification<WorkerProfile> isVerified(boolean verified) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("verified"), verified);
    }
    public static Specification<WorkerProfile> hasMinimumExperience(Integer minExperience) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("experience"),
                        minExperience
                );
    }
    public static Specification<WorkerProfile> hasMaximumExperience(Integer maxExperience) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("experience"),
                        maxExperience
                );
    }
    public static Specification<WorkerProfile> hasMinimumHourlyRate(BigDecimal minRate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("hourlyRate"),
                        minRate
                );
    }

    public static Specification<WorkerProfile> hasMaximumHourlyRate(BigDecimal maxRate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("hourlyRate"),
                        maxRate
                );
    }
    public static Specification<WorkerProfile> hasCategory(String categoryName) {
        return (root, query, criteriaBuilder) -> {
            Join<WorkerProfile, Category> categoryJoin =
                    root.join("categories");

            return criteriaBuilder.equal(
                    criteriaBuilder.lower(categoryJoin.get("name")),
                    categoryName.toLowerCase()
            );
        };
    }
}