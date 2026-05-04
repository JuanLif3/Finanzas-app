package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.application.dto.response.CategoryExpenseDTO;
import com.finanzas.finanzas_app.application.dto.response.MonthlyEvolutionDTO;
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

    // Consulta nativa para gastos por categoría
    @Query(value = "SELECT c.id as categoryId, c.name as categoryName, c.color as categoryColor, " +
            "COALESCE(SUM(p.amount), 0) as totalAmount " +
            "FROM payments p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.user_id = :userId " +
            "AND p.type = 'EXPENSE' " +
            "AND p.date BETWEEN :start AND :end " +
            "GROUP BY c.id, c.name, c.color " +
            "ORDER BY totalAmount DESC " +
            "LIMIT 5", nativeQuery = true)
    List<Object[]> getExpensesByCategoryNative(@Param("userId") UUID userId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    // Consulta nativa para evolución mensual
    @Query(value = "SELECT TO_CHAR(p.date, 'YYYY-MM') as month, " +
            "EXTRACT(YEAR FROM p.date) as year, " +
            "COALESCE(SUM(CASE WHEN p.type = 'EXPENSE' THEN p.amount ELSE 0 END), 0) as totalExpenses, " +
            "COALESCE(SUM(CASE WHEN p.type = 'INCOME' THEN p.amount ELSE 0 END), 0) as totalIncome " +
            "FROM payments p " +
            "WHERE p.user_id = :userId " +
            "AND p.date >= :startDate " +
            "GROUP BY TO_CHAR(p.date, 'YYYY-MM'), EXTRACT(YEAR FROM p.date), EXTRACT(MONTH FROM p.date) " +
            "ORDER BY year DESC, EXTRACT(MONTH FROM p.date) DESC " +
            "LIMIT 6", nativeQuery = true)
    List<Object[]> getMonthlyEvolutionNative(@Param("userId") UUID userId,
                                             @Param("startDate") LocalDateTime startDate);
}