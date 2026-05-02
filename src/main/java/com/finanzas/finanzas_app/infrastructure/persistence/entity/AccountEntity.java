package com.finanzas.finanzas_app.infrastructure.persistence.entity;
import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.domain.enums.Bank;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
public class AccountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Dueño de la cuenta
    private UserEntity user;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type; // DEBIT, CREDIT, CASH

    @Enumerated(EnumType.STRING)
    private Bank bank;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance; // Saldo actual (para débito/efectivo)

    // Campos específicos para cuenta de crédito
    @Column(precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(precision = 12, scale = 2)
    private BigDecimal currentDebt; // Deuda actual (solo para crédito)

    private Integer billingDay; // Día de facturación (1-31, solo crédito)

    private Integer paymentDueDay; // Día límite de pago (1-31, solo crédito)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public AccountEntity(UserEntity user, String name, AccountType type, Bank bank, BigDecimal balance) {
        this.user = user;
        this.name = name;
        this.type = type;
        this.bank = bank;
        this.balance = balance;

        // Inicializar valores por defecto según tipo
        if (type == AccountType.CREDIT) {
            this.creditLimit = BigDecimal.ZERO;
            this.currentDebt = BigDecimal.ZERO;
        }
    }

    // Métodos de negocio
    public void addBalance(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void subtractBalance(BigDecimal amount) {
        this.balance = this.balance.subtract(amount);
    }

    public void addDebt(BigDecimal amount) {
        this.currentDebt = this.currentDebt.add(amount);
    }

    public void subtractDebt(BigDecimal amount) {
        this.currentDebt = this.currentDebt.subtract(amount);
    }
}
