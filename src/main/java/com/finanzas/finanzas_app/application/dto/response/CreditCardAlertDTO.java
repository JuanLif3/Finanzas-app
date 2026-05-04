package com.finanzas.finanzas_app.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardAlertDTO {
    private UUID accountId;
    private String accountName;
    private String bank;
    private BigDecimal currentDebt;
    private BigDecimal creditLimit;
    private BigDecimal availableCredit;
    private Integer billingDay;
    private Integer paymentDueDay;
    private LocalDate nextBillingDate;
    private LocalDate nextPaymentDueDate;
    private boolean isDueSoon;
}