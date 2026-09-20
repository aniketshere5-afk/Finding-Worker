package com.findingworker.controller;

import jakarta.validation.Valid;
import com.findingworker.entity.Booking;
import com.findingworker.enums.BookingStatus;
import com.findingworker.service.BookingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }


    @PostMapping("/create-booking")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Booking createBooking(@Valid @RequestBody Booking booking, Authentication authentication) {
        return bookingService.createBooking(booking, authentication);
    }

    @GetMapping("/get-booking-by-id/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public Booking getBookingById(@PathVariable Long id, Authentication authentication) {
        return bookingService.findBookingById(id, authentication);
    }

    @PutMapping("/update-booking")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Booking updateBooking(@Valid @RequestBody Booking booking, Authentication authentication) {
        return bookingService.updateBooking(booking, authentication);
    }

    @GetMapping("/get-bookings-by-customer-id/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<Booking> findBookingByCustomerId(@PathVariable Long id, Authentication authentication){
        return bookingService.getBookingsByCustomerId(id, authentication);
    }

    @GetMapping("/get-bookings-by-worker-id/{id}")
    @PreAuthorize("hasRole('WORKER')")
    public List<Booking> findBookingByWorkerId(@PathVariable Long id, Authentication authentication){
        return bookingService.getBookingsByWorkerId(id, authentication);
    }


    @PutMapping("/update-booking-status/{id}/{bookingStatus}")
    @PreAuthorize("hasRole('WORKER')")
    public Booking updateBookingStatus(@PathVariable Long id, @PathVariable BookingStatus bookingStatus, Authentication authentication){
        return bookingService.updateBookingStatusById(id, bookingStatus, authentication);
    }

    @PutMapping("/cancel-booking/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'WORKER')")
    public Booking cancelBooking(@PathVariable Long id, Authentication authentication){
        return bookingService.cancelBooking(id, authentication);
    }
}