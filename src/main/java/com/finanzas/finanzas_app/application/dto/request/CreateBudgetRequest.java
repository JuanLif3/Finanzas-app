package com.finanzas.finanzas_app.application.dto.request;

import com.finanzas.finanzas_app.domain.enums.BudgetPeriod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CreateBudgetRequest {

    @NotNull(message = "La categoría es obligatoria")
    private UUID categoryId;

    @NotNull(message = "El monto límite es obligatorio")
    @Positive(message = "El monto límite debe ser mayor a cero")
    private BigDecimal limitAmount;

    @NotNull(message = "El período es obligatorio")
    private BudgetPeriod period;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}