package com.finanzas.finanzas_app.application.dto.request;

import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.domain.enums.Bank;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank(message = "El nombre de la cuenta es obligatorio")
    private String name;

    @NotNull(message = "El tipo de cuenta es obligatorio")
    private AccountType type;

    @NotNull(message = "El banco es obligatorio")
    private Bank bank;

    @NotNull(message = "El saldo inicial es obligatorio")
    @PositiveOrZero(message = "El saldo debe ser cero o positivo")
    private BigDecimal balance;

    // * Campos solo para crédito (opcionales)
    @PositiveOrZero(message = "El límite de crédito debe ser positivo")
    private BigDecimal creditLimit;

    private Integer billingDay;

    private Integer paymentDueDay;
}