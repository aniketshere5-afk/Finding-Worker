package com.findingworker.service;

import com.findingworker.entity.Booking;
import com.findingworker.entity.User;
import com.findingworker.enums.BookingStatus;
import com.findingworker.exception.BadRequestException;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.repository.BookingRepo;
import com.findingworker.repository.WorkerProfileRepo;
import com.findingworker.repository.UserRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepo bookingRepo;
    private final UserRepo userRepo;
    private final WorkerProfileRepo workerProfileRepo;

    private User getLoggedInUser(Authentication authentication){
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("Logged-in user not found"));
    }

    public BookingService(BookingRepo bookingRepo, UserRepo userRepo, WorkerProfileRepo workerProfileRepo) {
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.workerProfileRepo = workerProfileRepo;
    }

    public Booking createBooking(Booking booking, Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User customer = userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("Logged-in user not found!"));
        if (booking.getWorker() == null || booking.getWorker().getId() == null) {
            throw new BadRequestException("Worker is required for a booking");
        }

        WorkerProfile worker = workerProfileRepo.findById(booking.getWorker().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (!worker.isVerified()) {
            throw new BadRequestException("You can only book a verified worker");
        }

        if (!worker.isAvailableForWork()) {
            throw new BadRequestException("Worker is currently unavailable");
        }

        booking.setWorker(worker);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepo.save(booking);
    }

    public Booking updateBooking(Booking booking, Authentication authentication) {
        User user = getLoggedInUser(authentication);
        Booking existingBooking = bookingRepo.findById(booking.getId())
                .orElseThrow(()-> new ResourceNotFoundException("Booking not find"));
        if(!existingBooking.getCustomer().getId().equals(user.getId())){
            throw new BadRequestException("You can only update your booking");
        }
        if(existingBooking.getStatus() != BookingStatus.PENDING){
            throw new BadRequestException("Only pending bookings can be updated");
        }
        existingBooking.setServiceDate(booking.getServiceDate());
        existingBooking.setAddress(booking.getAddress());
        existingBooking.setDescription(booking.getDescription());
        return bookingRepo.save(existingBooking);
    }

    public Booking findBookingById(Long id, Authentication authentication) {

        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Id not found!"));
        User user = getLoggedInUser(authentication);

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(user.getId());

        if(!isWorker && !isCustomer){
            throw new BadRequestException("You are not authorized to access this booking !");
        }
        return booking;
    }

    public List<Booking> getBookingsByCustomerId(Long id, Authentication authentication){
        User user = getLoggedInUser(authentication);

        if(!user.getId().equals(id)){
            throw new BadRequestException("You can only access your bookings!");
        }
        return bookingRepo.findByCustomerId(id);
    }

    public List<Booking> getBookingsByWorkerId(Long id, Authentication authentication){

        User user = getLoggedInUser(authentication);

        if(!user.getId().equals(id)){
            throw new BadRequestException("You can only access your bookings!");
        }
        return bookingRepo.findByWorkerUserId(id);
    }

    public Booking updateBookingStatusById(Long id, BookingStatus bookingStatus, Authentication authentication){

        User user = getLoggedInUser(authentication);


        Booking booking = bookingRepo.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Booking not found!"));

        if(!booking.getWorker().getUser().getId().equals(user.getId())){
            throw new BadRequestException("You can only update your bookings!");
        }

        BookingStatus currentStatus = booking.getStatus();
        BookingStatus newStatus = bookingStatus;

        boolean validTransition = false;
        if(currentStatus == BookingStatus.PENDING){
            if(newStatus == BookingStatus.ACCEPTED || newStatus == BookingStatus.REJECTED){
                validTransition = true;
            }
        }
        else if(currentStatus == BookingStatus.ACCEPTED){
            if(newStatus == BookingStatus.COMPLETED){
                validTransition = true;
            }
        }

        if(!validTransition){
            throw new BadRequestException(
                    "Invalid Booking transition" + currentStatus +" -> "+ newStatus
            );
        }

        booking.setStatus(newStatus);
        return bookingRepo.save(booking);
    }

    public Booking cancelBooking(Long id, Authentication authentication){
        Booking booking = bookingRepo.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Booking doesn't exist !!"));

        User user = getLoggedInUser(authentication);

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(user.getId());
        BookingStatus currentStatus = booking.getStatus();

        if(!isWorker && !isCustomer){
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        if(currentStatus != BookingStatus.PENDING && currentStatus != BookingStatus.ACCEPTED){
            throw new BadRequestException("Booking can't be cancelled in "+ currentStatus + " Status");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepo.save(booking);
    }

}