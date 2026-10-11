package tn.covoiturage.server.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.model.ActivityLog.ActionType;
import tn.covoiturage.server.model.Role;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.ActivityLogRepository;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository logRepository;

    public void logAction(String request, String status, String reason, User Actor, ActionType actionType) {
        String message;
        if(status.equals("SUCCESS")){
            message = String.format("%s %s %s made action '%s'. Status: %s.",
                Actor.getRole().toString(),Actor.getNom(),Actor.getPrenom(), request, status.toLowerCase());
        }else{
            message = String.format("%s %s %s tried to '%s'. Status: %s. Reason: %s",
                Actor.getRole().toString(),Actor.getNom(),Actor.getPrenom(), request, status, reason);
        }
        saveLog(Actor.getNom() + " " + Actor.getPrenom(), Actor.getRole(), actionType, message);
    }



    private void saveLog(String actor, Role role, ActionType type, String message) {
        ActivityLog log = new ActivityLog(actor, role, type, message, LocalDateTime.now());
        logRepository.save(log);
    }
}
