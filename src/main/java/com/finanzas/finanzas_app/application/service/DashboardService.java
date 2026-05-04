package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.response.*;
import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.BudgetEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.AccountJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.BudgetJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.PaymentJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private final UserJpaRepository userRepository;
    private final PaymentJpaRepository paymentRepository;
    private final AccountJpaRepository accountRepository;
    private final BudgetJpaRepository budgetRepository;

    public DashboardService(UserJpaRepository userRepository,
                            PaymentJpaRepository paymentRepository,
                            AccountJpaRepository accountRepository,
                            BudgetJpaRepository budgetRepository) {
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
        this.budgetRepository = budgetRepository;
    }

    public DashboardSummaryDTO getDashboardSummary(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Fechas del mes actual
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);

        // Fecha de inicio para evolución (últimos 6 meses)
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6).withDayOfMonth(1);

        // Totales del mes
        BigDecimal totalExpenses = paymentRepository.getTotalExpensesBetween(user, startOfMonth, endOfMonth);
        BigDecimal totalIncome = paymentRepository.getTotalIncomeBetween(user, startOfMonth, endOfMonth);
        BigDecimal balance = totalIncome.subtract(totalExpenses);

        // Total ahorrado
        BigDecimal totalSaved = getTotalSaved(user);

        // Top 5 gastos por categoría
        List<CategoryExpenseDTO> topExpenses = new ArrayList<>();
        List<Object[]> expenseResults = paymentRepository.getExpensesByCategoryNative(userId, startOfMonth, endOfMonth);

        for (Object[] row : expenseResults) {
            UUID categoryId = (UUID) row[0];
            String categoryName = (String) row[1];
            String categoryColor = (String) row[2];
            BigDecimal totalAmount = (BigDecimal) row[3];

            CategoryExpenseDTO dto = CategoryExpenseDTO.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .categoryColor(categoryColor)
                    .totalAmount(totalAmount)
                    .percentage(0)
                    .build();
            topExpenses.add(dto);
        }

        // Calcular porcentajes
        if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            for (CategoryExpenseDTO expense : topExpenses) {
                int percentage = expense.getTotalAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalExpenses, 0, RoundingMode.HALF_UP)
                        .intValue();
                expense.setPercentage(percentage);
            }
        }

        // Evolución mensual
        List<MonthlyEvolutionDTO> monthlyEvolution = new ArrayList<>();
        List<Object[]> evolutionResults = paymentRepository.getMonthlyEvolutionNative(userId, sixMonthsAgo);

        for (Object[] row : evolutionResults) {
            String month = (String) row[0];
            Long year = ((Number) row[1]).longValue();
            BigDecimal totalExpensesMonth = (BigDecimal) row[2];
            BigDecimal totalIncomeMonth = (BigDecimal) row[3];

            MonthlyEvolutionDTO dto = MonthlyEvolutionDTO.builder()
                    .month(month)
                    .year(year.intValue())
                    .totalExpenses(totalExpensesMonth)
                    .totalIncome(totalIncomeMonth)
                    .balance(totalIncomeMonth.subtract(totalExpensesMonth))
                    .build();
            monthlyEvolution.add(dto);
        }

        // Alertas de presupuestos
        List<BudgetAlertDTO> budgetAlerts = getBudgetAlerts(user, startOfMonth, endOfMonth);

        // Alertas de tarjetas de crédito
        List<CreditCardAlertDTO> creditCardAlerts = getCreditCardAlerts(user);

        return DashboardSummaryDTO.builder()
                .totalExpensesThisMonth(totalExpenses)
                .totalIncomeThisMonth(totalIncome)
                .balanceThisMonth(balance)
                .totalSaved(totalSaved)
                .topExpensesByCategory(topExpenses)
                .monthlyEvolution(monthlyEvolution)
                .budgetAlerts(budgetAlerts)
                .creditCardAlerts(creditCardAlerts)
                .build();
    }

    private BigDecimal getTotalSaved(UserEntity user) {
        return accountRepository.findByUser(user).stream()
                .filter(account -> account.getType() == AccountType.CASH)
                .map(account -> account.getBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<BudgetAlertDTO> getBudgetAlerts(UserEntity user, LocalDateTime startOfMonth, LocalDateTime endOfMonth) {
        List<BudgetAlertDTO> alerts = new ArrayList<>();
        List<BudgetEntity> budgets = budgetRepository.findMonthlyBudgetsByUser(user);

        for (BudgetEntity budget : budgets) {
            BigDecimal spent = budgetRepository.getSpentInPeriod(user, budget.getCategory(), startOfMonth, endOfMonth);
            BigDecimal percentage = spent.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);

            if (percentage.compareTo(BigDecimal.valueOf(80)) >= 0) {
                String alertLevel = percentage.compareTo(BigDecimal.valueOf(100)) >= 0 ? "CRITICAL" : "WARNING";

                alerts.add(BudgetAlertDTO.builder()
                        .budgetId(budget.getId())
                        .categoryName(budget.getCategory().getName())
                        .categoryColor(budget.getCategory().getColor())
                        .limitAmount(budget.getLimitAmount())
                        .spentAmount(spent)
                        .percentageUsed(percentage)
                        .alertLevel(alertLevel)
                        .build());
            }
        }

        return alerts;
    }

    private List<CreditCardAlertDTO> getCreditCardAlerts(UserEntity user) {
        List<CreditCardAlertDTO> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        accountRepository.findByUser(user).stream()
                .filter(account -> account.getType() == AccountType.CREDIT)
                .forEach(account -> {
                    boolean isDueSoon = false;
                    LocalDate nextPaymentDueDate = null;

                    if (account.getPaymentDueDay() != null) {
                        int currentDay = today.getDayOfMonth();
                        int dueDay = account.getPaymentDueDay();

                        nextPaymentDueDate = calculateNextDueDate(today, dueDay);
                        isDueSoon = nextPaymentDueDate.isBefore(today.plusDays(5));
                    }

                    BigDecimal availableCredit = account.getCreditLimit().subtract(account.getCurrentDebt());

                    alerts.add(CreditCardAlertDTO.builder()
                            .accountId(account.getId())
                            .accountName(account.getName())
                            .bank(account.getBank().toString())
                            .currentDebt(account.getCurrentDebt())
                            .creditLimit(account.getCreditLimit())
                            .availableCredit(availableCredit)
                            .billingDay(account.getBillingDay())
                            .paymentDueDay(account.getPaymentDueDay())
                            .nextPaymentDueDate(nextPaymentDueDate)
                            .isDueSoon(isDueSoon)
                            .build());
                });

        return alerts;
    }

    private LocalDate calculateNextDueDate(LocalDate today, int dueDay) {
        LocalDate dueDateThisMonth = today.withDayOfMonth(dueDay);
        if (dueDateThisMonth.isBefore(today)) {
            return dueDateThisMonth.plusMonths(1);
        }
        return dueDateThisMonth;
    }
}