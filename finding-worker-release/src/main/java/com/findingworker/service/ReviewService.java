package com.findingworker.service;

import com.findingworker.entity.Booking;
import com.findingworker.entity.Review;
import com.findingworker.entity.User;
import com.findingworker.enums.BookingStatus;
import com.findingworker.exception.BadRequestException;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.BookingRepo;
import com.findingworker.repository.ReviewRepo;
import com.findingworker.repository.UserRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepo reviewRepo;
    private final UserRepo userRepo;
    private final BookingRepo bookingRepo;

    public ReviewService(ReviewRepo reviewRepo, UserRepo userRepo, BookingRepo bookingRepo) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.bookingRepo = bookingRepo;
    }

    private User getLoggedInUser(Authentication authentication){
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));
    }

    public Review createReview(Review review, Authentication authentication) {
        if (review.getBooking() == null || review.getBooking().getId() == null) {
            throw new BadRequestException("Booking is required!");
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User customer = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found!"));

        Booking booking = bookingRepo.findById(review.getBooking().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found!"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("You can only review your own booking");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Review can only be created after Booking is completed!");
        }

        if (reviewRepo.existsByBookingId(booking.getId())) {
            throw new BadRequestException("Review already exists for this booking!");
        }

        review.setBooking(booking);
        review.setCustomer(customer);
        review.setWorker(booking.getWorker());
        return reviewRepo.save(review);
    }

    public Review updateReview(Review review, Authentication authentication){
        User user = getLoggedInUser(authentication);
        Review existingReview = reviewRepo.findById(review.getId())
                .orElseThrow(()-> new ResourceNotFoundException("Review not found"));

        if(!existingReview.getCustomer().getId().equals(user.getId())){
            throw new BadRequestException("You can only update your own review");
        }
        existingReview.setRating(review.getRating());
        existingReview.setComment(review.getComment());
        return reviewRepo.save(existingReview);
    }

    public Review findReviewById(Long id) {
        return reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review Id not found!"));
    }

    public void deleteReview(Long id, Authentication authentication){
        User user = getLoggedInUser(authentication);

        Review review = reviewRepo.findById(id)
                        .orElseThrow(()-> new ResourceNotFoundException("Review not found!"));
        if(!review.getCustomer().getId().equals(user.getId())){
            throw new BadRequestException("You can only delete your review");
        }

        reviewRepo.deleteById(id);
    }

    public List<Review> getReviewsByWorkerId(Long id){
        return reviewRepo.findReviewsByWorkerId(id);
    }

    public Double getAvgRatingByWorkerId(Long id){
        Double avgRating = reviewRepo.getAverageRatingByWorkerId(id);

        if(avgRating == null){
            return 0.0;
        }
        return avgRating;
    }

    public long getReviewCountByWorkerId(Long workerId){
        return reviewRepo.countByWorkerId(workerId);
    }

}