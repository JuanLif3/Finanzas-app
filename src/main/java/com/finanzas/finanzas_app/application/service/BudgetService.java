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
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
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

    // Método para obtener el inicio del período según la fecha actual
    public LocalDateTime getPeriodStart(BudgetPeriod period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period) {
            case DAILY -> now.withHour(0).withMinute(0).withSecond(0).withNano(0);
            case WEEKLY -> now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            case MONTHLY -> now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            case YEARLY -> now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        };
    }

    // Método para obtener el fin del período según la fecha actual
    public LocalDateTime getPeriodEnd(BudgetPeriod period) {
        LocalDateTime start = getPeriodStart(period);
        return switch (period) {
            case DAILY -> start.plusDays(1).minusNanos(1);
            case WEEKLY -> start.plusWeeks(1).minusNanos(1);
            case MONTHLY -> start.plusMonths(1).minusNanos(1);
            case YEARLY -> start.plusYears(1).minusNanos(1);
        };
    }

    // Método para calcular el gasto real de un presupuesto en el período actual
    public BigDecimal getSpentInCurrentPeriod(BudgetEntity budget) {
        LocalDateTime start = getPeriodStart(budget.getPeriod());
        LocalDateTime end = getPeriodEnd(budget.getPeriod());

        return budgetRepository.getSpentInPeriod(
                budget.getUser(),
                budget.getCategory(),
                start,
                end
        );
    }
}