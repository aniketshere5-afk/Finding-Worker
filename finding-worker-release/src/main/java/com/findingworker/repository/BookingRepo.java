package com.findingworker.repository;

import com.findingworker.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepo extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long id);
    List<Booking> findByWorkerUserId(Long id);
}
