package com.finanzas.finanzas_app.infrastructure.web.controller;

import com.finanzas.finanzas_app.application.dto.request.CreateBudgetRequest;
import com.finanzas.finanzas_app.application.dto.response.BudgetResponse;
import com.finanzas.finanzas_app.application.dto.response.CategoryResponse;
import com.finanzas.finanzas_app.application.service.BudgetService;
import com.finanzas.finanzas_app.domain.enums.BudgetPeriod;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.BudgetEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.BudgetJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetJpaRepository budgetRepository;
    private final UserJpaRepository userRepository;

    public BudgetController(BudgetService budgetService,
                            BudgetJpaRepository budgetRepository,
                            UserJpaRepository userRepository) {
        this.budgetService = budgetService;
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<BudgetResponse> createBudget(
            @PathVariable UUID userId,
            @Valid @RequestBody CreateBudgetRequest request) {

        BudgetEntity budget = budgetService.createBudget(userId, request);
        BudgetResponse response = mapToResponse(budget, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetResponse>> getUserBudgets(@PathVariable UUID userId) {
        List<BudgetEntity> budgets = budgetService.getUserBudgets(userId);

        List<BudgetResponse> responses = budgets.stream()
                .map(budget -> {
                    BigDecimal spent = budgetService.getSpentInCurrentPeriod(budget);
                    BigDecimal remaining = budget.getLimitAmount().subtract(spent);
                    BigDecimal percentage = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                            ? spent.multiply(BigDecimal.valueOf(100)).divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    CategoryResponse categoryResponse = CategoryResponse.builder()
                            .id(budget.getCategory().getId())
                            .name(budget.getCategory().getName())
                            .color(budget.getCategory().getColor())
                            .createdAt(budget.getCategory().getCreatedAt())
                            .build();

                    return BudgetResponse.builder()
                            .id(budget.getId())
                            .category(categoryResponse)
                            .limitAmount(budget.getLimitAmount())
                            .spentAmount(spent)
                            .remainingAmount(remaining)
                            .percentageUsed(percentage)
                            .period(budget.getPeriod())
                            .startDate(budgetService.getPeriodStart(budget.getPeriod()))
                            .endDate(budgetService.getPeriodEnd(budget.getPeriod()))
                            .createdAt(budget.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{budgetId}/user/{userId}")
    public ResponseEntity<BudgetResponse> getBudgetWithProgress(
            @PathVariable UUID budgetId,
            @PathVariable UUID userId) {

        BudgetEntity budget = budgetService.getBudgetById(budgetId);
        BudgetResponse response = mapToResponse(budget, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID budgetId) {
        budgetService.deleteBudget(budgetId);
        return ResponseEntity.noContent().build();
    }

    private BudgetResponse mapToResponse(BudgetEntity budget, UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Calcular el período actual
        LocalDateTime start = budget.getStartDate();
        LocalDateTime end = calculateEndDate(start, budget.getPeriod());

        // Obtener el gasto actual
        BigDecimal spent = budgetRepository.getSpentInPeriod(user, budget.getCategory(), start, end);

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        BigDecimal percentageUsed = BigDecimal.ZERO;

        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(budget.getCategory().getId())
                .name(budget.getCategory().getName())
                .color(budget.getCategory().getColor())
                .createdAt(budget.getCategory().getCreatedAt())
                .build();

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(categoryResponse)
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(percentageUsed)
                .period(budget.getPeriod())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate() != null ? budget.getEndDate() : end)
                .createdAt(budget.getCreatedAt())
                .build();
    }

    private LocalDateTime calculateEndDate(LocalDateTime start, BudgetPeriod period) {
        return switch (period) {
            case DAILY -> start.plusDays(1);
            case WEEKLY -> start.plusWeeks(1);
            case MONTHLY -> start.plusMonths(1);
            case YEARLY -> start.plusYears(1);
        };
    }
}
