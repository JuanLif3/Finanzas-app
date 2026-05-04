package com.finanzas.finanzas_app.infrastructure.persistence.entity;

import com.finanzas.finanzas_app.domain.enums.BudgetPeriod;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
public class BudgetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal limitAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetPeriod period;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (startDate == null) {
            startDate = LocalDateTime.now();
        }
    }

    public BudgetEntity(UserEntity user, CategoryEntity category, BigDecimal limitAmount,
                        BudgetPeriod period, LocalDateTime startDate, LocalDateTime endDate) {
        this.user = user;
        this.category = category;
        this.limitAmount = limitAmount;
        this.period = period;
        this.startDate = startDate != null ? startDate : LocalDateTime.now();
        this.endDate = endDate;
    }
}
