package com.findingworker.repository;

import com.findingworker.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findReviewsByWorkerId(Long id);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.worker.id = :workerId")
    Double getAverageRatingByWorkerId(@Param("workerId") Long workerId);

    long countByWorkerId(Long workerId);
}