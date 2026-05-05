package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.domain.enums.BudgetPeriod;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.BudgetEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetJpaRepository extends JpaRepository<BudgetEntity, UUID> {

    List<BudgetEntity> findByUser(UserEntity user);

    List<BudgetEntity> findByUserAndPeriod(UserEntity user, BudgetPeriod period);

    Optional<BudgetEntity> findByUserAndCategoryAndPeriod(UserEntity user, CategoryEntity category, BudgetPeriod period);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.user = :user AND p.category = :category AND p.type = 'EXPENSE' AND p.date BETWEEN :start AND :end")
    BigDecimal getSpentInPeriod(@Param("user") UserEntity user,
                                @Param("category") CategoryEntity category,
                                @Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end);

    @Query("SELECT b FROM BudgetEntity b WHERE b.user = :user AND b.period = 'MONTHLY'")
    List<BudgetEntity> findMonthlyBudgetsByUser(@Param("user") UserEntity user);

}