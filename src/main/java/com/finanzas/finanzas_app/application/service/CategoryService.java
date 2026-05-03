package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.request.CreateCategoryRequest;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.CategoryJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryJpaRepository categoryRepository;
    private final UserJpaRepository userRepository;

    public CategoryService(CategoryJpaRepository categoryRepository, UserJpaRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // * Crear categoria
    public CategoryEntity createCategory(UUID userId, CreateCategoryRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if(categoryRepository.existsByNameAndUser(request.getName(), user)) {
            throw new RuntimeException("Ya exisye una categoria con ese nombre para este usuario");
        }

        CategoryEntity category = new CategoryEntity(
                request.getName(),
                request.getColor(),
                user
        );

        return categoryRepository.save(category);
    }

    // * Listar usuarios por categorias
    public List<CategoryEntity> getUserCategories(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return categoryRepository.findByUser(user);
    }

    // * Obtener categorias por ID
    public CategoryEntity getCategoryById(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    // * Eliminar categoria
    public void deleteCategory(UUID categoryId) {
        CategoryEntity category = getCategoryById(categoryId);
        categoryRepository.delete(category);
    }

    public CategoryEntity getCategoryByIdDebug(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría con ID " + categoryId + " no encontrada en BD"));
    }
}
