package com.finanzas.finanzas_app.infrastructure.web.controller;

import com.finanzas.finanzas_app.application.dto.request.AddSavingsRequest;
import com.finanzas.finanzas_app.application.dto.request.CreateSavingGoalRequest;
import com.finanzas.finanzas_app.application.dto.response.AccountResponse;
import com.finanzas.finanzas_app.application.dto.response.SavingGoalResponse;
import com.finanzas.finanzas_app.application.service.SavingGoalService;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.SavingGoalEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saving-goals")
public class SavingGoalController {

    private final SavingGoalService savingGoalService;

    public SavingGoalController(SavingGoalService savingGoalService) {
        this.savingGoalService = savingGoalService;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<SavingGoalResponse> createSavingGoal(
            @PathVariable UUID userId,
            @Valid @RequestBody CreateSavingGoalRequest request) {

        SavingGoalEntity goal = savingGoalService.createSavingGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(goal));
    }

    @PostMapping("/{goalId}/user/{userId}/add")
    public ResponseEntity<SavingGoalResponse> addSavings(
            @PathVariable UUID goalId,
            @PathVariable UUID userId,
            @Valid @RequestBody AddSavingsRequest request) {

        SavingGoalEntity goal = savingGoalService.addSavings(goalId, userId, request);
        return ResponseEntity.ok(mapToResponse(goal));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavingGoalResponse>> getUserSavingGoals(@PathVariable UUID userId) {
        List<SavingGoalEntity> goals = savingGoalService.getUserSavingGoals(userId);

        List<SavingGoalResponse> responses = goals.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<SavingGoalResponse> getSavingGoalById(@PathVariable UUID goalId) {
        SavingGoalEntity goal = savingGoalService.getSavingGoalById(goalId);
        return ResponseEntity.ok(mapToResponse(goal));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteSavingGoal(@PathVariable UUID goalId) {
        savingGoalService.deleteSavingGoal(goalId);
        return ResponseEntity.noContent().build();
    }

    private SavingGoalResponse mapToResponse(SavingGoalEntity goal) {
        BigDecimal remainingAmount = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        BigDecimal percentageCompleted = BigDecimal.ZERO;

        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageCompleted = goal.getCurrentAmount()
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        AccountResponse accountResponse = AccountResponse.builder()
                .id(goal.getAccount().getId())
                .name(goal.getAccount().getName())
                .type(goal.getAccount().getType())
                .bank(goal.getAccount().getBank())
                .balance(goal.getAccount().getBalance())
                .creditLimit(goal.getAccount().getCreditLimit())
                .currentDebt(goal.getAccount().getCurrentDebt())
                .billingDay(goal.getAccount().getBillingDay())
                .paymentDueDay(goal.getAccount().getPaymentDueDay())
                .createdAt(goal.getAccount().getCreatedAt())
                .build();

        return SavingGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .remainingAmount(remainingAmount)
                .percentageCompleted(percentageCompleted)
                .deadline(goal.getDeadline())
                .account(accountResponse)
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .build();
    }
}