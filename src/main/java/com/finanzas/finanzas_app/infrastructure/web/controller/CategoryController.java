package com.finanzas.finanzas_app.infrastructure.web.controller;

import com.finanzas.finanzas_app.application.dto.request.CreateCategoryRequest;
import com.finanzas.finanzas_app.application.dto.response.CategoryResponse;
import com.finanzas.finanzas_app.application.service.CategoryService;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // * POST: Crear categoria
    @PostMapping("/user/{userId}")
    public ResponseEntity<CategoryResponse> createCategory(
            @PathVariable UUID userId,
            @Valid @RequestBody CreateCategoryRequest request) {

        CategoryEntity category = categoryService.createCategory(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(category));
    }

    // * GET: Obtener usuario por categoria
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CategoryResponse>> getUserCategories(@PathVariable UUID userId) {
        List<CategoryEntity> category = categoryService.getUserCategories(userId);

        List<CategoryResponse> responses = category.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // * GET: Obtener categoria por ID
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable UUID categoryId) {
        CategoryEntity category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(mapToResponse(category));
    }

    // * DELTE: Eliminar categoria
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    private CategoryResponse mapToResponse(CategoryEntity category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
