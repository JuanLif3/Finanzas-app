package com.finanzas.finanzas_app.application.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class CreateSavingGoalRequest {

    @NotBlank(message = "El nombre de la meta es obligatorio")
    private String name;

    @NotNull(message = "El monto objetivo es obligatorio")
    @Positive(message = "El monto objetivo debe ser mayor a cero")
    private BigDecimal targetAmount;

    private LocalDateTime deadline;

    @NotNull(message = "La cuenta es obligatoria")
    private UUID accountId;
}