package com.finanzas.finanzas_app.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal totalExpensesThisMonth;
    private BigDecimal totalIncomeThisMonth;
    private BigDecimal balanceThisMonth;
    private BigDecimal totalSaved;
    private List<CategoryExpenseDTO> topExpensesByCategory;
    private List<MonthlyEvolutionDTO> monthlyEvolution;
    private List<BudgetAlertDTO> budgetAlerts;
    private List<CreditCardAlertDTO> creditCardAlerts;
}