package tn.covoiturage.server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import tn.covoiturage.server.model.Role;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor")
    private String actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type")
    private ActionType actionType;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity")
    private Severity severity = Severity.NORMAL;

    public enum Severity {
        NORMAL,
        HIGH
    }

    public enum ActionType {
        LOGIN,
        LOGOUT,
        REGISTER,
        CREATE,
        READ,
        UPDATE,
        DELETE,
        OTHER,
    }

    public ActivityLog() {
    }

    public ActivityLog(String actor, Role role, ActionType actionType, String message, LocalDateTime timestamp) {
        this.actor = actor;
        this.role = role;
        this.actionType = actionType;
        this.message = message;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Severity getSeverity(){
        return this.severity;
    }

    public void setSeverity(Severity severity){
        this.severity=severity;
    }
}