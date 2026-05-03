package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.application.dto.request.CreatePaymentRequest;
import com.finanzas.finanzas_app.domain.enums.AccountType;
import com.finanzas.finanzas_app.domain.enums.PaymentType;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.AccountEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.CategoryEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.PaymentEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.AccountJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.CategoryJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.PaymentJpaRepository;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentJpaRepository paymentRepository;
    private final UserJpaRepository userRepository;
    private final CategoryJpaRepository categoryRepository;
    private final AccountJpaRepository accountRepository;

    public PaymentService(PaymentJpaRepository paymentRepository,
                          UserJpaRepository userRepository,
                          CategoryJpaRepository categoryRepository,
                          AccountJpaRepository accountRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
    }

    // * Crear pago
    @Transactional
    public PaymentEntity createPayment(UUID userId, CreatePaymentRequest request) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(()-> new RuntimeException("Categoria no encontada"));

        AccountEntity account = accountRepository.findById(request.getAccountId())
                .orElseThrow(()->new RuntimeException("Cuenta no encontrada"));

        // Validar que la cuenta le pertenezca al usuario
        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("La cuenta no pertenece al usuario");
        }

        LocalDateTime paymentDate = request.getDate() != null ? request.getDate() : LocalDateTime.now();

        // Crear el pago
        PaymentEntity payment = new PaymentEntity(
                user, category, account, request.getAmount(),
                request.getDescription(), paymentDate, request.getType()
        );

        // Actualiazr salgo de la cuenta segun el tipo de pago y tipo de cuenta
        if (request.getType() == PaymentType.EXPENSE) {
            // Es un gasto
            if (account.getType() == AccountType.CREDIT) {
                account.addDebt(request.getAmount());
            } else {
                account.subtractBalance(request.getAmount());
            }
        } else {
            // Es un ingreso
            if (account.getType() == AccountType.CREDIT) {
                account.subtractDebt(request.getAmount());
            } else {
                account.addBalance(request.getAmount());
            }
        }

        accountRepository.save(account);
        return paymentRepository.save(payment);
    }

    // * Obetner usuarios por pagos
    public List<PaymentEntity> getUserPayments(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return paymentRepository.findByUserOrderByDateDesc(user);
    }

    // * Obener pagos de usuarios entre fechas
    public List<PaymentEntity> getUserPaymentsBetweenDates(UUID userId, LocalDateTime start, LocalDateTime end) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return paymentRepository.findByUserAndDateBetween(user, start, end);
    }

    // * Obtener el total de los gastos
    public BigDecimal getTotalExpenses(UUID userId, LocalDateTime start, LocalDateTime end) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return paymentRepository.getTotalExpensesBetween(user, start, end);
    }

    // * Obener el total de los ingresos
    public BigDecimal getTotalIncome(UUID userId, LocalDateTime start, LocalDateTime end) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return paymentRepository.getTotalIncomeBetween(user, start, end);
    }

    // * Eliminar pagos
    public void deletePayment(UUID paymentId) {
        PaymentEntity payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        paymentRepository.delete(payment);
    }
}
