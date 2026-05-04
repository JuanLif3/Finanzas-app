package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.request.AddSavingsRequest;
import com.finanzas.finanzas_app.application.dto.request.CreateSavingGoalRequest;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.AccountEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.SavingGoalEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.AccountJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.SavingGoalJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class SavingGoalService {

    private final SavingGoalJpaRepository savingGoalRepository;
    private final UserJpaRepository userRepository;
    private final AccountJpaRepository accountRepository;

    public SavingGoalService(SavingGoalJpaRepository savingGoalRepository,
                             UserJpaRepository userRepository,
                             AccountJpaRepository accountRepository) {
        this.savingGoalRepository = savingGoalRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    public SavingGoalEntity createSavingGoal(UUID userId, CreateSavingGoalRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        AccountEntity account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("La cuenta no pertenece al usuario");
        }

        SavingGoalEntity goal = new SavingGoalEntity(
                user,
                request.getName(),
                request.getTargetAmount(),
                request.getDeadline(),
                account
        );

        return savingGoalRepository.save(goal);
    }

    @Transactional
    public SavingGoalEntity addSavings(UUID goalId, UUID userId, AddSavingsRequest request) {
        SavingGoalEntity goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta de ahorro no encontrada"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("La meta no pertenece al usuario");
        }

        if (goal.getStatus() == com.finanzas.finanzas_app.domain.enums.SavingGoalStatus.COMPLETED) {
            throw new RuntimeException("Esta meta ya está completada");
        }

        AccountEntity fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Cuenta de origen no encontrada"));

        if (!fromAccount.getUser().getId().equals(userId)) {
            throw new RuntimeException("La cuenta de origen no pertenece al usuario");
        }

        // Verificar saldo suficiente (solo para cuentas de débito/efectivo)
        if (fromAccount.getType() != com.finanzas.finanzas_app.domain.enums.AccountType.CREDIT) {
            if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Saldo insuficiente en la cuenta de origen");
            }
            fromAccount.subtractBalance(request.getAmount());
        }

        // Agregar a la meta
        goal.addSavings(request.getAmount());

        // También agregar a la cuenta asociada a la meta (donde se guarda el ahorro)
        AccountEntity goalAccount = goal.getAccount();
        goalAccount.addBalance(request.getAmount());

        accountRepository.save(fromAccount);
        accountRepository.save(goalAccount);

        return savingGoalRepository.save(goal);
    }

    public List<SavingGoalEntity> getUserSavingGoals(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return savingGoalRepository.findByUser(user);
    }

    public SavingGoalEntity getSavingGoalById(UUID goalId) {
        return savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta de ahorro no encontrada"));
    }

    public void deleteSavingGoal(UUID goalId) {
        SavingGoalEntity goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta de ahorro no encontrada"));
        savingGoalRepository.delete(goal);
    }
}