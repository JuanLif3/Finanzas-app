package com.finanzas.finanzas_app.application.dto.request;

import com.finanzas.finanzas_app.domain.enums.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class CreatePaymentRequest {

    @NotNull(message = "La categoría es obligatoria")
    private UUID categoryId;

    @NotNull(message = "La cuenta es obligatoria")
    private UUID accountId;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    private BigDecimal amount;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String description;

    private LocalDateTime date;

    @NotNull(message = "El tipo de pago es obligatorio")
    private PaymentType type;
}