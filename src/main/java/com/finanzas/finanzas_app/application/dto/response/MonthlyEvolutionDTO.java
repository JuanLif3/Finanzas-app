package com.finanzas.finanzas_app.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyEvolutionDTO {
    private String month;
    private int year;
    private BigDecimal totalExpenses;
    private BigDecimal totalIncome;
    private BigDecimal balance;
}