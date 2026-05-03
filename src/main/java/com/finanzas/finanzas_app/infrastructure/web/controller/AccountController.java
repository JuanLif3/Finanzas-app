package com.finanzas.finanzas_app.infrastructure.web.controller;

import com.finanzas.finanzas_app.application.dto.request.CreateAccountRequest;
import com.finanzas.finanzas_app.application.dto.response.AccountResponse;
import com.finanzas.finanzas_app.application.service.AccountService;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.AccountEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // * POST: Crear cuenta
    @PostMapping("/user/{userId}")
    public ResponseEntity<AccountResponse> createAccount(
            @PathVariable UUID userId,
            @Valid @RequestBody CreateAccountRequest request) {

        AccountEntity account = accountService.createAccount(userId, request);

        AccountResponse response = mapToResponse(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // * GET: Usuario por ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountResponse>> getUserAccounts(@PathVariable UUID userId) {
        List<AccountEntity> accounts = accountService.getUserAccounts(userId);

        List<AccountResponse> responses = accounts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // * GET: Cuentas por ID
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable UUID accountId) {
        AccountEntity account = accountService.getAccountById(accountId);
        return ResponseEntity.ok(mapToResponse(account));
    }

    // * DELETE: Eliminar cuentas
    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> delleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }

    private AccountResponse mapToResponse(AccountEntity account) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType())
                .bank(account.getBank())
                .balance(account.getBalance())
                .creditLimit(account.getCreditLimit())
                .currentDebt(account.getCurrentDebt())
                .billingDay(account.getBillingDay())
                .paymentDueDay(account.getPaymentDueDay())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
