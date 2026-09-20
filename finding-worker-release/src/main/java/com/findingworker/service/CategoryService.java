package com.findingworker.service;

import com.findingworker.entity.Category;
import com.findingworker.exception.BadRequestException;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.CategoryRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepo categoryRepo;

    public CategoryService(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    public Category createCategory(Category category) {
        if (categoryRepo.existsByNameIgnoreCase(category.getName())) {
            throw new BadRequestException("Category already exists!");
        }
        return categoryRepo.save(category);
    }

    public Category updateCategory(Category category) {
        if (category.getId() == null) {
            throw new BadRequestException("Category id is required for update");
        }

        Category existingCategory = categoryRepo.findById(category.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category Id not found!"));

        Category categoryWithSameName = categoryRepo.findByNameIgnoreCase(category.getName());
        if (categoryWithSameName != null
                && !categoryWithSameName.getId().equals(existingCategory.getId())) {
            throw new BadRequestException("Category already exists!");
        }

        existingCategory.setName(category.getName());
        return categoryRepo.save(existingCategory);
    }

    public Category findCategoryById(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category Id not found!"));
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Category doesn't exist"));
        if (!category.getWorkers().isEmpty()) {
            throw new BadRequestException("Category is assigned to workers and cannot be deleted!");
        }
        categoryRepo.deleteById(id);
    }

    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    public Category getCategoryByName(String name) {
        return categoryRepo.findByNameIgnoreCase(name);
    }

    public boolean categoryExists(String name) {
        return categoryRepo.existsByNameIgnoreCase(name);
    }
}