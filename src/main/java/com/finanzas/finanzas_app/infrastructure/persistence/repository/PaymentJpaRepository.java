package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.infrastructure.persistence.entity.PaymentEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, UUID> {

    List<PaymentEntity> findByUserOrderByDateDesc(UserEntity user);

    List<PaymentEntity> findByUserAndDateBetween(UserEntity user, LocalDateTime start, LocalDateTime end);

    List<PaymentEntity> findByUserAndCategoryId(UserEntity user, UUID categoryId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.user = :user AND p.type = 'EXPENSE' AND p.date BETWEEN :start AND :end")
    BigDecimal getTotalExpensesBetween(@Param("user") UserEntity user,
                                       @Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.user = :user AND p.type = 'INCOME' AND p.date BETWEEN :start AND :end")
    BigDecimal getTotalIncomeBetween(@Param("user") UserEntity user,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);
}