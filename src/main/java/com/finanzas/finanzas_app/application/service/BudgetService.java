package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.request.CreateBudgetRequest;
import com.finanzas.finanzas_app.domain.enums.BudgetPeriod;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.BudgetEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.BudgetJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.CategoryJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetJpaRepository budgetRepository;
    private final UserJpaRepository userRepository;
    private final CategoryJpaRepository categoryRepository;

    public BudgetService(BudgetJpaRepository budgetRepository,
                         UserJpaRepository userRepository,
                         CategoryJpaRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public BudgetEntity createBudget(UUID userId, CreateBudgetRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // Verificar si ya existe un presupuesto para esta categoría y período
        BudgetEntity existingBudget = budgetRepository
                .findByUserAndCategoryAndPeriod(user, category, request.getPeriod())
                .orElse(null);

        if (existingBudget != null) {
            throw new RuntimeException("Ya existe un presupuesto para esta categoría con período " + request.getPeriod());
        }

        BudgetEntity budget = new BudgetEntity(
                user,
                category,
                request.getLimitAmount(),
                request.getPeriod(),
                request.getStartDate(),
                request.getEndDate()
        );

        return budgetRepository.save(budget);
    }

    public List<BudgetEntity> getUserBudgets(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return budgetRepository.findByUser(user);
    }

    public BudgetEntity getBudgetById(UUID budgetId) {
        return budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
    }

    public void deleteBudget(UUID budgetId) {
        BudgetEntity budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        budgetRepository.delete(budget);
    }
}