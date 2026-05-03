package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.repository.ActivityLogRepository;
import tn.covoiturage.server.model.Role;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/admin/activity-logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    /**
     * Get all activity logs
     */
    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findAllByOrderByTimestampDesc(pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by role (ADMIN or USER)
     */
    @GetMapping("/by-role")
    public ResponseEntity<Page<ActivityLog>> getLogsByRole(
            @RequestParam String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLog> logs = activityLogRepository.findByRole(roleEnum, pageable);

            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get logs by actor (user/admin name)
     */
    @GetMapping("/by-actor")
    public ResponseEntity<Page<ActivityLog>> getLogsByActor(
            @RequestParam String actor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findByActor(actor, pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by action type
     */
    @GetMapping("/by-type")
    public ResponseEntity<Page<ActivityLog>> getLogsByType(
            @RequestParam String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            ActivityLog.ActionType typeEnum = ActivityLog.ActionType.valueOf(type.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLog> logs = activityLogRepository.findByActionType(typeEnum, pageable);

            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get logs by severity (NORMAL or HIGH)
     */
    @GetMapping("/by-severity")
    public ResponseEntity<Page<ActivityLog>> getLogsBySeverity(
            @RequestParam String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            ActivityLog.Severity severityEnum = ActivityLog.Severity.valueOf(severity.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLog> logs = activityLogRepository.findBySeverity(severityEnum, pageable);

            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get high severity logs only
     */
    @GetMapping("/high-severity")
    public ResponseEntity<Page<ActivityLog>> getHighSeverityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findBySeverity(ActivityLog.Severity.HIGH, pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by date range
     */
    @GetMapping("/by-date-range")
    public ResponseEntity<Page<ActivityLog>> getLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);

            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLog> logs = activityLogRepository.findByTimestampBetween(start, end, pageable);

            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get logs by role and severity
     */
    @GetMapping("/by-role-and-severity")
    public ResponseEntity<Page<ActivityLog>> getLogsByRoleAndSeverity(
            @RequestParam String role,
            @RequestParam String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            ActivityLog.ActionType roleEnum = ActivityLog.ActionType.valueOf(role.toUpperCase());
            ActivityLog.Severity severityEnum = ActivityLog.Severity.valueOf(severity.toUpperCase());

            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLog> logs = activityLogRepository.findByRoleAndSeverity(roleEnum, severityEnum, pageable);

            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a single log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityLog> getLogById(@PathVariable Long id) {
        return activityLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}