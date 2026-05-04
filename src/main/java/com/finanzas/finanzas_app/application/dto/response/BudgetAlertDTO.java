package com.finanzas.finanzas_app.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlertDTO {
    private UUID budgetId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal percentageUsed;
    private String alertLevel; // WARNING, CRITICAL
}