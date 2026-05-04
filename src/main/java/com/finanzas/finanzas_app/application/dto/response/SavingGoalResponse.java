package com.finanzas.finanzas_app.application.dto.response;

import com.finanzas.finanzas_app.domain.enums.SavingGoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingGoalResponse {
    private UUID id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal percentageCompleted;
    private LocalDateTime deadline;
    private AccountResponse account;
    private SavingGoalStatus status;
    private LocalDateTime createdAt;
}