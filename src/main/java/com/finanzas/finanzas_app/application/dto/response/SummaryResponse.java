package com.finanzas.finanzas_app.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private BigDecimal totalExpenses;
    private BigDecimal totalIncome;
    private BigDecimal balance;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}