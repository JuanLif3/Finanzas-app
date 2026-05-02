package com.finanzas.finanzas_app.application.service;

import com.finanzas.finanzas_app.infrastructure.persistence.entity.UserEntity;
import com.finanzas.finanzas_app.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserJpaRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // * Crear usuario
    public UserEntity createUser(String name, String email, String rawPassword){
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("El email ya existe");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        UserEntity newUser = new UserEntity(name, email, encodedPassword);
        return userRepository.save(newUser);
    }

    // * Buscar usuario por email
    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // * Buscar usuario por ID
    public UserEntity findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // * Metodo para verificar contraseñas (Util para el login)
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
