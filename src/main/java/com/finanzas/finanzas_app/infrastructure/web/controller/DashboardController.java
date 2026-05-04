package com.finanzas.finanzas_app.infrastructure.web.controller;

import com.finanzas.finanzas_app.application.dto.response.DashboardSummaryDTO;
import com.finanzas.finanzas_app.application.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@PathVariable UUID userId) {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }
}