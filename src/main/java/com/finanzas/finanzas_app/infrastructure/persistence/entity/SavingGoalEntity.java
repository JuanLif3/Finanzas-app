package com.finanzas.finanzas_app.infrastructure.persistence.entity;

import com.finanzas.finanzas_app.domain.enums.SavingGoalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saving_goals")
@Data
@NoArgsConstructor
public class SavingGoalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "target_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "current_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentAmount;

    private LocalDateTime deadline;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingGoalStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (currentAmount == null) {
            currentAmount = BigDecimal.ZERO;
        }
        if (status == null) {
            status = SavingGoalStatus.IN_PROGRESS;
        }
    }

    public SavingGoalEntity(UserEntity user, String name, BigDecimal targetAmount,
                            LocalDateTime deadline, AccountEntity account) {
        this.user = user;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = BigDecimal.ZERO;
        this.deadline = deadline;
        this.account = account;
        this.status = SavingGoalStatus.IN_PROGRESS;
    }

    // Método para agregar ahorro
    public void addSavings(BigDecimal amount) {
        this.currentAmount = this.currentAmount.add(amount);
        if (this.currentAmount.compareTo(this.targetAmount) >= 0) {
            this.status = SavingGoalStatus.COMPLETED;
        }
    }
}
