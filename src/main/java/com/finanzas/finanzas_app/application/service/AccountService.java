package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.request.CreateAccountRequest;
import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.AccountEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.AccountJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountJpaRepository accountRepository;
    private final UserJpaRepository userRepository;

    public AccountService(AccountJpaRepository accountRepository, UserJpaRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    // * Crear cuenta
    public AccountEntity createAccount(UUID userId, CreateAccountRequest request) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if(accountRepository.existsByNameAndUser(request.getName(), user)) {
            throw new RuntimeException("Ya existe una cuenta con ese nombre para este usuario.");
        }

        AccountEntity account = new AccountEntity(
                user,
                request.getName(),
                request.getType(),
                request.getBank(),
                request.getBalance()
        );

        // Configurar campos especificos de credito
        if(request.getType() == AccountType.CREDIT) {
            account.setCreditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO);
            account.setCurrentDebt(BigDecimal.ZERO);
            account.setBillingDay(request.getBillingDay());
            account.setPaymentDueDay(request.getPaymentDueDay());
        }

        return accountRepository.save(account);
    }

    // * Traer a todos los usuarios por ID
    public List<AccountEntity> getUserAccounts(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return accountRepository.findByUser(user);
    }

    // * Traer a todas la cuentas por ID
    public AccountEntity getAccountById(UUID accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(()-> new RuntimeException("Cuenta no encontrada"));
    }

    // * Eliminar cuenta
    public void deleteAccount(UUID accoundID) {
        AccountEntity account = getAccountById(accoundID);
        accountRepository.delete(account);
    }
}
