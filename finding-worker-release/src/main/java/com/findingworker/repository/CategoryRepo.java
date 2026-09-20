package com.findingworker.repository;

import com.findingworker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category, Long> {

    Category findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
