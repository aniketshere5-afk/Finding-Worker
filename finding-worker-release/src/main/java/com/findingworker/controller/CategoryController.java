package com.findingworker.controller;

import jakarta.validation.Valid;
import com.findingworker.entity.Category;
import com.findingworker.service.CategoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/create-category")
    @PreAuthorize("hasRole('ADMIN')")
    public Category createCategory(@Valid @RequestBody Category category) {
        return categoryService.createCategory(category);
    }

    @GetMapping("/get-category-by-id/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.findCategoryById(id);
    }

    @PutMapping("/update-category")
    @PreAuthorize("hasRole('ADMIN')")
    public Category updateCategory(@Valid @RequestBody Category category) {
        return categoryService.updateCategory(category);
    }

    @DeleteMapping("/delete-category-by-id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCategoryById(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    @GetMapping("/get-all-categories")
    public List<Category> getAllCategories(){
        return categoryService.getAllCategories();
    }

    @GetMapping("/get-category-by-name/{name}")
    public Category getCategoryByName(@PathVariable String name){
        return categoryService.getCategoryByName(name);
    }

    @GetMapping("/category-exists")
    public boolean categoryExists(@RequestParam String name) {
        return categoryService.categoryExists(name);
    }

}