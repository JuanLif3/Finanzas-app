package com.finanzas.finanzas_app.application.dto.response;

import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.domain.enums.Bank;
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
public class AccountResponse {
    private UUID id;
    private String name;
    private AccountType type;
    private Bank bank;
    private BigDecimal balance;
    private BigDecimal creditLimit;
    private BigDecimal currentDebt;
    private Integer billingDay;
    private Integer paymentDueDay;
    private LocalDateTime createdAt;
}