package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, UUID> {

    List<CategoryEntity> findByUser(UserEntity user);

    Optional<CategoryEntity> findByNameAndUser(String name, UserEntity user);

    boolean existsByNameAndUser(String name, UserEntity user);
}
