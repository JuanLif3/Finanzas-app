package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.infrastructure.persistence.entity.SavingGoalEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingGoalJpaRepository extends JpaRepository<SavingGoalEntity, UUID> {

    List<SavingGoalEntity> findByUser(UserEntity user);

    List<SavingGoalEntity> findByUserAndStatus(UserEntity user, String status);
}