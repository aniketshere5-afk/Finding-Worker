package com.findingworker.controller;

import jakarta.validation.Valid;
import com.findingworker.entity.Review;
import com.findingworker.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/create-review")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Review createReview(@Valid @RequestBody Review review, Authentication authentication) {
        return reviewService.createReview(review, authentication);
    }

    @GetMapping("/get-review-by-id/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public Review getReviewById(@PathVariable Long id) {
        return reviewService.findReviewById(id);
    }

    @PutMapping("/update-review")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Review updateReview(@Valid @RequestBody Review review, Authentication authentication) {
        return reviewService.updateReview(review, authentication);
    }

    @DeleteMapping("/delete-review-by-id/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public void deleteReviewById(@PathVariable Long id, Authentication authentication){
        reviewService.deleteReview(id, authentication);
    }

    @GetMapping("/get-reviews-by-worker-id/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public List<Review> getReviewsByWorkerId(@PathVariable Long id){
        return reviewService.getReviewsByWorkerId(id);
    }

    @GetMapping("/get-worker-rating/{workerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public Double getAvgRatingByWorkerId(@PathVariable Long workerId){
        return reviewService.getAvgRatingByWorkerId(workerId);
    }

    @GetMapping("/get-worker-review-count/{workerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public long getReviewCount(@PathVariable Long workerId){
        return reviewService.getReviewCountByWorkerId(workerId);
    }
}