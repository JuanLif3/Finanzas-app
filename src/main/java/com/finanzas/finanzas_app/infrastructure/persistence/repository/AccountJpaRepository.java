package com.finanzas.finanzas_app.infrastructure.persistence.repository;

import com.finanzas.finanzas_app.infrastructure.persistence.entity.AccountEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountJpaRepository extends JpaRepository<AccountEntity, UUID> {

    List<AccountEntity> findByUser(UserEntity user);

    List<AccountEntity> findByUserAndType(UserEntity user, String type);

    boolean existsByNameAndUser(String name, UserEntity user);
}
