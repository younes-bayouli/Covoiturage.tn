package tn.covoiturage.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.model.Role;

import java.time.LocalDateTime;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // Role field is of type Role (not ActionType)
    Page<ActivityLog> findByRole(Role role, Pageable pageable);

    Page<ActivityLog> findByActor(String actor, Pageable pageable);

    // Field is named "actionType", not "type"
    Page<ActivityLog> findByActionType(ActivityLog.ActionType actionType, Pageable pageable);

    // "severity" field doesn't exist in ActivityLog — remove or add the field to
    // the entity
    Page<ActivityLog> findBySeverity(ActivityLog.Severity severity, Pageable pageable);

    Page<ActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Fix both types
    Page<ActivityLog> findByRoleAndActionType(Role role, ActivityLog.ActionType actionType, Pageable pageable);

    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
}