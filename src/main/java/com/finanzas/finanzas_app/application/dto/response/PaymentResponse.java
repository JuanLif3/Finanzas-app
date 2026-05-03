package com.finanzas.finanzas_app.application.dto.response;

import com.finanzas.finanzas_app.domain.enums.PaymentType;
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
public class PaymentResponse {
    private UUID id;
    private UUID userId;
    private CategoryResponse category;
    private AccountResponse account;
    private BigDecimal amount;
    private String description;
    private LocalDateTime date;
    private PaymentType type;
    private LocalDateTime createdAt;
}