package com.finanzas.finanzas_app.infrastructure.web.controller;
import com.finanzas.finanzas_app.application.dto.request.CreatePaymentRequest;
import com.finanzas.finanzas_app.application.dto.response.AccountResponse;
import com.finanzas.finanzas_app.application.dto.response.CategoryResponse;
import com.finanzas.finanzas_app.application.dto.response.PaymentResponse;
import com.finanzas.finanzas_app.application.dto.response.SummaryResponse;
import com.finanzas.finanzas_app.application.service.PaymentService;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.PaymentEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable UUID userId,
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentEntity payment = paymentService.createPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(payment));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getUserPayments(@PathVariable UUID userId) {
        List<PaymentEntity> payments = paymentService.getUserPayments(userId);

        List<PaymentResponse> responses = payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<SummaryResponse> getSummary(@PathVariable UUID userId) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = LocalDateTime.now().withDayOfMonth(1).plusMonths(1).minusSeconds(1);

        BigDecimal totalExpenses = paymentService.getTotalExpenses(userId, startOfMonth, endOfMonth);
        BigDecimal totalIncome = paymentService.getTotalIncome(userId, startOfMonth, endOfMonth);
        BigDecimal balance = totalIncome.subtract(totalExpenses);

        SummaryResponse summary = SummaryResponse.builder()
                .totalExpenses(totalExpenses)
                .totalIncome(totalIncome)
                .balance(balance)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .build();

        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }

    private PaymentResponse mapToResponse(PaymentEntity payment) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(payment.getCategory().getId())
                .name(payment.getCategory().getName())
                .color(payment.getCategory().getColor())
                .createdAt(payment.getCategory().getCreatedAt())
                .build();

        AccountResponse accountResponse = AccountResponse.builder()
                .id(payment.getAccount().getId())
                .name(payment.getAccount().getName())
                .type(payment.getAccount().getType())
                .bank(payment.getAccount().getBank())
                .balance(payment.getAccount().getBalance())
                .creditLimit(payment.getAccount().getCreditLimit())
                .currentDebt(payment.getAccount().getCurrentDebt())
                .billingDay(payment.getAccount().getBillingDay())
                .paymentDueDay(payment.getAccount().getPaymentDueDay())
                .createdAt(payment.getAccount().getCreatedAt())
                .build();

        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUser().getId())
                .category(categoryResponse)
                .account(accountResponse)
                .amount(payment.getAmount())
                .description(payment.getDescription())
                .date(payment.getDate())
                .type(payment.getType())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}